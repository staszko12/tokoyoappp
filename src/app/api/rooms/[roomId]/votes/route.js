import db from '@/lib/db';
import { generateItinerary } from '@/services/geminiService';

/**
 * POST /api/rooms/:roomId/votes - Submit user's votes
 */
export async function POST(request, { params }) {
    try {
        const { roomId } = await params;
        const body = await request.json();
        const { userId, userName, votes } = body;

        if (!userId || !votes) {
            return Response.json({
                error: 'userId and votes are required'
            }, { status: 400 });
        }

        const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(roomId);

        if (!room) {
            return Response.json({
                error: 'Room not found'
            }, { status: 404 });
        }

        // Verify user is in room
        const user = db.prepare('SELECT * FROM users WHERE id = ? AND room_id = ?').get(userId, roomId);
        if (!user) {
            return Response.json({
                error: 'User not found in room'
            }, { status: 403 });
        }

        // Transaction to save votes and update status
        const insertVote = db.prepare('INSERT INTO votes (room_id, user_id, place_id, place_data, vote_count) VALUES (?, ?, ?, ?, ?)');
        const updateUser = db.prepare('UPDATE users SET is_ready = 1 WHERE id = ?');

        db.transaction(() => {
            // Delete existing votes for this user (if any)
            db.prepare('DELETE FROM votes WHERE user_id = ?').run(userId);

            // Insert new votes
            votes.forEach(vote => {
                insertVote.run(roomId, userId, vote.placeId, JSON.stringify(vote), vote.votes);
            });

            // Mark user as ready
            updateUser.run(userId);
        })();

        // Check if all 5 users are ready
        const users = db.prepare('SELECT * FROM users WHERE room_id = ?').all(roomId);
        const allReady = users.length === 5 && users.every(u => u.is_ready === 1);

        let itinerary = null;
        if (room.itinerary) {
            itinerary = JSON.parse(room.itinerary);
        }

        if (allReady && !room.itinerary) {
            // Aggregate votes from all users
            const allVotes = db.prepare('SELECT * FROM votes WHERE room_id = ?').all(roomId);
            const aggregatedVotes = aggregateVotes(allVotes);

            // Generate itinerary with Gemini
            try {
                itinerary = await generateItinerary(aggregatedVotes);

                // Save itinerary and update status
                db.prepare('UPDATE rooms SET itinerary = ?, status = ? WHERE id = ?')
                    .run(JSON.stringify(itinerary), 'completed', roomId);

            } catch (error) {
                console.error('Error generating group itinerary:', error);
                db.prepare('UPDATE rooms SET status = ? WHERE id = ?').run('error', roomId);
            }
        }

        return Response.json({
            success: true,
            userId,
            isReady: true,
            votesSubmitted: votes.length,
            totalUsers: users.length,
            allReady,
            itinerary
        });
    } catch (error) {
        console.error('Error submitting votes:', error);
        return Response.json({
            error: 'Failed to submit votes'
        }, { status: 500 });
    }
}

/**
 * GET /api/rooms/:roomId/votes - Get all votes for room
 */
export async function GET(request, { params }) {
    const { roomId } = await params;

    const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(roomId);

    if (!room) {
        return Response.json({
            error: 'Room not found'
        }, { status: 404 });
    }

    // Get all votes
    const votes = db.prepare(`
        SELECT v.*, u.name as userName 
        FROM votes v 
        JOIN users u ON v.user_id = u.id 
        WHERE v.room_id = ?
    `).all(roomId);

    // Group by user
    const votesByUser = {};
    votes.forEach(v => {
        if (!votesByUser[v.user_id]) {
            votesByUser[v.user_id] = {
                userId: v.user_id,
                userName: v.userName,
                votes: []
            };
        }
        votesByUser[v.user_id].votes.push({
            ...JSON.parse(v.place_data),
            votes: v.vote_count
        });
    });

    return Response.json({
        success: true,
        votes: Object.values(votesByUser),
        totalVotes: votes.length
    });
}

/**
 * Aggregate votes from all users
 */
function aggregateVotes(allVotes) {
    const combined = new Map();

    allVotes.forEach(row => {
        const voteData = JSON.parse(row.place_data);
        const existing = combined.get(row.place_id) || {
            ...voteData,
            votes: 0,
            voters: []
        };

        existing.votes += row.vote_count;
        existing.voters.push(row.user_id);

        combined.set(row.place_id, existing);
    });

    // Convert to array and sort by votes
    return Array.from(combined.values())
        .sort((a, b) => b.votes - a.votes);
}
