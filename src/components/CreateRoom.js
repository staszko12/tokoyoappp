'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './CreateRoom.module.css';

export default function CreateRoom() {
    const router = useRouter();
    const [creating, setCreating] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [joining, setJoining] = useState(false);

    const handleCreateRoom = async () => {
        setCreating(true);
        try {
            const response = await fetch('/api/rooms', {
                method: 'POST'
            });

            const data = await response.json();

            if (data.success) {
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

        router.push(`/room/${joinCode.toUpperCase()}`);
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
            </div>
        </div>
    );
}
