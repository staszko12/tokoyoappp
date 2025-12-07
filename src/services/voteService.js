/**
 * Vote Service
 * Handles session management and vote API communication
 */

/**
 * Get all votes for the current room
 * @param {string} roomId
 */
export async function getVotes(roomId) {
    try {
        const response = await fetch(`/api/rooms/${roomId}/votes`);

        if (!response.ok) {
            throw new Error('Failed to fetch votes');
        }

        const data = await response.json();
        return data.votes || [];
    } catch (error) {
        console.error('Error fetching votes:', error);
        return [];
    }
}

/**
 * Submit votes for a user
 * @param {string} roomId
 * @param {string} userId
 * @param {string} userName
 * @param {Array} votes - Array of vote objects
 */
export async function submitVotes(roomId, userId, userName, votes) {
    try {
        const response = await fetch(`/api/rooms/${roomId}/votes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId,
                userName,
                votes
            })
        });

        if (!response.ok) {
            throw new Error('Failed to submit votes');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error submitting votes:', error);
        throw error;
    }
}

/**
 * Get all votes for session as a map (placeId -> votes)
 * Note: This might need adjustment based on how the API returns data
 * The API returns grouped by user, or flat list depending on endpoint.
 * GET /api/rooms/:roomId/votes returns { votes: [ { userId, userName, votes: [...] } ] }
 */
export async function getVotesMap(roomId) {
    const response = await getVotes(roomId);
    // response is array of user votes: [{ userId, votes: [{ placeId, votes: N }] }]

    const votesMap = {};

    if (Array.isArray(response)) {
        response.forEach(userVote => {
             if (userVote.votes && Array.isArray(userVote.votes)) {
                 userVote.votes.forEach(vote => {
                     // Aggregating total votes per place
                     votesMap[vote.placeId] = (votesMap[vote.placeId] || 0) + vote.votes;
                 });
             }
        });
    }

    return votesMap;
}
