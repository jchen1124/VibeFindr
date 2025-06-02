import {states} from './default_place_data.js';


function createStateCard(state) {
  return ` 
          <div class="place-card" data-state-id="${state.id}">
              <img src="${state.image}" alt="${state.name}" class="place-image">
              <div class="place-name">
                <h3>${state.name} </h3>
              </div>
          
          </div>
  `;
}

// Function to load states into the grid
function loadStates() {
  const placesContainer = document.getElementById("places-container");

  if (placesContainer != null) {
    const stateHTML = states.map((state) => createStateCard(state)).join("");
    placesContainer.innerHTML = stateHTML;
  } else {
    console.error("Error finding state");
  }
}

// Initialize when the page loads
document.addEventListener("DOMContentLoaded", () => {
  loadStates();
});
