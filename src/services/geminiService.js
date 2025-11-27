/**
 * Gemini AI Service
 * Integrates Google's Gemini AI to act as an expert tour guide
 * Generates optimized itineraries with route planning and local insights
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

// Initialize Gemini AI
let genAI;
if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
}

/**
 * Generate an optimized itinerary using Gemini AI
 * @param {Array} votedPlaces - Array of places that received votes
 * @returns {Promise<Object>} - Structured itinerary with route, timing, and suggestions
 */
export async function generateItinerary(votedPlaces) {
    if (!API_KEY) {
        throw new Error('Gemini API key is not configured');
    }

    if (!votedPlaces || votedPlaces.length === 0) {
        throw new Error('No places provided for itinerary generation');
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const prompt = buildTourGuidePrompt(votedPlaces);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse the JSON response
        const itinerary = parseGeminiResponse(text);

        return itinerary;
    } catch (error) {
        console.error('Error generating itinerary with Gemini:', error);
        throw new Error('Failed to generate itinerary. Please try again.');
    }
}

/**
 * Build a comprehensive tour guide prompt for Gemini
 */
function buildTourGuidePrompt(votedPlaces) {
    const placesData = votedPlaces.map(place => ({
        name: place.name,
        location: place.location,
        description: place.description,
        tags: place.tags,
        votes: place.votes
    }));

    return `You are an expert local tour guide in Japan with deep knowledge of culture, transportation, and optimal travel routes. 

A group of travelers has voted on places they want to visit. Your task is to create the PERFECT one-day itinerary.

VOTED PLACES:
${JSON.stringify(placesData, null, 2)}

YOUR TASKS:
1. **Optimize the Route**: Reorder the places to minimize travel time and create a logical geographic flow
2. **Add 2-3 Suggestions**: Based on their interests (tags/votes), suggest additional places that complement their choices and fill gaps in the route
3. **Provide Commute Details**: For each transition between locations, specify:
   - Transportation method (walking, train, bus, taxi)
   - Estimated duration
   - Specific train/bus lines if applicable
   - Approximate cost in JPY
4. **Time Allocation**: Recommend how long to spend at each location
5. **Local Insights**: Add expert tips, best times to visit, what to look for, cultural notes

RESPONSE FORMAT (JSON):
{
  "itinerary": [
    {
      "place": {
        "id": "original_place_id or NEW_1, NEW_2 for suggestions",
        "name": "Place Name",
        "location": {"lat": 35.xxx, "lng": 139.xxx},
        "description": "Brief description",
        "tags": ["tag1", "tag2"],
        "votes": 5,
        "isAiSuggestion": false
      },
      "timeAllocation": "1-2 hours",
      "recommendedTime": "Morning (9-11 AM)",
      "tourGuideInsight": "Expert tip about this location",
      "commuteToNext": {
        "method": "Train",
        "duration": "15 minutes",
        "details": "Take Yamanote Line from Shibuya to Harajuku",
        "cost": "¥160"
      }
    }
  ],
  "overview": "Brief overview of the day's itinerary and total estimated time",
  "totalEstimatedTime": "8-9 hours",
  "totalEstimatedCost": "¥3,000-5,000"
}

IMPORTANT:
- Return ONLY valid JSON, no markdown formatting or code blocks
- For AI suggestions, set "isAiSuggestion": true and use "id": "NEW_1", "NEW_2", etc.
- Last place should have "commuteToNext": null
- Be specific with train/bus lines (e.g., "Yamanote Line", "Ginza Line")
- Consider opening hours and typical crowd patterns
- Make the route geographically efficient`;
}

/**
 * Parse Gemini's response and extract structured itinerary
 */
function parseGeminiResponse(text) {
    try {
        // Remove markdown code blocks if present
        let cleanText = text.trim();
        if (cleanText.startsWith('```json')) {
            cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (cleanText.startsWith('```')) {
            cleanText = cleanText.replace(/```\n?/g, '');
        }

        const parsed = JSON.parse(cleanText);

        // Validate the response structure
        if (!parsed.itinerary || !Array.isArray(parsed.itinerary)) {
            throw new Error('Invalid itinerary structure');
        }

        return parsed;
    } catch (error) {
        console.error('Error parsing Gemini response:', error);
        console.error('Raw response:', text);
        throw new Error('Failed to parse AI response');
    }
}
