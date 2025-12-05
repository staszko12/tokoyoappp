'use client';

import { useState, useEffect } from 'react';
import { APIProvider, Map as GoogleMap, AdvancedMarker, Pin, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { Loader2 } from 'lucide-react';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const MAP_ID = 'DEMO_MAP_ID'; // Required for AdvancedMarker

const JAPAN_CENTER = { lat: 36.2048, lng: 138.2529 }; // Center of Japan
const DEFAULT_ZOOM = 5;

interface Place {
    id: string;
    name: string;
    location: { lat: number; lng: number };
    description?: string;
    image?: string;
    tags?: string[];
    isAiSuggestion?: boolean;
    votes?: number;
}

interface MapProps {
    places?: Place[];
    loading?: boolean;
    viewMode?: 'voting' | 'itinerary';
    onMapIdle?: (data: { bounds: any; center: any; zoom: number }) => void;
}

function MapHandler({ onMapLoad }: { onMapLoad: (map: google.maps.Map) => void }) {
    const map = useMap();
    useEffect(() => {
        if (map) {
            onMapLoad(map);
        }
    }, [map, onMapLoad]);
    return null;
}

export default function Map({ places = [], loading, viewMode = 'voting', onMapIdle }: MapProps) {
    const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);

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

    // Handle map idle event to report bounds
    useEffect(() => {
        if (!map) return;

        const listener = map.addListener('idle', () => {
            const bounds = map.getBounds();
            const center = map.getCenter();
            const zoom = map.getZoom() || DEFAULT_ZOOM;

            if (bounds && center && onMapIdle) {
                const ne = bounds.getNorthEast();
                const sw = bounds.getSouthWest();

                const boundsObj = {
                    north: ne.lat(),
                    south: sw.lat(),
                    east: ne.lng(),
                    west: sw.lng()
                };

                onMapIdle({
                    bounds: boundsObj,
                    center: {
                        lat: center.lat(),
                        lng: center.lng()
                    },
                    zoom
                });
            }
        });

        return () => {
            google.maps.event.removeListener(listener);
        };
    }, [map, onMapIdle]);

    if (!API_KEY) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-tokyo-900 text-white p-6">
                <div className="text-center">
                    <h3 className="text-xl font-bold mb-2">Google Maps API Key Missing</h3>
                    <p className="text-slate-400">Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full relative bg-slate-900">
            <APIProvider apiKey={API_KEY}>
                <MapHandler onMapLoad={setMap} />
                <GoogleMap
                    defaultCenter={JAPAN_CENTER}
                    defaultZoom={DEFAULT_ZOOM}
                    mapId={MAP_ID}
                    className="w-full h-full"
                    disableDefaultUI={true}
                    zoomControl={true}
                    mapTypeControl={false}
                    streetViewControl={false}
                    styles={[
                        {
                            "elementType": "geometry",
                            "stylers": [{ "color": "#242f3e" }]
                        },
                        {
                            "elementType": "labels.text.stroke",
                            "stylers": [{ "color": "#242f3e" }]
                        },
                        {
                            "elementType": "labels.text.fill",
                            "stylers": [{ "color": "#746855" }]
                        },
                        {
                            "featureType": "administrative.locality",
                            "elementType": "labels.text.fill",
                            "stylers": [{ "color": "#d59563" }]
                        },
                        {
                            "featureType": "poi",
                            "elementType": "labels.text.fill",
                            "stylers": [{ "color": "#d59563" }]
                        },
                        {
                            "featureType": "poi.park",
                            "elementType": "geometry",
                            "stylers": [{ "color": "#263c3f" }]
                        },
                        {
                            "featureType": "poi.park",
                            "elementType": "labels.text.fill",
                            "stylers": [{ "color": "#6b9a76" }]
                        },
                        {
                            "featureType": "road",
                            "elementType": "geometry",
                            "stylers": [{ "color": "#38414e" }]
                        },
                        {
                            "featureType": "road",
                            "elementType": "geometry.stroke",
                            "stylers": [{ "color": "#212a37" }]
                        },
                        {
                            "featureType": "road",
                            "elementType": "labels.text.fill",
                            "stylers": [{ "color": "#9ca5b3" }]
                        },
                        {
                            "featureType": "road.highway",
                            "elementType": "geometry",
                            "stylers": [{ "color": "#746855" }]
                        },
                        {
                            "featureType": "road.highway",
                            "elementType": "geometry.stroke",
                            "stylers": [{ "color": "#1f2835" }]
                        },
                        {
                            "featureType": "road.highway",
                            "elementType": "labels.text.fill",
                            "stylers": [{ "color": "#f3d19c" }]
                        },
                        {
                            "featureType": "transit",
                            "elementType": "geometry",
                            "stylers": [{ "color": "#2f3948" }]
                        },
                        {
                            "featureType": "transit.station",
                            "elementType": "labels.text.fill",
                            "stylers": [{ "color": "#d59563" }]
                        },
                        {
                            "featureType": "water",
                            "elementType": "geometry",
                            "stylers": [{ "color": "#17263c" }]
                        },
                        {
                            "featureType": "water",
                            "elementType": "labels.text.fill",
                            "stylers": [{ "color": "#515c6d" }]
                        },
                        {
                            "featureType": "water",
                            "elementType": "labels.text.stroke",
                            "stylers": [{ "color": "#17263c" }]
                        }
                    ]}
                >
                    {places.map((place, index) => {
                        const isAiSuggestion = place.isAiSuggestion || false;
                        const hasVotes = (place.votes || 0) > 0;

                        // Neon Tokyo 2025 Colors
                        const pinColor = hasVotes ? '#ccff00' : (isAiSuggestion ? '#d946ef' : '#22d3ee');
                        const borderColor = hasVotes ? '#ccff00' : (isAiSuggestion ? '#d946ef' : '#22d3ee');

                        return (
                            <AdvancedMarker
                                key={place.id || `place-${index}`}
                                position={place.location}
                                onClick={() => setSelectedPlace(place)}
                                title={place.name}
                            >
                                <div className="relative group cursor-pointer hover:scale-110 transition-transform duration-300">
                                    <Pin background={pinColor} borderColor={borderColor} glyphColor={'#000000'} />
                                    {hasVotes && (
                                        <div className="absolute -top-2 -right-2 bg-acid text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-void shadow-glow animate-pulse-glow">
                                            {place.votes}
                                        </div>
                                    )}
                                </div>
                            </AdvancedMarker>
                        );
                    })}

                    {selectedPlace && (
                        <InfoWindow
                            position={selectedPlace.location}
                            onCloseClick={() => setSelectedPlace(null)}
                            headerContent={<div className="font-bold text-slate-900">{selectedPlace.name}</div>}
                        >
                            <div className="max-w-xs">
                                {selectedPlace.image && (
                                    <img
                                        src={selectedPlace.image}
                                        alt={selectedPlace.name}
                                        className="w-full h-32 object-cover rounded-lg mb-2"
                                    />
                                )}
                                <p className="text-slate-600 text-sm mb-2">{selectedPlace.description}</p>
                                <div className="flex flex-wrap gap-1">
                                    {selectedPlace.tags?.map(tag => (
                                        <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </InfoWindow>
                    )}
                </GoogleMap>
            </APIProvider>

            {loading && (
                <div className="absolute inset-0 bg-void/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-surface/60 backdrop-blur-glass p-6 rounded-3xl border border-white/10 flex items-center gap-3 shadow-deep">
                        <Loader2 className="w-6 h-6 text-acid animate-spin" />
                        <span className="text-white font-medium">Loading places...</span>
                    </div>
                </div>
            )}
        </div>
    );
}
