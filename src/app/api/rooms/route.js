import prisma from '@/lib/prisma';

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

    try {
        await prisma.room.create({
            data: {
                id: roomId,
                status: 'waiting'
            }
        });

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

    try {
        const room = await prisma.room.findUnique({
            where: { id: roomId },
            include: {
                users: true
            }
        });

        if (!room) {
            return Response.json({ error: 'Room not found' }, { status: 404 });
        }

        // Calculate votesSubmitted and totalUsers based on the fetched room data
        const votesSubmitted = room.users.filter(user => user.vote !== null).length;
        const totalUsers = room.users.length;
        const isReady = totalUsers > 0 && votesSubmitted === totalUsers; // Assuming 'ready' means all users have voted

        return Response.json({
            success: true,
            roomId: room.id,
            users: room.users,
            votesSubmitted: votesSubmitted,
            totalUsers: totalUsers,
            isReady: isReady,
            status: room.status,
            itinerary: room.itinerary ? JSON.parse(room.itinerary) : null
        });
    } catch (error) {
        console.error('Database error:', error);
        return Response.json({ error: 'Failed to fetch room' }, { status: 500 });
    }
}
