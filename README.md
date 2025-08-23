# VibeFindr - Travel Planning App

A smart travel planning application that uses AI to help you discover places and create personalized itineraries.


1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory with:

   ```
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   OPENAI_API_KEY=your_openai_api_key
   ```

3. **Start the server:**

   ```bash
   node src/js/server.js
   ```

4. **Access the application:**
   - Homepage: http://localhost:3001
   - Main page: http://localhost:3001/main_page.html
   - Schedule page: http://localhost:3001/schedule.html

## Features

- **Smart AI Discovery**: Natural language search for places
- **Personalized Schedules**: AI-generated itineraries
- **Real-Time Location**: Find places near you
- **Group Travel Planning**: Adapts to group preferences
- **Trending Places**: Discover popular destinations

## File Paths

All HTML files are now in the `public/` folder and reference assets in `src/` using relative paths (`../src/`). The Express server serves static files from the `public/` directory.
