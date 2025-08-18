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
const openai = new OpenAI({
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

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a travel assistant. Parse the user's request and return a JSON object with:
          - type: type of place(s). If multiple types mentioned, separate with " and " (e.g., "bar and park", "restaurant and cafe")
          - radius: search radius in meters (default 10000)
          - keywords: relevant search terms
          - group_size: number of people (if mentioned)

        Examples:
        "bars and parks" → {"type": "bar and park", "radius": 10000, "keywords": "bars parks"}
        "restaurants and cafes" → {"type": "restaurant and cafe", "radius": 10000, "keywords": "restaurants cafes"}

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

    const parsedQuery = JSON.parse(aiResponse.choices[0].message.content);

    console.log("AI response:", aiResponse);
    console.log("Parsed query:", parsedQuery);

    const location = usersLocation
      ? `${usersLocation.lat}, ${usersLocation.lng}`
      : "40.7128,-74.0060";

    const placesResponse = await axios.get(
      "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
      {
        params: {
          location: location,
          radius: parsedQuery.radius || 10000,
          type: parsedQuery.type || "tourist_attraction",
          keyword: parsedQuery.keywords,
          key: GOOGLE_MAPS_API_KEY,
        },
      }
    );
    res.json({
      places: placesResponse.data.results,
      parsedQuery: parsedQuery,
      originalQuery: usersQuery,
      userLocation: usersLocation,
    });
  } catch (error) {
    console.error("Full error details:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      error: "Failed to search places",
      details: error.message,
    });
  }
});

app.post("/api/generate-schedule", async (req, res) => {
  try {
    console.log("Received request to generate schedule with body:", req.body);
    const {
      startTime,
      endTime,
      location,
      coordinates,
      interests,
      budget,
      groupSize,
      specialRequests,
    } = req.body;

    const prompt = `Create a detailed day schedule for a person with these preferences:  // Fixed typo: "scedule" → "schedule"
    Time Available: ${startTime} to ${endTime}
    Location: ${location}
    Interests: ${interests.join(", ")}
    Budget: ${budget}
    Group Size: ${groupSize}
    Special Requests: ${specialRequests}
    
    Please return a JSON array with schedule items. Each item should have:
    - time: time slot (e.g., "10:00 AM - 11:00 AM")
    - activity: what to do
    - description: brief description of the activity
    - category: type of activity (e.g., "food", "culture", "outdoor", "attraction", "shopping", "entertainment", "relaxation")
    
    Return ONLY valid JSON, no other text.`;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a travel planner AI. Generate detailed schedules based on user preferences. Return ONLY valid JSON, no markdown formatting, no code blocks, no other text.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5,
    });

    // Clean the response content before parsing
    let responseContent = aiResponse.choices[0].message.content;

    // Remove markdown code blocks if they exist
    if (responseContent.includes("```json")) {
      responseContent = responseContent
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "");
    }
    if (responseContent.includes("```")) {
      responseContent = responseContent.replace(/```\n?/g, "");
    }

    // Trim whitespace
    responseContent = responseContent.trim();

    console.log("Cleaned response content:", responseContent);

    try {
      // locate the choices[0] array in the response and get the first answer in that array
      // Inside the first answer, get the message object
      // and then get the content of that message
      // It returns a JSON object so use JSON.parse to convert it to a JavaScript object
      const schedule = JSON.parse(responseContent);
      console.log("Generated schedule:", schedule);
      res.json({
        schedule: schedule,
        userPreferences: req.body,
      });
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Failed to parse content:", responseContent);
      res.status(500).json({
        error: "Failed to parse AI response",
        details: "The AI returned invalid JSON format",
        rawContent: responseContent,
      });
    }
  } catch (error) {
    console.error("Error generating schedule:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      error: "Failed to generate schedule",
      details: error.message,
      stack: error.stack,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
