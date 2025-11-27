import styles from './FilterBar.module.css';

const FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'vibe', label: 'Vibe' },
    { id: 'architecture', label: 'Architecture' },
    { id: 'old-sightseeing', label: 'Old Sightseeing' },
    { id: 'nature', label: 'Nature' },
    { id: 'modern', label: 'Modern' },
];

const CITIES = [
    { id: 'all', label: 'All Cities' },
    { id: 'tokyo', label: 'Tokyo' },
    { id: 'kyoto', label: 'Kyoto' },
    { id: 'osaka', label: 'Osaka' },
];

export default function FilterBar({ activeFilter, onFilterChange, activeCity, onCityChange }) {
    return (
        <div className={styles.container}>
            <div className={styles.cityFilter}>
                <label className={styles.label}>City:</label>
                <select
                    className={styles.citySelect}
                    value={activeCity}
                    onChange={(e) => onCityChange(e.target.value)}
                >
                    {CITIES.map((city) => (
                        <option key={city.id} value={city.id}>
                            {city.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className={styles.filterBar}>
                {FILTERS.map((filter) => (
                    <button
                        key={filter.id}
                        className={`${styles.filterBtn} ${activeFilter === filter.id ? styles.active : ''}`}
                        onClick={() => onFilterChange(filter.id)}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
