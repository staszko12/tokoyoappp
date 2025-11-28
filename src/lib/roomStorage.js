// Shared in-memory storage for rooms
// Key: roomId
// Value: { roomId, users, votes, itinerary, createdAt, status }
export const rooms = new Map();
