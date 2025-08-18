document.addEventListener("DOMContentLoaded", function () {
  const locationInput = document.getElementById("location");
  const useCurrentLocationButton =
    document.getElementById("useCurrentLocation");

  useCurrentLocationButton.addEventListener("click", async () => {
    try {
      //loading spinner
      useCurrentLocationButton.innerHTML =
        '<i class="fas fa-spinner fa-spin me-2"></i>Getting Location...';
      useCurrentLocationButton.disabled = true;

      const position = await getUsersLocation();
      const userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      console.log("User location:", userLocation);
      const address = await reverseGeocode(userLocation.lat, userLocation.lng);
      locationInput.value = address;

      locationInput.dataset.lat = userLocation.lat;
      locationInput.dataset.lng = userLocation.lng;
      showMessage("Location detected successfully!", "success");
    } catch (error) {
      console.error("Error getting user location:", error);
      alert("Could not get your current location. Please enter it manually.");
    } finally {
      // Reset button state
      useCurrentLocationButton.innerHTML =
        '<i class="fas fa-location-arrow me-2"></i>Use Current Location';
      useCurrentLocationButton.disabled = false;
    }
  });

  function getUsersLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        return reject(Error("Geolocation is not supported by your browser"));
      }
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  }

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

  function showMessage(message, type) {
    // Create a temporary message element
    const messageDiv = document.createElement("div");
    messageDiv.className = `alert alert-${
      type === "success" ? "success" : "danger"
    } alert-dismissible fade show`;
    messageDiv.innerHTML = `
         ${message}
         <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
     `;

    // Insert message above the location field
    const locationField = document.getElementById("location").closest(".mb-3");
    locationField.parentNode.insertBefore(
      messageDiv,
      locationField.nextSibling
    );

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 5000);
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const generateScheduleButton = document.getElementById("generateSchedule");

  generateScheduleButton.addEventListener("click", async function () {
    try {
      generateScheduleButton.innerHTML = `<i class="fa-solid fa-spinner"></i> Generating...`;
      generateScheduleButton.disabled = true;

      const formData = collectFormData();
      //send form data to backend -- come back here
      const response = await fetch(
        "http://localhost:3001/api/generate-schedule",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      displaySchedule(data.schedule);
    } catch (error) {
      console.error("Error generating schedule:", error);
    } finally {
      generateScheduleButton.innerHTML = `<i class="fa-solid fa-calendar"></i> Generate Schedule`;
      generateScheduleButton.disabled = false;
    }
  });

  function collectFormData() {
    const startTime = document.getElementById("startTime").value;
    const endTime = document.getElementById("endTime").value;
    const location = document.getElementById("location").value;
    const budget = document.getElementById("budget").value;
    const groupSize = document.getElementById("groupSize").value;
    const specialRequests = document.getElementById("specialRequests").value;

    const interests = [];
    if (document.getElementById("food").checked) {
      interests.push("food");
    }
    if (document.getElementById("culture").checked) {
      interests.push("culture");
    }
    if (document.getElementById("outdoors").checked) {
      interests.push("Outdoor activities");
    }
    if (document.getElementById("attractions").checked) {
      interests.push("Tourist attractions");
    }
    if (document.getElementById("shopping").checked) {
      interests.push("shopping");
    }
    if (document.getElementById("entertainment").checked) {
      interests.push("entertainment");
    }
    if (document.getElementById("relaxation").checked) {
      interests.push("relaxation");
    }
    const lat = document.getElementById("location").dataset.lat;
    const lng = document.getElementById("location").dataset.lng;

    return {
      startTime,
      endTime,
      location,
      budget,
      groupSize,
      specialRequests,
      interests,
      lat,
      lng,
      coordinates:
        lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null,
    };
  }

  function displaySchedule(schedule) {
    const scheduleContainer = document.getElementById("scheduleContainer");
    scheduleContainer.innerHTML = ""; // Clear previous schedule

    if (!schedule || schedule.length === 0) {
      scheduleContainer.innerHTML = "<p>No schedule generated.</p>";
      return;
    }

    const scheduleList = schedule
      .map(
        (item, index) => `
    <div class="schedule-item mb-3" data-category="${item.category.toLowerCase()}">
    <div class="schedule-card">
      <div class="schedule-time-badge">
        <i class="fas fa-clock me-2"></i>
        <span>${item.time}</span>
      </div>
      
      <div class="schedule-content">
        <div class="schedule-header">
          <h5 class="schedule-title mb-2">
            <i class="fas fa-star me-2"></i>
            ${item.activity}
          </h5>
          <span class="schedule-category">${item.category}</span>
        </div>
        
        <p class="schedule-description">${item.description}</p>
        
        <div class="schedule-footer">
          <span class="schedule-number">${index + 1}</span>
          <div class="schedule-actions">
            <button class="btn btn-sm btn-outline-primary me-2" onclick="openGoogleMaps('${
              item.activity
            }', '${getCurrentLocation()}')">
              <i class="fas fa-map-marker-alt me-1"></i>Map
            </button>
            <button class="btn btn-sm btn-outline-info" onclick="showActivityDetails('${
              item.activity
            }', '${item.description}', '${item.category}', '${item.time}')">
              <i class="fas fa-info-circle me-1"></i>Details
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
    `
      )
      .join("");

    scheduleContainer.innerHTML = scheduleList;
  }

  
});

// Function to open Google Maps
function openGoogleMaps(activity, location) {
  // Get user's current location or use a default
  const searchQuery = encodeURIComponent(`${activity} near ${location}`);
  const googleMapsUrl = `https://www.google.com/maps/search/${searchQuery}`;

 
  window.open(googleMapsUrl, "_blank");
}

// Function to show activity details in a modal
function showActivityDetails(activity, description, category, time) {
  // Create modal HTML
  const modalHTML = `
  <div class="modal fade" id="activityModal" tabindex="-1" aria-labelledby="activityModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="activityModalLabel">
            <i class="fas fa-calendar-check me-2"></i>${activity}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-md-6">
              <p><strong><i class="fas fa-clock me-2"></i>Time:</strong></p>
              <p class="text-primary">${time}</p>
            </div>
            <div class="col-md-6">
              <p><strong><i class="fas fa-tag me-2"></i>Category:</strong></p>
              <span class="badge bg-primary">${category}</span>
            </div>
          </div>
          <hr>
          <p><strong><i class="fas fa-info-circle me-2"></i>Description:</strong></p>
          <p>${description}</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <button type="button" class="btn btn-primary" onclick="openGoogleMaps('${activity}', '${getCurrentLocation()}')">
            <i class="fas fa-map-marker-alt me-2"></i>Find on Map
          </button>
        </div>
      </div>
    </div>
  </div>
`;

  // Remove existing modal if any
  const existingModal = document.getElementById("activityModal");
  if (existingModal) {
    existingModal.remove();
  }

  // Add modal to body
  document.body.insertAdjacentHTML("beforeend", modalHTML);

  // Show modal
  const modal = new bootstrap.Modal(document.getElementById("activityModal"));
  modal.show();
}

// Helper function to get current location
function getCurrentLocation() {
  // Try to get from location input
  const locationInput = document.getElementById("location");
  if (locationInput && locationInput.value) {
    return locationInput.value;
  }

  // Fallback to default
  return "New York, NY";
}
