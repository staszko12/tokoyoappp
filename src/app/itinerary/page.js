'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Map from '@/components/Map';
import styles from './page.module.css';

export default function ItineraryPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [itinerary, setItinerary] = useState(null);

    useEffect(() => {
        // Get itinerary from sessionStorage
        const storedItinerary = sessionStorage.getItem('itinerary');
        if (storedItinerary) {
            setItinerary(JSON.parse(storedItinerary));
        } else {
            // If no itinerary, redirect back to home
            router.push('/');
        }
    }, [router]);

    if (!itinerary) {
        return (
            <main className={styles.main}>
                <div className={styles.loading}>Loading your itinerary...</div>
            </main>
        );
    }

    const places = itinerary.itinerary.map(item => item.place);

    return (
        <main className={styles.main}>
            <div className={styles.panel}>
                <div className={styles.header}>
                    <button className={styles.backBtn} onClick={() => router.push('/')}>
                        ← Back to Voting
                    </button>
                    <h1>Your AI-Optimized Itinerary</h1>
                </div>

                <div className={styles.overview}>
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
                                        <h2>{item.place.name}</h2>
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

                <div className={styles.footer}>
                    <button
                        className={styles.exportBtn}
                        onClick={() => alert('Export to Google Maps feature coming soon!')}
                    >
                        Export to Google Maps
                    </button>
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
