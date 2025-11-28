// In-memory storage for votes
// Key: `${sessionId}:${placeId}`
// Value: { placeId, placeName, votes, sessionId, timestamp }
const votesStore = new Map();

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
        return Response.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Get all votes for this session
    const sessionVotes = [];
    for (const [key, value] of votesStore.entries()) {
        if (key.startsWith(`${sessionId}:`)) {
            sessionVotes.push({
                placeId: value.placeId,
                votes: value.votes
            });
        }
    }

    return Response.json({
        success: true,
        votes: sessionVotes,
        sessionId
    });
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { sessionId, placeId, votes } = body;

        if (!sessionId || !placeId || votes === undefined) {
            return Response.json({
                error: 'sessionId, placeId, and votes are required'
            }, { status: 400 });
        }

        const key = `${sessionId}:${placeId}`;

        votesStore.set(key, {
            placeId,
            votes,
            sessionId,
            timestamp: Date.now()
        });

        return Response.json({
            success: true,
            placeId,
            votes
        });
    } catch (error) {
        console.error('Error processing vote:', error);
        return Response.json({
            error: 'Failed to process vote'
        }, { status: 500 });
    }
}
