'use client';

import { useState } from 'react';
import styles from './JoinRoom.module.css';

export default function JoinRoom({ roomId, onJoin }) {
    const [userName, setUserName] = useState('');
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState(null);

    const handleJoin = async () => {
        if (!userName.trim()) {
            setError('Please enter your name');
            return;
        }

        setJoining(true);
        setError(null);

        try {
            const response = await fetch(`/api/rooms/${roomId}/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userName: userName.trim() })
            });

            const data = await response.json();

            if (data.success) {
                onJoin({
                    userId: data.userId,
                    userName: data.userName
                });
            } else {
                setError(data.error || 'Failed to join room');
            }
        } catch (err) {
            console.error('Error joining room:', err);
            setError('Failed to join room. Please try again.');
        } finally {
            setJoining(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h1 className={styles.title}>Join Trip Planning Group</h1>
                <p className={styles.roomCode}>Room Code: <strong>{roomId}</strong></p>

                <div className={styles.form}>
                    <label className={styles.label}>Your Name</label>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="Enter your name"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
                        maxLength={30}
                        autoFocus
                    />

                    {error && <div className={styles.error}>{error}</div>}

                    <button
                        className={styles.joinBtn}
                        onClick={handleJoin}
                        disabled={joining || !userName.trim()}
                    >
                        {joining ? 'Joining...' : 'Join Group'}
                    </button>
                </div>

                <p className={styles.info}>
                    💡 Up to 5 people can join this group
                </p>
            </div>
        </div>
    );
}
