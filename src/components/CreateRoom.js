'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './CreateRoom.module.css';

export default function CreateRoom() {
    const router = useRouter();
    const [creating, setCreating] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [joining, setJoining] = useState(false);
    const [history, setHistory] = useState([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Load history on mount
        const savedHistory = JSON.parse(localStorage.getItem('japan_trip_history') || '[]');
        setHistory(savedHistory);
    }, []);

    const addToHistory = (roomId) => {
        const newHistory = [
            { roomId, joinedAt: Date.now() },
            ...history.filter(h => h.roomId !== roomId)
        ].slice(0, 5); // Keep last 5

        localStorage.setItem('japan_trip_history', JSON.stringify(newHistory));
        setHistory(newHistory);
    };

    const handleCreateRoom = async () => {
        setCreating(true);
        try {
            const response = await fetch('/api/rooms', {
                method: 'POST'
            });

            const data = await response.json();

            if (data.success) {
                addToHistory(data.roomId);
                // Redirect to the new room
                router.push(`/room/${data.roomId}`);
            }
        } catch (error) {
            console.error('Error creating room:', error);
            alert('Failed to create room. Please try again.');
        } finally {
            setCreating(false);
        }
    };

    const handleJoinRoom = () => {
        if (!joinCode.trim()) {
            alert('Please enter a room code');
            return;
        }

        const code = joinCode.toUpperCase();
        addToHistory(code);
        router.push(`/room/${code}`);
    };

    const clearHistory = () => {
        localStorage.removeItem('japan_trip_history');
        setHistory([]);
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Japan Trip Planner</h1>
                <p className={styles.subtitle}>Plan your group trip together!</p>

                <div className={styles.section}>
                    <h2>Create New Group</h2>
                    <p className={styles.description}>
                        Start a new trip planning session for up to 5 people
                    </p>
                    <button
                        className={styles.createBtn}
                        onClick={handleCreateRoom}
                        disabled={creating}
                    >
                        {creating ? 'Creating...' : '🗾 Create New Group'}
                    </button>
                </div>

                <div className={styles.divider}>
                    <span>OR</span>
                </div>

                <div className={styles.section}>
                    <h2>Join Existing Group</h2>
                    <p className={styles.description}>
                        Enter the room code shared by your group
                    </p>
                    <div className={styles.joinForm}>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="Enter room code (e.g., A3B9F2)"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                            onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                            maxLength={6}
                        />
                        <button
                            className={styles.joinBtn}
                            onClick={handleJoinRoom}
                            disabled={joining || !joinCode.trim()}
                        >
                            Join Group
                        </button>
                    </div>
                </div>

                {mounted && history.length > 0 && (
                    <div className={styles.historySection}>
                        <div className={styles.historyHeader}>
                            <h2>Previous Trips</h2>
                            <button className={styles.clearBtn} onClick={clearHistory}>Clear</button>
                        </div>
                        <div className={styles.historyList}>
                            {history.map(item => (
                                <div
                                    key={item.roomId}
                                    className={styles.historyItem}
                                    onClick={() => router.push(`/results/${item.roomId}`)}
                                >
                                    <div className={styles.historyInfo}>
                                        <span className={styles.historyCode}>{item.roomId}</span>
                                        <span className={styles.historyDate}>
                                            {new Date(item.joinedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <span className={styles.arrow}>→</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
