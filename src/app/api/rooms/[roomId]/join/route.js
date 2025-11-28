import db from '@/lib/db';

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
                error: 'Name is required'
            }, { status: 400 });
        }

        const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(roomId);

        if (!room) {
            return Response.json({
                error: 'Room not found'
            }, { status: 404 });
        }

        const users = db.prepare('SELECT * FROM users WHERE room_id = ?').all(roomId);

        if (users.length >= 5) {
            return Response.json({
                error: 'Room is full (max 5 users)'
            }, { status: 400 });
        }

        const existingUser = users.find(u => u.name.toLowerCase() === userName.toLowerCase());
        if (existingUser) {
            return Response.json({
                error: 'Name already taken in this group'
            }, { status: 400 });
        }

        const userId = Math.random().toString(36).substring(2, 10);

        const stmt = db.prepare('INSERT INTO users (id, room_id, name, joined_at) VALUES (?, ?, ?, ?)');
        stmt.run(userId, roomId, userName, Date.now());

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
