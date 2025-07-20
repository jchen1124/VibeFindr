// Loads environment variables from a .env file into process.env
import 'dotenv/config';
import express from 'express';
import axios from 'axios'; // Library for making http request to other servers
import cors from 'cors'; // middleware to allow requests from a different domain (your frontend) to access your backend.

const app = express();
const PORT = 3001;

app.use(cors()); // allows frontend to make request to back end
app.use(express.json());

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Endpoint to get nearby places
app.get('/api/places', async (req, res) => {
    try {
      const { location, type, radius} = req.query;
      
      if (!location) {
        return res.status(400).json({ error: 'Location is required' });
      }
  
      // Make request to Google Places API
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
        {
          params: {
            location,
            radius,
            type: type || 'tourist_attraction',
            key: GOOGLE_MAPS_API_KEY,
          },
        }
      );
  
      res.json(response.data);
    } catch (error) {
      console.error('Error fetching places:', error);
      res.status(500).json({ error: 'Failed to fetch places' });
    }
  });

  // Endpoint to get place details
app.get('/api/place-details', async (req, res) => {
    try {
      const { place_id } = req.query;
      
      if (!place_id) {
        return res.status(400).json({ error: 'Place ID is required' });
      }
  
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/place/details/json',
        {
          params: {
            place_id,
            key: GOOGLE_MAPS_API_KEY,
          },
        }
      );
  
      res.json(response.data);
    } catch (error) {
      console.error('Error fetching place details:', error);
      res.status(500).json({ error: 'Failed to fetch place details' });
    }
  });
  
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
