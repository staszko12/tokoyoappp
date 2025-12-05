'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Menu, Navigation } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Map from '@/components/Map';
import JoinRoom from '@/components/JoinRoom';
import GroupStatus from '@/components/GroupStatus';
import { fetchPlaces } from '@/services/googlePlacesService';
import { submitVotes } from '@/services/voteService';

export default function RoomPage() {
    const params = useParams();
    const router = useRouter();
    const roomId = params.roomId as string;

    const [user, setUser] = useState<{ userId: string; userName: string } | null>(null);
    const [room, setRoom] = useState<any>(null);
    const [places, setPlaces] = useState<any[]>([]);
    const [votes, setVotes] = useState<Record<string, number>>({});
    const [activeFilter, setActiveFilter] = useState('all');
    const [activeCity, setActiveCity] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [mapBounds, setMapBounds] = useState<any>(null);
    const [lastFetchCenter, setLastFetchCenter] = useState<any>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Poll room status every 3 seconds
    useEffect(() => {
        if (!user) return;

        const pollRoomStatus = async () => {
            try {
                const response = await fetch(`/api/rooms?roomId=${roomId}`);
                const data = await response.json();

                if (data.success) {
                    setRoom(data);

                    // If itinerary is ready, redirect
                    if (data.itinerary) {
                        router.push(`/results/${roomId}`);
                    }
                }
            } catch (err) {
                console.error('Error polling room:', err);
            }
        };

        pollRoomStatus();
        const interval = setInterval(pollRoomStatus, 3000);

        return () => clearInterval(interval);
    }, [user, roomId, router]);

    // Load places and merge with existing votes
    useEffect(() => {
        if (user && places.length === 0 && !lastFetchCenter) {
            loadPlaces();
        }
    }, [user]);

    async function loadPlaces(center: { lat: number; lng: number } | null = null, radius = 5000) {
        setLoading(true);
        try {
            const fetchedPlaces = await fetchPlaces(activeFilter, 30, activeCity, center, radius);
            // Merge with existing votes
            const placesWithVotes = fetchedPlaces.map((place: any) => ({
                ...place,
                votes: votes[place.id] || 0
            }));

            if (center) {
                setPlaces(placesWithVotes);
            } else {
                setPlaces(placesWithVotes);
            }

        } catch (err) {
            console.error('Failed to fetch places:', err);
            setError('Failed to load places. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    const handleMapIdle = ({ bounds, center, zoom }: any) => {
        setMapBounds(bounds);

        // Calculate radius from bounds (approximate)
        const R = 6371e3; // metres
        const φ1 = center.lat * Math.PI / 180;
        const φ2 = bounds.north * Math.PI / 180;
        const Δφ = (bounds.north - center.lat) * Math.PI / 180;
        const Δλ = (bounds.east - center.lng) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const radius = R * c;

        const effectiveRadius = Math.max(radius, 2000);

        if (!lastFetchCenter || calculateDistance(center, lastFetchCenter) > 2000) {
            setLastFetchCenter(center);
            loadPlaces(center, effectiveRadius);
        }
    };

    const handleManualRefresh = () => {
        if (mapBounds) {
            const center = {
                lat: (mapBounds.north + mapBounds.south) / 2,
                lng: (mapBounds.east + mapBounds.west) / 2
            };
            loadPlaces(center, 5000);
        }
    };

    function calculateDistance(p1: any, p2: any) {
        const R = 6371e3;
        const φ1 = p1.lat * Math.PI / 180;
        const φ2 = p2.lat * Math.PI / 180;
        const Δφ = (p2.lat - p1.lat) * Math.PI / 180;
        const Δλ = (p2.lng - p1.lng) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    const handleVote = (id: string) => {
        setVotes(prev => ({
            ...prev,
            [id]: (prev[id] || 0) + 1
        }));

        setPlaces(prevPlaces => prevPlaces.map(place =>
            place.id === id ? { ...place, votes: (place.votes || 0) + 1 } : place
        ));
    };

    const handleSubmitVotes = async () => {
        const votedPlaces = places.filter(place => (place.votes || 0) > 0);

        if (votedPlaces.length === 0) {
            alert('Please vote for at least one place!');
            return;
        }

        setSubmitting(true);
        try {
            const votes = votedPlaces.map(place => ({
                placeId: place.id,
                placeName: place.name,
                placeLocation: place.location,
                placeDescription: place.description,
                placeTags: place.tags,
                votes: place.votes
            }));

            const data = await submitVotes(roomId, user!.userId, user!.userName, votes);

            if (data.success) {
                // User is now marked as ready
            } else {
                alert('Failed to submit votes. Please try again.');
            }
        } catch (err) {
            console.error('Error submitting votes:', err);
            alert('Failed to submit votes. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!user) {
        return <JoinRoom roomId={roomId} onJoin={setUser} />;
    }

    const currentUser = room?.users?.find((u: any) => u.userId === user.userId);
    if (currentUser?.isReady) {
        return <GroupStatus room={room} currentUser={user} />;
    }

    const filteredPlaces = places.filter(place => {
        if (activeFilter !== 'all' && !place.tags.includes(activeFilter)) {
            return false;
        }
        if (mapBounds) {
            const { lat, lng } = place.location;
            if (lat > mapBounds.north || lat < mapBounds.south || lng > mapBounds.east || lng < mapBounds.west) {
                return false;
            }
        }
        return true;
    });

    return (
        <div className="h-screen flex flex-col md:flex-row bg-tokyo-900 overflow-hidden">
            {/* Mobile Header */}
            <div className="md:hidden h-16 bg-tokyo-900 border-b border-white/10 flex items-center justify-between px-4 z-50">
                <span className="font-bold text-lg text-white">Plan</span>
                <div className="flex gap-2">
                    <button onClick={handleSubmitVotes} className="bg-tokyo-accent text-white px-3 py-1.5 rounded-lg text-sm font-medium">Done</button>
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-white">
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Sidebar (Place List) */}
            <div className={`
                fixed md:relative z-40 inset-0 md:inset-auto w-full md:w-[450px] bg-tokyo-900 md:border-r border-white/10 flex flex-col transition-transform duration-300
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <Sidebar
                    places={filteredPlaces}
                    onVote={handleVote}
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                    activeCity={activeCity}
                    onCityChange={setActiveCity}
                    onFinish={handleSubmitVotes}
                    loading={loading || submitting}
                    error={error}
                    roomInfo={room}
                    currentUser={user}
                />
            </div>

            {/* Map Area */}
            <div className="flex-1 bg-slate-950 relative">
                <Map
                    places={places}
                    loading={loading}
                    viewMode="voting"
                    onMapIdle={handleMapIdle}
                />

                {/* Overlay Controls */}
                <div className="absolute top-6 right-6 flex flex-col gap-2">
                    <button
                        onClick={handleManualRefresh}
                        className="bg-tokyo-800/80 backdrop-blur text-white p-3 rounded-xl border border-white/10 shadow-lg hover:bg-tokyo-700 transition-all"
                        title="Search this area"
                    >
                        <Navigation className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
