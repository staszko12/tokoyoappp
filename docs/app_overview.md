# Japan Trip Planner - Application Overview & Documentation

## 1. Introduction
**Japan Trip Planner** is a collaborative web application designed to help groups plan their trips to Japan. It allows users to create rooms, invite friends, explore points of interest on a map, vote on their favorite locations, and generate an AI-curated itinerary based on the group's preferences.

**Target Audience for this Doc:** UI Designers and Frontend Developers tasked with redesigning the application's interface.

---

## 2. Core Functionality & User Flow

The application flow is linear and state-based, centered around a "Room".

### Phase 1: Onboarding & Room Management
*   **Landing Page**: Users can either **Create a new Room** or **Join an existing Room**.
*   **Create Room**: User enters their name and creates a room. They become the first member.
*   **Join Room**: User enters a Room ID and their name to join a session.
*   **Lobby/Waiting**: Users wait for all group members to join.
    *   *Key Interaction*: "Ready" toggle. Once all users are ready, the host (or system) advances to the voting phase.

### Phase 2: Discovery & Voting
*   **Map Interface**: The core view. Displays Google Maps with markers for various points of interest (POIs) in Japan (specifically Tokyo/districts).
*   **Filtering**: Users can filter places by categories (e.g., "Vibe", "Architecture", "Old Sights", "Food").
*   **Place Details**: Clicking a marker or list item shows details (photos, rating, description).
*   **Voting**:
    *   Each user can "Vote" for places they want to visit.
    *   Votes are real-time or synchronized.
    *   *Goal*: collaborative selection of top spots.

### Phase 3: Results & Itinerary
*   **Results View**: Displays the most popular places based on group votes.
*   **Itinerary Generation**:
    *   The system uses **Gemini AI** to generate a day-by-day itinerary.
    *   Input: The group's top-voted places.
    *   Output: A structured plan (e.g., "Day 1: Shibuya Crossing & Harajuku").
*   **Export**: Option to export the final plan to Google Maps (planned/implemented feature).

---

## 3. Technical Stack & Architecture

*   **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
*   **Language**: TypeScript / JavaScript
*   **Database**: PostgreSQL (via Prisma ORM)
*   **Maps**: Google Maps JavaScript API (`@vis.gl/react-google-maps`)
*   **AI**: Google Gemini API (`@google/generative-ai`)
*   **Styling**: CSS Modules (Current state - likely to be replaced or enhanced by the redesign)

---

## 4. Component Architecture (Current)

The UI is built with the following key components. The redesign should account for these functional blocks.

### `src/components/`

*   **`CreateRoom.js` / `JoinRoom.js`**: Forms for user onboarding.
    *   *Inputs*: Username, Room ID (for joining).
    *   *Actions*: Submit to API.
*   **`GroupStatus.js`**: Displays the list of users in the room and their "Ready" status.
    *   *Visuals*: User avatars/names, status indicators (waiting/ready).
*   **`Map.js`**: The interactive map component.
    *   *Features*: Markers, InfoWindows, Zoom/Pan controls.
    *   *Data*: Renders places fetched from Google Places API.
*   **`Sidebar.js`**: The side panel for listing places and details.
    *   *Content*: List of places (syncs with map bounds/filters), Place Details view.
*   **`FilterBar.js`**: Controls for filtering map results.
    *   *UI*: Chips, dropdowns, or toggles for categories.
*   **`ItineraryView.js`**: Displays the generated itinerary.
    *   *Format*: Timeline or day-by-day list.

### `src/services/` (Backend Logic)

*   **`googlePlacesService.js`**: Fetches place data (text search, details) from Google Maps Platform.
*   **`voteService.js`**: Handles voting logic (add/remove votes, count totals).
*   **`geminiService.js`**: Prompts Gemini AI to create the itinerary text based on place names.

---

## 5. Data Model (Prisma)

Understanding the data helps in designing the UI states.

*   **Room**:
    *   `id`: Unique code shared to join.
    *   `status`: `waiting` -> `voting` -> `results`? (Implied flow).
    *   `itinerary`: Stores the final AI result.
*   **User**:
    *   Belongs to a `Room`.
    *   Has `name` and `isReady` status.
*   **Vote**:
    *   Links `User` + `Room` + `Place`.
    *   Stores `placeData` (JSON) to avoid re-fetching.

---

## 6. Design & UI/UX Requirements for Redesign

### Goals
*   **Visuals**: Modern, vibrant, "premium" feel. Avoid generic Bootstrap/Material looks.
*   **Responsiveness**: Must work seamlessly on Mobile (for on-the-go voting) and Desktop (for planning).
*   **Feedback**: Clear visual cues for:
    *   Voting (Heart/Star animation).
    *   User status changes (e.g., "Alice is ready").
    *   Map interactions (Selected state).

### Key Screens to Design
1.  **Home/Landing**: Welcoming, clear call-to-action (Create vs Join).
2.  **Lobby**: Social feel, showing who is in the trip.
3.  **Main Planner (Split View)**:
    *   Map (Dominant on Desktop).
    *   List/Sidebar (Drawer on Mobile).
    *   Filters (Easy access).
4.  **Results/Itinerary**: Clean, readable timeline of the trip.

---

## 7. API Endpoints (Reference)

*   `/api/rooms`: Create room.
*   `/api/rooms/[roomId]/join`: Join room.
*   `/api/rooms/[roomId]/votes`: Submit/fetch votes.
*   `/api/itinerary`: Generate itinerary.
