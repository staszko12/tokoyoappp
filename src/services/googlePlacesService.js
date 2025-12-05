/**
 * Google Places API Service (New)
 * Fetches points of interest using the Google Places API (New)
 * Documentation: https://developers.google.com/maps/documentation/places/web-service/search-nearby
 */

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const BASE_URL = 'https://places.googleapis.com/v1/places:searchNearby';

// Major cities to search around to simulate "Japan-wide" coverage
const REGIONS = [
    { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
    { name: 'Kyoto', lat: 35.0116, lng: 135.7681 },
    { name: 'Osaka', lat: 34.6937, lng: 135.5023 }
];

/**
 * Map app filters to Google Places types
 */
const FILTER_MAPPING = {
    'vibe': ['tourist_attraction', 'amusement_park', 'night_club'],
    'architecture': ['church', 'mosque', 'synagogue', 'hindu_temple'], // Note: 'castle' is not a standard type in v1, using closest approximations or relying on text search if needed. Actually 'historical_landmark' is better.
    'old-sightseeing': ['place_of_worship', 'historical_landmark'],
    'nature': ['park', 'natural_feature'],
    'modern': ['shopping_mall', 'museum', 'art_gallery'],
    'all': ['tourist_attraction', 'historical_landmark', 'park', 'museum']
};

// Additional mapping for specific types not in the standard list if needed, 
// but for searchNearby we use 'includedTypes'.

/**
 * Fetch places from Google Places API
 * @param {string} [filter='all']
 * @param {number} [limit=30]
 * @param {string} [city='all']
 * @param {{lat: number, lng: number}|null} [center=null]
 * @param {number} [radius=5000]
 */
export async function fetchPlaces(filter = 'all', limit = 30, city = 'all', center = null, radius = 5000) {
    if (!API_KEY) {
        console.error('❌ Google Maps API Key is missing!');
        console.error('Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local');
        console.error('Current API_KEY value:', API_KEY);
        return [];
    }

    console.log('✅ Google Maps API Key found:', API_KEY.substring(0, 10) + '...');

    const types = FILTER_MAPPING[filter] || FILTER_MAPPING['all'];
    let allPlaces = [];

    // If center is provided, search around that location
    if (center && center.lat && center.lng) {
        try {
            const region = { name: 'Current View', lat: center.lat, lng: center.lng };
            // For dynamic search, we might want to fetch slightly fewer per call to be faster, 
            // but limit is passed in.
            const places = await fetchPlacesForRegion(region, types, limit, radius);
            allPlaces = places;
        } catch (error) {
            console.error('Error fetching places for current view:', error);
        }
    } else {
        // Fallback to existing city/region logic
        const regionsToSearch = city === 'all'
            ? REGIONS
            : REGIONS.filter(region => region.name.toLowerCase() === city.toLowerCase());

        // Distribute limit across regions
        const limitPerRegion = Math.ceil(limit / regionsToSearch.length);

        for (const region of regionsToSearch) {
            try {
                const places = await fetchPlacesForRegion(region, types, limitPerRegion);
                allPlaces = [...allPlaces, ...places];
            } catch (error) {
                console.error(`Error fetching places for ${region.name}:`, error);
            }
        }
    }

    // Shuffle and slice to exact limit (only if we have more than needed)
    if (allPlaces.length > limit) {
        return allPlaces.sort(() => 0.5 - Math.random()).slice(0, limit);
    }

    return allPlaces;
}

async function fetchPlacesForRegion(region, types, limit, radius = 10000.0) {
    try {
        // Google Places API has a max of 20 results per request
        const requestLimit = Math.min(limit, 20);

        const requestBody = {
            includedTypes: types,
            maxResultCount: requestLimit,
            locationRestriction: {
                circle: {
                    center: {
                        latitude: region.lat,
                        longitude: region.lng
                    },
                    radius: radius // Use provided radius
                }
            }
        };

        console.log(`Fetching places for ${region.name}:`, requestBody);

        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': API_KEY,
                'X-Goog-FieldMask': 'places.id,places.displayName,places.location,places.types,places.editorialSummary,places.photos,places.formattedAddress'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Google Places API Error:', {
                status: response.status,
                statusText: response.statusText,
                body: errorText
            });
            throw new Error(`Places API error: ${response.status}`);
        }

        const data = await response.json();
        return transformGooglePlacesData(data.places || []);
    } catch (error) {
        console.error('Error in fetchPlacesForRegion:', error);
        return [];
    }
}

/**
 * Transform Google Places data to app format
 */
function transformGooglePlacesData(places) {
    return places.map(place => {
        const lat = place.location?.latitude;
        const lng = place.location?.longitude;

        if (!lat || !lng) return null;

        let imageUrl = null;
        if (place.photos && place.photos.length > 0) {
            const photoName = place.photos[0].name;
            imageUrl = `https://places.googleapis.com/v1/${photoName}/media?key=${API_KEY}&maxHeightPx=400&maxWidthPx=400`;
        }

        return {
            id: place.id,
            name: place.displayName?.text || 'Unnamed Place',
            location: { lat, lng },
            tags: mapGoogleTypesToAppCategories(place.types),
            votes: 0,
            description: place.editorialSummary?.text || place.formattedAddress || 'No description available',
            aiDescription: place.editorialSummary?.text || `A popular ${place.types?.[0]?.replace('_', ' ') || 'place'} in Japan.`,
            image: imageUrl,
            googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${place.id}`,
            osmUrl: null // No longer applicable
        };
    }).filter(p => p !== null);
}

function mapGoogleTypesToAppCategories(types = []) {
    const categories = [];

    // Reverse mapping
    for (const [category, googleTypes] of Object.entries(FILTER_MAPPING)) {
        if (category === 'all') continue;
        if (types.some(t => googleTypes.includes(t))) {
            categories.push(category);
        }
    }

    if (categories.length === 0) categories.push('vibe'); // Default
    return [...new Set(categories)];
}
