// import config from "../config/config.js";
// const apiKey = config.GOOGLE_PLACES_API_KEY;

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

    const locationString = `${userLocation.lat}, ${userLocation.lng}`;
    const radius = 20000;
    const maxResult = 6;
    const type = "tourist_attraction";
    const response = await fetch(
      `http://localhost:3001/api/places?location=${locationString}&type=${type}&radius=${radius}`
    );
    const data = await response.json();
    console.log("full place data: ", data);
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
async function reverseGeocode(lat, lng) {
  try {
    const response = await fetch(
      `http://localhost:3001/api/reverse-geocode?lat=${lat}&lng=${lng}`
    );
    const data = await response.json();
    return data.address || "Address not found";
  } catch (error) {
    return "Address not found";
  }
}

async function displayPlaces(places) {
  const container = document.getElementById("nearby-places-container");

  if (!places || places.length === 0) {
    container.innerHTML = "<p>No places found</p>";
    return;
  }

  const placesHTML = places.map((place, index) => `
    <div class="place-card mb-3" onclick="showPlaceDetails('${place.place_id}', '${place.name}', '${place.rating || 'N/A'}', '${place.vicinity || 'Address not available'}', '${place.types ? place.types[0] : 'place'}')">
      <div class="card h-100 shadow-sm hover-effect">
        <div class="row g-0">
          <div class="col-md-4">
            <img src="http://localhost:3001/api/photo?photoreference=${place.photos ? place.photos[0].photo_reference : ''}&maxwidth=300" 
                 class="img-fluid rounded-start h-100 object-fit-cover" 
                 alt="${place.name}"
                 onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
          </div>
          <div class="col-md-8">
            <div class="card-body">
              <h5 class="card-title text-primary">${place.name}</h5>
              <div class="d-flex align-items-center mb-2">
                <div class="stars me-2">
                  ${generateStars(place.rating || 0)}
                </div>
                <span class="text-muted">(${place.rating || 'N/A'})</span>
              </div>
              <p class="card-text text-muted">
                <i class="fas fa-map-marker-alt me-2"></i>
                ${place.vicinity || 'Address not available'}
              </p>
              <div class="place-types">
                ${place.types ? place.types.slice(0, 3).map(type => 
                  `<span class="badge bg-secondary me-1">${type.replace(/_/g, ' ')}</span>`
                ).join('') : ''}
              </div>
              <div class="mt-2">
                <button class="btn btn-sm btn-outline-primary me-2" onclick="event.stopPropagation(); openGoogleMaps('${place.name}', '${place.vicinity || ''}')">
                  <i class="fas fa-map-marker-alt me-1"></i>Directions
                </button>
                <button class="btn btn-sm btn-outline-info" onclick="event.stopPropagation(); showPlaceDetails('${place.place_id}', '${place.name}', '${place.rating || 'N/A'}', '${place.vicinity || 'Address not available'}', '${place.types ? place.types[0] : 'place'}')">
                  <i class="fas fa-info-circle me-1"></i>Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  container.innerHTML = placesHTML;
}

// Helper function to generate star ratings
function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  let stars = '';
  for (let i = 0; i < fullStars; i++) {
    stars += '<i class="fas fa-star text-warning"></i>';
  }
  if (hasHalfStar) {
    stars += '<i class="fas fa-star-half-alt text-warning"></i>';
  }
  for (let i = 0; i < emptyStars; i++) {
    stars += '<i class="fas fa-star text-muted"></i>';
  }
  return stars;
}

// Function to show place details in a modal
function showPlaceDetails(placeId, name, rating, address, type) {
  // Create modal HTML
  const modalHTML = `
    <div class="modal fade" id="placeDetailsModal" tabindex="-1" aria-labelledby="placeDetailsModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title" id="placeDetailsModalLabel">
              <i class="fas fa-map-marker-alt me-2"></i>${name}
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-8">
                <div class="place-info">
                  <div class="mb-3">
                    <h6><i class="fas fa-star me-2 text-warning"></i>Rating</h6>
                    <div class="d-flex align-items-center">
                      ${generateStars(parseFloat(rating) || 0)}
                      <span class="ms-2 fw-bold">${rating}</span>
                    </div>
                  </div>
                  
                  <div class="mb-3">
                    <h6><i class="fas fa-map-marker-alt me-2 text-danger"></i>Address</h6>
                    <p class="mb-0">${address}</p>
                  </div>
                  
                  <div class="mb-3">
                    <h6><i class="fas fa-tag me-2 text-info"></i>Type</h6>
                    <span class="badge bg-primary">${type.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              </div>
              
              <div class="col-md-4">
                <div class="place-actions">
                  <button class="btn btn-primary w-100 mb-2" onclick="openGoogleMaps('${name}', '${address}')">
                    <i class="fas fa-directions me-2"></i>Get Directions
                  </button>

                  <button class="btn btn-outline-info w-100" onclick="sharePlace('${name}', '${address}')">
                    <i class="fas fa-share me-2"></i>Share
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Remove existing modal if any
  const existingModal = document.getElementById("placeDetailsModal");
  if (existingModal) {
    existingModal.remove();
  }

  // Add modal to body
  document.body.insertAdjacentHTML("beforeend", modalHTML);

  // Show modal
  const modal = new bootstrap.Modal(document.getElementById("placeDetailsModal"));
  modal.show();
}

// Function to open Google Maps
function openGoogleMaps(placeName, address) {
  const searchQuery = encodeURIComponent(`${placeName} ${address}`);
  const googleMapsUrl = `https://www.google.com/maps/search/${searchQuery}`;
  window.open(googleMapsUrl, '_blank');
}

// Function to add place to schedule (you can expand this later)
function addToSchedule(placeName, address, type) {
  // For now, just show a message
  alert(`Added "${placeName}" to your schedule!`);
  // Later you can implement actual schedule integration
}

// Function to share place (you can expand this later)
function sharePlace(placeName, address) {
  if (navigator.share) {
    navigator.share({
      title: placeName,
      text: `Check out ${placeName} at ${address}`,
      url: window.location.href
    });
  } else {
    // Fallback: copy to clipboard
    const textToCopy = `${placeName} - ${address}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      alert('Place details copied to clipboard!');
    });
  }
}
