import config from "../config/config.js";
const apiKey = config.GOOGLE_PLACES_API_KEY;

document.addEventListener("DOMContentLoaded", () => {
  findAndShowNearbyPlaces();
});

async function findAndShowNearbyPlaces() {
  try {
    document.getElementById("places-loading-spinner").style.display = "flex";
    const position = await getUsersLocation();
    const userLocation = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };

    console.log("User location:", userLocation);

    // const restaurantRequest = {
    //   fields: ["displayName", "location", "rating", "photos"],
    //   locationRestriction: {
    //     center: userLocation,
    //     radius: 5000,
    //   },
    //   includedTypes: ["restaurant"],
    //   maxResultCount: 5,
    // };

    // const attractionRequest = {
    //   fields: ["displayName", "location", "rating", "photos"],
    //   locationRestriction: {
    //     center: userLocation,
    //     radius: 20000,
    //   },
    //   includedTypes: ["tourist_attraction"],
    //   maxResultCount: 6,
    // };

    // Now you can use importLibrary directly
    // const { Place } = await google.maps.importLibrary("places");
    // const { places } = await Place.searchNearby(attractionRequest);

    const locationString = `${userLocation.lat}, ${userLocation.lng}`;
    const radius = 20000;
    const maxResult = 6;
    const type = "tourist_attraction"
    const response = await fetch(
      `http://localhost:3001/api/places?location=${locationString}&type=${type}&radius=${radius}`
    );
    const data = await response.json();
    const places = data.results.slice(0, maxResult);

    displayPlaces(places);
    document.getElementById("places-loading-spinner").style.display = "none";
  } catch (error) {
    document.getElementById("places-loading-spinner").style.display = "none";
    console.error("An error has occurred: ", error);
    document.getElementById("nearby-places-container").innerText =
      "Error occurred";
  }
}

function getUsersLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(Error("Geolocation is not supported by your browser"));
    }
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

// Takes lat & lng and converts it to the actual address
function reverseGeocode(lat, lng) {
  return new Promise((resolve, reject) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results[0]) {
        resolve(results[0].formatted_address);
      } else {
        resolve("Address not found");
      }
    });
  });
}

async function displayPlaces(places) {
  const container = document.getElementById("nearby-places-container");

  if (!places || places.length === 0) {
    container.innerHTML = "<p>No places found</p>";
    return;
  }

  // Create cards of each place
  const placeCards = await Promise.all(
    places.map(async (place) => {
      let name = "Unknown Name";
      if (place.displayName) name = place.displayName.text || place.displayName;
      let lat =
        typeof place.location.lat === "function"
          ? place.location.lat()
          : place.location.lat;
      let lng =
        typeof place.location.lng === "function"
          ? place.location.lng()
          : place.location.lng;

      // Get Location

      let location = "Location not available";
      let address = "Address not available";

      if (typeof lat === "number" && typeof lng === "number") {
        location = `${lat.toFixed(2)}, ${lng.toFixed(2)}`;
        address = await reverseGeocode(lat, lng);
      }

      const rating = place.rating ? `${place.rating} / 5` : "No Rating";

      // Default HTML if no photo is shown
      let photosHTML = `<div style="width: 100%; height: 200px; background-color: #f0f0f0; border-radius: 8px; display: flex; align-items: center; justify-content: center;"> <i class='fas fa-image fa-2x text-muted'></i> </div>`;
      if (place.photos && place.photos.length > 0 && place.photos[0].Dg) {
        const photoRef = place.photos[0].Dg.split("/photos/")[1];
        if (photoRef) {
          photosHTML = `<img src="https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoRef}&key=${apiKey}" alt="${name}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">`;
        }
      }
      return `
        <div class="col-md-6 col-lg-4 mb-4">
          <div class="card h-100 shadow-sm">
           ${photosHTML}
           <div class="card-body">
             <div class="place-icons mb-2">
               <i class="fas fa-map-marker-alt"></i> <span>${address}</span>
               <i class="fas fa-star ms-3"></i> <span>${rating}</span>
             </div>
             <h5 class="card-title">${name}</h5>
           </div>
          </div>
        </div>
      `;
    })
  );
  container.innerHTML = `<div class="row"> ${placeCards.join("")}</div>`;
}
