import styles from './ItineraryView.module.css';

export default function ItineraryView({ itinerary, onBack }) {
    if (!itinerary) {
        return (
            <aside className={styles.container}>
                <div className={styles.header}>
                    <h2>Your Trip Itinerary</h2>
                    <button className={styles.backBtn} onClick={onBack}>← Back to Voting</button>
                </div>
                <div className={styles.loading}>
                    <p>Generating your personalized itinerary...</p>
                </div>
            </aside>
        );
    }

    return (
        <aside className={styles.container}>
            <div className={styles.header}>
                <h2>Your AI-Optimized Itinerary</h2>
                <button className={styles.backBtn} onClick={onBack}>← Back to Voting</button>
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

            <div className={styles.footer}>
                <button
                    className={styles.exportBtn}
                    onClick={() => alert('Export to Google Maps feature coming soon!')}
                >
                    Export to Google Maps
                </button>
            </div>
        </aside>
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
