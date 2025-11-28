/**
 * Vote Service
 * Handles session management and vote API communication
 */

const SESSION_KEY = 'japan-trip-session-id';

/**
 * Get or create a session ID
 */
export async function getOrCreateSessionId() {
    // Check localStorage first
    if (typeof window !== 'undefined') {
        const existingSession = localStorage.getItem(SESSION_KEY);
        if (existingSession) {
            return existingSession;
        }
    }

    // Create new session via API
    try {
        const response = await fetch('/api/session', {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error('Failed to create session');
        }

        const data = await response.json();

        // Store in localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem(SESSION_KEY, data.sessionId);
        }

        return data.sessionId;
    } catch (error) {
        console.error('Error creating session:', error);
        // Fallback to client-side UUID if API fails
        const fallbackId = crypto.randomUUID();
        if (typeof window !== 'undefined') {
            localStorage.setItem(SESSION_KEY, fallbackId);
        }
        return fallbackId;
    }
}

/**
 * Get all votes for the current session
 */
export async function getVotes(sessionId) {
    try {
        const response = await fetch(`/api/votes?sessionId=${sessionId}`);

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
 * Submit a vote for a place
 */
export async function submitVote(sessionId, placeId, votes) {
    try {
        const response = await fetch('/api/votes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sessionId,
                placeId,
                votes
            })
        });

        if (!response.ok) {
            throw new Error('Failed to submit vote');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error submitting vote:', error);
        throw error;
    }
}

/**
 * Get all votes for session as a map (placeId -> votes)
 */
export async function getVotesMap(sessionId) {
    const votes = await getVotes(sessionId);
    const votesMap = {};

    votes.forEach(vote => {
        votesMap[vote.placeId] = vote.votes;
    });

    return votesMap;
}
