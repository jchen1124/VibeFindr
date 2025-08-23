// Configuration for different environments
const config = {
  development: {
    apiBaseUrl: "http://localhost:3001/api",
  },
  production: {
    apiBaseUrl: "https://your-backend-url.com/api", // Replace with your actual backend URL
  },
};

// Determine environment
const isDevelopment =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";
const currentConfig = isDevelopment ? config.development : config.production;

export default currentConfig;
