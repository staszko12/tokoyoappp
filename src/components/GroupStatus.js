'use client';

import { useRouter } from 'next/navigation';
import styles from './GroupStatus.module.css';

export default function GroupStatus({ room, currentUser }) {
    const router = useRouter();

    if (!room) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading room status...</div>
            </div>
        );
    }

    const readyCount = room.users?.filter(u => u.isReady).length || 0;
    const totalUsers = room.users?.length || 0;
    const allReady = readyCount === 5 && totalUsers === 5;
    const itineraryReady = room.itinerary !== null;

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h1>Votes Submitted! ✅</h1>
                    <p className={styles.roomCode}>Room: {room.roomId}</p>
                </div>

                <div className={styles.status}>
                    {itineraryReady ? (
                        <>
                            <div className={styles.success}>🎉</div>
                            <h2>Itinerary Ready!</h2>
                            <p>Your group trip has been planned by AI!</p>
                            <button
                                className={styles.viewBtn}
                                onClick={() => router.push(`/results/${room.roomId}`)}
                            >
                                View Results
                            </button>
                        </>
                    ) : allReady ? (
                        <>
                            <div className={styles.spinner}></div>
                            <h2>Generating Your Group Itinerary...</h2>
                            <p>Gemini AI is creating the perfect trip for your group!</p>
                        </>
                    ) : (
                        <>
                            <div className={styles.progress}>
                                <div className={styles.progressBar}>
                                    <div
                                        className={styles.progressFill}
                                        style={{ width: `${(readyCount / 5) * 100}%` }}
                                    ></div>
                                </div>
                                <div className={styles.progressText}>
                                    {readyCount} / 5 users ready
                                </div>
                            </div>

                            <h2>Waiting for Others...</h2>
                            <p>We'll generate the itinerary when everyone has voted!</p>
                        </>
                    )}
                </div>

                <div className={styles.userList}>
                    <h3>Group Members</h3>
                    {room.users?.map(user => (
                        <div key={user.userId} className={styles.user}>
                            <span className={styles.userName}>
                                {user.userName}
                                {user.userId === currentUser.userId && ' (you)'}
                            </span>
                            <span className={user.isReady ? styles.ready : styles.waiting}>
                                {user.isReady ? '✓ Ready' : '⏳ Voting...'}
                            </span>
                        </div>
                    ))}

                    {totalUsers < 5 && (
                        <div className={styles.emptySlots}>
                            {[...Array(5 - totalUsers)].map((_, i) => (
                                <div key={i} className={styles.emptySlot}>
                                    Empty slot {totalUsers + i + 1}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className={styles.tip}>
                    💡 Share the room code with friends to fill all 5 slots!
                </div>
            </div>
        </div>
    );
}
