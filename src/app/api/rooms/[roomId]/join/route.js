import { rooms } from '@/lib/roomStorage';

/**
 * POST /api/rooms/:roomId/join - Join room with name
 */
export async function POST(request, { params }) {
    try {
        const { roomId } = await params;
        const body = await request.json();
        const { userName } = body;

        if (!userName || userName.trim() === '') {
            return Response.json({
                error: 'User name is required'
            }, { status: 400 });
        }

        const room = rooms.get(roomId);

        if (!room) {
            return Response.json({
                error: 'Room not found'
            }, { status: 404 });
        }

        // Check if room is full
        if (room.users.length >= 5) {
            return Response.json({
                error: 'Room is full (maximum 5 users)'
            }, { status: 400 });
        }

        // Check if name already taken
        const nameTaken = room.users.some(u => u.userName.toLowerCase() === userName.toLowerCase());
        if (nameTaken) {
            return Response.json({
                error: 'This name is already taken in this room'
            }, { status: 400 });
        }

        // Generate user ID
        const userId = crypto.randomUUID();

        // Add user to room
        const user = {
            userId,
            userName: userName.trim(),
            isReady: false,
            joinedAt: Date.now()
        };

        room.users.push(user);

        return Response.json({
            success: true,
            userId,
            roomId,
            userName: user.userName,
            users: room.users,
            totalUsers: room.users.length
        });
    } catch (error) {
        console.error('Error joining room:', error);
        return Response.json({
            error: 'Failed to join room'
        }, { status: 500 });
    }
}
