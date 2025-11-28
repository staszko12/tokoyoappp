import prisma from '@/lib/prisma';

/**
 * POST /api/rooms/:roomId/join - Join room with name
 */
export async function POST(request, { params }) {
    try {
        const { roomId } = params; // Corrected destructuring
        const body = await request.json();
        const { userName } = body;

        if (!userName || userName.trim() === '') {
            return Response.json({
                error: 'Name is required'
            }, { status: 400 });
        }

        const room = await prisma.room.findUnique({
            where: { id: roomId },
            include: { users: true }
        });

        if (!room) {
            return Response.json({
                error: 'Room not found'
            }, { status: 404 });
        }

        if (room.users.length >= 5) {
            return Response.json({
                error: 'Room is full (max 5 users)'
            }, { status: 400 });
        }

        const existingUser = room.users.find(u => u.name.toLowerCase() === userName.toLowerCase());
        if (existingUser) {
            return Response.json({
                error: 'Name already taken in this group'
            }, { status: 400 });
        }

        const userId = Math.random().toString(36).substring(2, 10);

        await prisma.user.create({
            data: {
                id: userId,
                roomId,
                name: userName
            }
        });

        return Response.json({
            success: true,
            userId,
            userName
        });
    } catch (error) {
        console.error('Database error:', error);
        return Response.json({
            error: 'Failed to join room'
        }, { status: 500 });
    }
}
