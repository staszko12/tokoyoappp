'use client';

import { useState, useEffect } from 'react';
import { APIProvider, Map as GoogleMap, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import styles from './Map.module.css';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const MAP_ID = 'DEMO_MAP_ID'; // Required for AdvancedMarker

const JAPAN_CENTER = { lat: 36.2048, lng: 138.2529 }; // Center of Japan
const DEFAULT_ZOOM = 5;

export default function Map({ places = [], loading, viewMode = 'voting' }) {
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [map, setMap] = useState(null);

    // Auto-fit bounds when in itinerary mode
    useEffect(() => {
        if (map && viewMode === 'itinerary' && places.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            places.forEach(place => {
                if (place.location) {
                    bounds.extend(place.location);
                }
            });
            map.fitBounds(bounds);
        }
    }, [map, viewMode, places]);

    if (!API_KEY) {
        return (
            <div className={styles.mapContainer}>
                <div className={styles.placeholder}>
                    <h3>Google Maps API Key Missing</h3>
                    <p>Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.mapContainer}>
            <APIProvider apiKey={API_KEY}>
                <GoogleMap
                    defaultCenter={JAPAN_CENTER}
                    defaultZoom={DEFAULT_ZOOM}
                    mapId={MAP_ID}
                    className={styles.googleMap}
                    onLoad={setMap}
                >
                    {places.map((place, index) => {
                        const isAiSuggestion = place.isAiSuggestion || false;
                        const pinColor = isAiSuggestion ? '#fbbf24' : '#8b5cf6';
                        const borderColor = isAiSuggestion ? '#f59e0b' : '#7c3aed';

                        return (
                            <AdvancedMarker
                                key={place.id || `place-${index}`}
                                position={place.location}
                                onClick={() => setSelectedPlace(place)}
                                title={place.name}
                            >
                                <Pin background={pinColor} borderColor={borderColor} glyphColor={'white'} />
                            </AdvancedMarker>
                        );
                    })}

                    {selectedPlace && (
                        <InfoWindow
                            position={selectedPlace.location}
                            onCloseClick={() => setSelectedPlace(null)}
                        >
                            <div className={styles.infoWindow}>
                                {selectedPlace.image && (
                                    <img src={selectedPlace.image} alt={selectedPlace.name} className={styles.placeImage} />
                                )}
                                <h3>{selectedPlace.name}</h3>
                                <p>{selectedPlace.description}</p>
                                <div className={styles.tags}>
                                    {selectedPlace.tags?.map(tag => (
                                        <span key={tag} className={styles.tag}>{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </InfoWindow>
                    )}
                </GoogleMap>
            </APIProvider>
            {loading && <div className={styles.loadingOverlay}>Loading places...</div>}
        </div>
    );
}
