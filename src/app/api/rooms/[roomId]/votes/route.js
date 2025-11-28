import prisma from '@/lib/prisma';
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

        const room = await prisma.room.findUnique({
            where: { id: roomId }
        });

        if (!room) {
            return Response.json({
                error: 'Room not found'
            }, { status: 404 });
        }

        // Verify user is in room
        const user = await prisma.user.findFirst({
            where: { id: userId, roomId }
        });

        if (!user) {
            return Response.json({
                error: 'User not found in room'
            }, { status: 403 });
        }

        // Transaction to save votes and update status
        await prisma.$transaction(async (tx) => {
            // Delete existing votes for this user
            await tx.vote.deleteMany({
                where: { userId }
            });

            // Insert new votes
            if (votes.length > 0) {
                await tx.vote.createMany({
                    data: votes.map(vote => ({
                        roomId,
                        userId,
                        placeId: vote.placeId,
                        placeData: JSON.stringify(vote),
                        voteCount: vote.votes
                    }))
                });
            }

            // Mark user as ready
            await tx.user.update({
                where: { id: userId },
                data: { isReady: true }
            });
        });

        // Check if all 5 users are ready
        const users = await prisma.user.findMany({
            where: { roomId }
        });
        const allReady = users.length === 5 && users.every(u => u.isReady);

        let itinerary = null;
        if (room.itinerary) {
            itinerary = JSON.parse(room.itinerary);
        }

        if (allReady && !room.itinerary) {
            // Aggregate votes from all users
            const allVotes = await prisma.vote.findMany({
                where: { roomId }
            });
            const aggregatedVotes = aggregateVotes(allVotes);

            // Generate itinerary with Gemini
            try {
                itinerary = await generateItinerary(aggregatedVotes);

                // Save itinerary and update status
                await prisma.room.update({
                    where: { id: roomId },
                    data: {
                        itinerary: JSON.stringify(itinerary),
                        status: 'completed'
                    }
                });

            } catch (error) {
                console.error('Error generating group itinerary:', error);
                await prisma.room.update({
                    where: { id: roomId },
                    data: { status: 'error' }
                });
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

    const room = await prisma.room.findUnique({
        where: { id: roomId }
    });

    if (!room) {
        return Response.json({
            error: 'Room not found'
        }, { status: 404 });
    }

    // Get all votes with user details
    const votes = await prisma.vote.findMany({
        where: { roomId },
        include: { user: true }
    });

    // Group by user
    const votesByUser = {};
    votes.forEach(v => {
        if (!votesByUser[v.userId]) {
            votesByUser[v.userId] = {
                userId: v.userId,
                userName: v.user.name,
                votes: []
            };
        }
        votesByUser[v.userId].votes.push({
            ...JSON.parse(v.placeData),
            votes: v.voteCount
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
        const voteData = JSON.parse(row.placeData);
        const existing = combined.get(row.placeId) || {
            ...voteData,
            votes: 0,
            voters: []
        };

        existing.votes += row.voteCount;
        existing.voters.push(row.userId);

        combined.set(row.placeId, existing);
    });

    // Convert to array and sort by votes
    return Array.from(combined.values())
        .sort((a, b) => b.votes - a.votes);
}
