# VibeFindr 🌍✈️

**"New in Town? We've Got You Covered."**

VibeFindr is a modern web application that helps travelers discover amazing places and create personalized travel itineraries. Whether you're exploring a new city or planning your next adventure, VibeFindr provides intelligent recommendations and custom scheduling to make your trip unforgettable.

## 🚀 Features

- **Smart Place Discovery**: Find trending attractions, restaurants, and activities in any location
- **Personalized Scheduling**: Get custom itineraries tailored to your interests, budget, and time constraints
- **Group Travel Planning**: Plan trips for any group size with adaptive recommendations
- **Real-time Location Services**: Use your current location or search any destination worldwide
- **Interactive Maps**: Visual exploration of places with detailed information and photos

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (version 16 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)

## 🚀 Installation

### 1. Clone the Repository

```
git clone https://github.com/jchen1124/VibeFindr.git
cd vibefndr
```

### 2. Install Dependencies

```
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

#### Getting API Keys:

**Google Maps API Key:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Places API
   - Geocoding API
   - Maps JavaScript API
4. Create credentials (API Key)
5. Restrict the API key to your domain for security

**OpenAI API Key:**

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add it to your `.env` file

### 4. Start the Development Server

```
# Start the server
npm start

# Or for development with auto-reload
npm run dev
```

The application will be available at `http://localhost:3001`



