'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Map from '@/components/Map';
import JoinRoom from '@/components/JoinRoom';
import GroupStatus from '@/components/GroupStatus';
import { fetchPlaces } from '@/services/googlePlacesService';
import styles from './page.module.css';

export default function RoomPage() {
    const params = useParams();
    const router = useRouter();
    const roomId = params.roomId;

    const [user, setUser] = useState(null); // { userId, userName }
    const [room, setRoom] = useState(null);
    const [places, setPlaces] = useState([]);
    const [votes, setVotes] = useState({}); // { placeId: voteCount } - persists across filter changes
    const [activeFilter, setActiveFilter] = useState('all');
    const [activeCity, setActiveCity] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

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
                        sessionStorage.setItem('itinerary', JSON.stringify(data.itinerary));
                        router.push('/itinerary');
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
        async function loadPlaces() {
            setLoading(true);
            try {
                const fetchedPlaces = await fetchPlaces(activeFilter, 30, activeCity);
                // Merge with existing votes
                const placesWithVotes = fetchedPlaces.map(place => ({
                    ...place,
                    votes: votes[place.id] || 0  // Preserve votes across filter changes
                }));
                setPlaces(placesWithVotes);
            } catch (err) {
                console.error('Failed to fetch places:', err);
                setError('Failed to load places. Please try again.');
            } finally {
                setLoading(false);
            }
        }

        if (user) {
            loadPlaces();
        }
    }, [activeFilter, activeCity, user]); // Removed votes from dependency to avoid re-fetch

    const handleVote = (id) => {
        // Update votes object
        setVotes(prev => ({
            ...prev,
            [id]: (prev[id] || 0) + 1
        }));

        // Update local places state immediately for UI responsiveness
        setPlaces(prevPlaces => prevPlaces.map(place =>
            place.id === id ? { ...place, votes: (place.votes || 0) + 1 } : place
        ));
    };

    const handleSubmitVotes = async () => {
        const votedPlaces = places.filter(place => place.votes > 0);

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

            const response = await fetch(`/api/rooms/${roomId}/votes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.userId,
                    userName: user.userName,
                    votes
                })
            });

            const data = await response.json();

            if (data.success) {
                // User is now marked as ready
                // Poll will handle redirect when all ready
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

    // Show join modal if not joined
    if (!user) {
        return <JoinRoom roomId={roomId} onJoin={setUser} />;
    }

    // Show waiting screen if user has submitted
    const currentUser = room?.users?.find(u => u.id === user.userId);
    if (currentUser?.isReady) {
        return (
            <main className={styles.main}>
                <GroupStatus room={room} currentUser={user} />
            </main>
        );
    }

    const filteredPlaces = activeFilter === 'all'
        ? places
        : places.filter(place => place.tags.includes(activeFilter));

    return (
        <main className={styles.main}>
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
            <Map
                places={places}
                loading={loading}
                viewMode="voting"
            />
        </main>
    );
}
