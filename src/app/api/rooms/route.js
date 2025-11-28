import db from '@/lib/db';

/**
 * Generate a unique room ID
 */
function generateRoomId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * POST /api/rooms - Create a new room
 */
export async function POST() {
    const roomId = generateRoomId();
    const createdAt = Date.now();

    try {
        const stmt = db.prepare('INSERT INTO rooms (id, created_at, status) VALUES (?, ?, ?)');
        stmt.run(roomId, createdAt, 'waiting');

        const shareLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/room/${roomId}`;

        return Response.json({
            success: true,
            roomId,
            shareLink
        });
    } catch (error) {
        console.error('Database error:', error);
        return Response.json({ error: 'Failed to create room' }, { status: 500 });
    }
}

/**
 * GET /api/rooms?roomId=XYZ - Get room status
 */
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');

    if (!roomId) {
        return Response.json({ error: 'Room ID required' }, { status: 400 });
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
