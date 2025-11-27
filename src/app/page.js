'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Map from '@/components/Map';
import { fetchPlaces } from '@/services/googlePlacesService';
import { generateItinerary } from '@/services/geminiService';
import styles from './page.module.css';

export default function Home() {
    const [places, setPlaces] = useState([]);
    const [activeFilter, setActiveFilter] = useState('all');
    const [activeCity, setActiveCity] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [generatingItinerary, setGeneratingItinerary] = useState(false);

    // Fetch places from Google Places API
    useEffect(() => {
        async function loadPlaces() {
            setLoading(true);
            setError(null);

            try {
                const fetchedPlaces = await fetchPlaces(activeFilter, 30, activeCity);
                setPlaces(fetchedPlaces);
            } catch (err) {
                console.error('Failed to fetch places:', err);
                setError('Failed to load places. Please try again.');
            } finally {
                setLoading(false);
            }
        }

        loadPlaces();
    }, [activeFilter, activeCity]);

    const handleVote = (id) => {
        setPlaces(places.map(place =>
            place.id === id ? { ...place, votes: place.votes + 1 } : place
        ));
    };

    const handleFinishVoting = async () => {
        const votedPlaces = places.filter(place => place.votes > 0);

        if (votedPlaces.length === 0) {
            alert('Please vote for at least one place before generating an itinerary!');
            return;
        }

        setGeneratingItinerary(true);
        setError(null);

        try {
            const generatedItinerary = await generateItinerary(votedPlaces);
            // Store itinerary in sessionStorage for the itinerary page
            sessionStorage.setItem('itinerary', JSON.stringify(generatedItinerary));
            // Navigate to itinerary page
            window.location.href = '/itinerary';
        } catch (err) {
            console.error('Failed to generate itinerary:', err);
            setError('Failed to generate itinerary. Please try again.');
        } finally {
            setGeneratingItinerary(false);
        }
    };

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
                onFinish={handleFinishVoting}
                loading={loading || generatingItinerary}
                error={error}
            />
            <Map
                places={places}
                loading={loading}
                viewMode="voting"
            />
        </main>
    );
}
