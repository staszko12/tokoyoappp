'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Map from '@/components/Map';
import styles from './page.module.css';

export default function ResultsPage() {
    const params = useParams();
    const router = useRouter();
    const roomId = params.roomId;

    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadResults() {
            try {
                const response = await fetch(`/api/rooms?roomId=${roomId}`);
                const data = await response.json();

                if (data.success) {
                    setRoom(data);
                } else {
                    setError('Room not found');
                }
            } catch (err) {
                console.error('Error loading results:', err);
                setError('Failed to load results');
            } finally {
                setLoading(false);
            }
        }

        loadResults();
    }, [roomId]);

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading results...</div>
            </div>
        );
    }

    if (error || !room) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>{error || 'Room not found'}</div>
                <button className={styles.backBtn} onClick={() => router.push('/')}>
                    Back to Home
                </button>
            </div>
        );
    }

    if (!room.itinerary) {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <h1>No Itinerary Yet</h1>
                    <p>This group hasn't completed voting yet.</p>
                    <button className={styles.backBtn} onClick={() => router.push('/')}>
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    const itinerary = room.itinerary;
    const places = itinerary.itinerary.map(item => item.place);

    return (
        <main className={styles.main}>
            <div className={styles.panel}>
                <div className={styles.header}>
                    <button className={styles.backBtn} onClick={() => router.push('/')}>
                        ← Back to Home
                    </button>
                    <h1>Trip Results</h1>
                    <p className={styles.roomCode}>Room: {roomId}</p>
                </div>

                <div className={styles.participants}>
                    <h2>Participants ({room.users?.length || 0}/5)</h2>
                    <div className={styles.userList}>
                        {room.users?.map(user => (
                            <div key={user.userId} className={styles.user}>
                                <span className={styles.userName}>👤 {user.userName}</span>
                                <span className={styles.ready}>✓ Voted</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.overview}>
                    <h2>AI-Generated Itinerary</h2>
                    <p>{itinerary.overview}</p>
                    <div className={styles.stats}>
                        <span>⏱️ {itinerary.totalEstimatedTime}</span>
                        <span>💴 {itinerary.totalEstimatedCost}</span>
                    </div>
                </div>

                <div className={styles.timeline}>
                    {itinerary.itinerary.map((item, index) => (
                        <div key={item.place.id} className={styles.itemWrapper}>
                            <div className={styles.item}>
                                <div className={styles.number}>{index + 1}</div>
                                <div className={styles.content}>
                                    <div className={styles.placeHeader}>
                                        <h3>{item.place.name}</h3>
                                        {item.place.isAiSuggestion && (
                                            <span className={styles.aiBadge}>✨ AI Suggestion</span>
                                        )}
                                    </div>
                                    <p className={styles.description}>{item.place.description}</p>

                                    <div className={styles.meta}>
                                        <div className={styles.timing}>
                                            <span className={styles.timeAllocation}>
                                                ⏰ {item.timeAllocation}
                                            </span>
                                            <span className={styles.recommendedTime}>
                                                🕐 {item.recommendedTime}
                                            </span>
                                        </div>

                                        {item.tourGuideInsight && (
                                            <div className={styles.insightBox}>
                                                <strong>🎯 Tour Guide Tip:</strong> {item.tourGuideInsight}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {item.commuteToNext && (
                                <div className={styles.commute}>
                                    <div className={styles.commuteLine}></div>
                                    <div className={styles.commuteCard}>
                                        <div className={styles.commuteIcon}>
                                            {getTransportIcon(item.commuteToNext.method)}
                                        </div>
                                        <div className={styles.commuteDetails}>
                                            <div className={styles.commuteMethod}>
                                                {item.commuteToNext.method} • {item.commuteToNext.duration}
                                            </div>
                                            <div className={styles.commuteInfo}>
                                                {item.commuteToNext.details}
                                            </div>
                                            {item.commuteToNext.cost && (
                                                <div className={styles.commuteCost}>
                                                    {item.commuteToNext.cost}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.mapContainer}>
                <Map
                    places={places}
                    loading={false}
                    viewMode="itinerary"
                />
            </div>
        </main>
    );
}

function getTransportIcon(method) {
    const icons = {
        'Train': '🚆',
        'Walking': '🚶',
        'Walk': '🚶',
        'Bus': '🚌',
        'Taxi': '🚕',
        'Subway': '🚇',
        'Metro': '🚇'
    };
    return icons[method] || '🚶';
}
