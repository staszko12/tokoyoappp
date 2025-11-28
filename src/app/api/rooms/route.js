import { rooms } from '@/lib/roomStorage';

/**
 * Generate a unique room ID
 */
function generateRoomId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * POST /api/rooms - Create new room
 */
export async function POST() {
    const roomId = generateRoomId();

    const room = {
        roomId,
        users: [],
        votes: new Map(),
        itinerary: null,
        createdAt: Date.now(),
        status: 'waiting' // waiting | ready | completed
    };

    rooms.set(roomId, room);

    const shareLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/room/${roomId}`;

    return Response.json({
        success: true,
        roomId,
        shareLink
    });
}

/**
 * GET /api/rooms?roomId=xxx - Get room status
 */
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');

    if (!roomId) {
        return Response.json({ error: 'Room ID required' }, { status: 400 });
    }

    const room = rooms.get(roomId);

    if (!room) {
        return Response.json({ error: 'Room not found' }, { status: 404 });
    }

    // Convert votes Map to array for JSON serialization
    const votesArray = [];
    for (const [userId, userVotes] of room.votes.entries()) {
        votesArray.push({
            userId,
            votes: userVotes
        });
    }

    return Response.json({
        success: true,
        roomId: room.roomId,
        users: room.users,
        votesSubmitted: votesArray.length,
        totalUsers: room.users.length,
        isReady: room.users.length === 5 && votesArray.length === 5,
        status: room.status,
        itinerary: room.itinerary
    });
}
