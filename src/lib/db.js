import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'japan_trip.db');
const db = new Database(dbPath);

// Initialize Database Schema
db.exec(`
    CREATE TABLE IF NOT EXISTS rooms (
        id TEXT PRIMARY KEY,
        created_at INTEGER,
        status TEXT DEFAULT 'waiting',
        itinerary TEXT
    );

    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        room_id TEXT,
        name TEXT,
        is_ready INTEGER DEFAULT 0,
        joined_at INTEGER,
        FOREIGN KEY(room_id) REFERENCES rooms(id)
    );

    CREATE TABLE IF NOT EXISTS votes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_id TEXT,
        user_id TEXT,
        place_id TEXT,
        place_data TEXT,
        vote_count INTEGER,
        FOREIGN KEY(room_id) REFERENCES rooms(id),
        FOREIGN KEY(user_id) REFERENCES users(id)
    );
`);

export default db;
