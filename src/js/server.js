// Loads environment variables from a .env file into process.env
import "dotenv/config";
import express from "express";
import axios from "axios"; // Library for making http request to other servers
import cors from "cors"; // middleware to allow requests from a different domain (your frontend) to access your backend. or allow web applications to make API request
import OpenAI from "openai"; // OpenAI library

const app = express();
const PORT = 3001;

app.use(cors()); // allows frontend to make request to back end
app.use(express.json());

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const OPENAI_API_KEY = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/api/places", async (req, res) => {
  try {
    const { location, type, radius } = req.query;

    if (!location) {
      return res.status(400).json({ error: "Location is required" });
    }

    // Make request to Google Places API
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
      {
        params: {
          location,
          radius,
          type: type || "tourist_attraction",
          key: GOOGLE_MAPS_API_KEY,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching places:", error);
    res.status(500).json({ error: "Failed to fetch places" });
  }
});

// Endpoint to get place details
app.get("/api/place-details", async (req, res) => {
  try {
    const { place_id } = req.query;

    if (!place_id) {
      return res.status(400).json({ error: "Place ID is required" });
    }

    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/place/details/json",
      {
        params: {
          place_id,
          key: GOOGLE_MAPS_API_KEY,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching place details:", error);
    res.status(500).json({ error: "Failed to fetch place details" });
  }
});

app.get("/api/photo", async (req, res) => {
  const { photoreference, maxwidth = 400 } = req.query;
  if (!photoreference) {
    return res.status(400).send("Missing photoreference");
  }
  const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxwidth}&photoreference=${photoreference}&key=${GOOGLE_MAPS_API_KEY}`;
  try {
    const response = await axios.get(url, {
      responseType: "stream",
    });
    response.data.pipe(res);
  } catch {
    res.status(500).send("Failed to fetch photo");
  }
});

app.get("/api/reverse-geocode", async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) {
    return res.status(400).json({ error: "lat and lng are both required" });
  }

  try {
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/geocode/json",
      {
        params: {
          latlng: `${lat}, ${lng}`,
          key: GOOGLE_MAPS_API_KEY,
        },
      }
    );
    const results = response.data.results;
    if (results && results.length > 0) {
      res.json({ address: results[0].formatted_address });
    } else {
      res.json({ address: "Address not found" });
    }
  } catch (error) {
    console.error("Error in reverse geocoding:", error);
    res.status(500).json({ error: "Failed to reverse geocode" });
  }
});

// Google Api
app.post("/api/search-places", async (req, res) => {
  try {
    const { usersQuery, usersLocation } = req.body;

    if (!usersQuery) {
      return res.status(400).json({ error: "user query required" });
    }

    const aiResponse = await OpenAI.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a travel assistant. Parse the user's request and return a JSON object with:
          - location: city/area they want to explore
          - type: type of place (restaurant, tourist_attraction, bar, mall etc.)
          - radius: search radius in meters (default 7000)
          - keywords: relevant search terms
          - group_size: number of people (if mentioned)
          
          Return ONLY valid JSON, no other text.`,
        },
        {
          role: "user",
          content: usersQuery,
        },
      ],
      temperature: 0.3,
    });

    // fill in required content
    // Hopefully for location: try to use users current location

    const parsedQuery = JSON.parse(aiResponse.choices[0].message.content)
    const location = usersLocation ? `${usersLocation.lat}, ${usersLocation.lng}` : '40.7128,-74.0060';
    

    const placesResponse = await axios.get(
      "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
      {
        params: {
          location: location,
          radius:  parsedQuery.location || 7000,
          type: parsedQuery.type || 'tourist_attraction',
          keyword: parsedQuery.keywords,
          key: GOOGLE_MAPS_API_KEY
        }
      }
    );
    res.json({
      places: placesResponse.data.results,
      parsedQuery: parsedQuery,
      originalQuery: userQuery,
      userLocation: userLocation
    })
  } catch (error) {
    console.error("Error");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
