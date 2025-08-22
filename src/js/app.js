import { states } from "../data/default_place_data.js";

document
  .getElementById("explore-button")
  .addEventListener("click", function () {
    window.location.href = "main_page.html";
  });

// Creating the cards for the 6 trending places
function createStateCard(state) {
  return `
        <div class="place-card" data-state-id="${state.id}">
            <img 
                src="${state.image}" 
                alt="${state.name}" 
                class="place-image"
                onerror="this.onerror=null; console.error('Failed to load image: ${state.image}'); this.src='./images/placeholder.jpg';"
            >
            <div class="place-info">
                <h3 class="place-name">${state.name}</h3>
            </div>
        </div>
    `;
}

// Putting together information about the trending states
function createActivityContent(state) {
  const activitiesList = state.activities
    .map(
      (activity) => `
        <div class="activity-item">
            <h4>${activity.name}</h4>
            <p>${activity.description}</p>
            <span class="location">📍 ${activity.location}</span>
        </div>
    `
    )
    .join("");

  return `
        <div class="activities-modal">
            <div class="modal-header">
                <h2>Things to Do in ${state.name}</h2>
                <button class="close-modal">&times;</button>
            </div>
            <div class="activities-list">
                ${activitiesList}
            </div>
        </div>
    `;
}

function showActivityContent(content) {
  const modalOverlay = document.createElement("div");
  modalOverlay.className = "modal-overlay";
  modalOverlay.innerHTML = content;
  document.body.appendChild(modalOverlay);

  // Close button functionality
  const closeBtn = modalOverlay.querySelector(".close-modal");
  closeBtn.addEventListener("click", () => {
    modalOverlay.remove();
  });

  // Close on overlay click
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.remove();
    }
  });
}

function loadStates() {
  const placesContainer = document.getElementById("places-container");
  if (placesContainer) {
    const statesHTML = states.map((state) => createStateCard(state)).join("");
    placesContainer.innerHTML = statesHTML;

    // Add click handlers to all state cards
    document.querySelectorAll(".place-card").forEach((card) => {
      card.addEventListener("click", () => {
        const stateId = card.dataset.stateId;
        const state = states.find((s) => s.id === stateId);
        if (state) {
          const modalContent = createActivityContent(state);
          showActivityContent(modalContent);
        }
      });
    });
  } else {
    console.error("Could not find places-container element");
  }
}

// Initialize when the page loads
document.addEventListener("DOMContentLoaded", () => {
  loadStates();
});
