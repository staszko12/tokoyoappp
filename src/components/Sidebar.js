import FilterBar from './FilterBar';
import styles from './Sidebar.module.css';

export default function Sidebar({ places, onVote, activeFilter, onFilterChange, activeCity, onCityChange, onFinish, loading, error, roomInfo, currentUser }) {
    return (
        <aside className={styles.sidebar}>
            <div className={styles.header}>
                <h2>Places to Visit</h2>
                <p className={styles.subtitle}>Vote for your favorites</p>
                {roomInfo && currentUser && (
                    <div className={styles.roomInfo}>
                        <span className={styles.userName}>👤 {currentUser.userName}</span>
                        <span className={styles.roomCode}>Room: {roomInfo.roomId}</span>
                        <span className={styles.userCount}>{roomInfo.totalUsers}/5 users</span>
                    </div>
                )}
            </div>

            <FilterBar
                activeFilter={activeFilter}
                onFilterChange={onFilterChange}
                activeCity={activeCity}
                onCityChange={onCityChange}
            />

            {loading && (
                <div className={styles.loading}>
                    <p>Loading places from OpenStreetMap...</p>
                </div>
            )}

            {error && (
                <div className={styles.error}>
                    <p>{error}</p>
                </div>
            )}

            {!loading && !error && places.length === 0 && (
                <div className={styles.empty}>
                    <p>No places found. Try a different filter.</p>
                </div>
            )}

            <div className={styles.list}>
                {places.map((place) => (
                    <div key={place.id} className={styles.card}>
                        {place.image && (
                            <img src={place.image} alt={place.name} className={styles.placeImage} />
                        )}
                        <div className={styles.cardContent}>
                            <h3>{place.name}</h3>
                            <p className={styles.tags}>{place.tags.join(' • ')}</p>
                            {place.aiDescription && (
                                <p className={styles.aiDescription}>
                                    <strong>AI Insight:</strong> {place.aiDescription}
                                </p>
                            )}
                            {place.googleMapsUrl && (
                                <a
                                    href={place.googleMapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.mapLink}
                                >
                                    View on Google Maps
                                </a>
                            )}
                            {place.osmUrl && (
                                <a
                                    href={place.osmUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.mapLink}
                                    style={{ marginLeft: '10px' }}
                                >
                                    View on OSM
                                </a>
                            )}
                        </div>
                        <div className={styles.voteControl}>
                            <button
                                className={styles.voteBtn}
                                onClick={() => onVote(place.id)}
                            >
                                ▲ {place.votes}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.footer}>
                <button
                    className={styles.finishBtn}
                    onClick={onFinish}
                    disabled={loading}
                >
                    {loading ? 'Submitting...' : 'Submit My Votes'}
                </button>
            </div>
        </aside>
    );
}
