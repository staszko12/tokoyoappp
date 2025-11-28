export async function POST() {
    // Generate a unique session ID
    const sessionId = crypto.randomUUID();

    return Response.json({
        success: true,
        sessionId
    });
}
