import { rooms } from '@/lib/roomStorage';
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

        const room = rooms.get(roomId);

        if (!room) {
            return Response.json({
                error: 'Room not found'
            }, { status: 404 });
        }

        // Verify user is in room
        const user = room.users.find(u => u.userId === userId);
        if (!user) {
            return Response.json({
                error: 'User not found in room'
            }, { status: 403 });
        }

        // Store votes
        room.votes.set(userId, votes);

        // Mark user as ready
        user.isReady = true;

        // Check if all 5 users are ready
        const allReady = room.users.length === 5 && room.users.every(u => u.isReady);

        if (allReady && !room.itinerary) {
            // Aggregate votes from all users
            const aggregatedVotes = aggregateVotes(room.votes);

            // Generate itinerary with Gemini
            try {
                const itinerary = await generateItinerary(aggregatedVotes);
                room.itinerary = itinerary;
                room.status = 'completed';
            } catch (error) {
                console.error('Error generating group itinerary:', error);
                room.status = 'error';
            }
        }

        return Response.json({
            success: true,
            userId,
            isReady: user.isReady,
            votesSubmitted: room.votes.size,
            totalUsers: room.users.length,
            allReady,
            itinerary: room.itinerary
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

    const room = rooms.get(roomId);

    if (!room) {
        return Response.json({
            error: 'Room not found'
        }, { status: 404 });
    }

    // Convert votes Map to array
    const votesArray = [];
    for (const [userId, userVotes] of room.votes.entries()) {
        const user = room.users.find(u => u.userId === userId);
        votesArray.push({
            userId,
            userName: user?.userName,
            votes: userVotes
        });
    }

    return Response.json({
        success: true,
        votes: votesArray,
        totalVotes: votesArray.length
    });
}

/**
 * Aggregate votes from all users
 */
function aggregateVotes(votesMap) {
    const combined = new Map();

    for (const [userId, userVotes] of votesMap.entries()) {
        userVotes.forEach(vote => {
            const existing = combined.get(vote.placeId) || {
                ...vote,
                votes: 0,
                voters: []
            };

            existing.votes += vote.votes;
            existing.voters.push(userId);

            combined.set(vote.placeId, existing);
        });
    }

    // Convert to array and sort by votes
    return Array.from(combined.values())
        .sort((a, b) => b.votes - a.votes);
}
