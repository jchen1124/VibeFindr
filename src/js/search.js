document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.querySelector(".search-input");
  const searchButton = document.querySelector(".search-button");

  searchButton.addEventListener("click", async () => {
    await performSearch();
  });

  searchInput.addEventListener("keypress", async (e) => {
    if (e.key === "Enter") {
      await performSearch();
    }
  });
});

document
  .getElementById("schedule-button")
  .addEventListener("click", function () {
    window.location.href = "../public/schedule.html";
  });



async function performSearch() {
  const searchInput = document.querySelector(".search-input");
  const userQuery = searchInput.value.trim();

  if (!userQuery) {
    alert("Nothing Entered");
    return;
  }

  // Try to search
  try {
    document.getElementById("places-loading-spinner").style.display = "flex";
    // Attemps to get users location
    let userLocation = null;
    try {
      const position = await getUsersLocation();
      userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
    } catch (error) {
      console.log("Could not get users location, using default");
    }

    const response = await fetch("http://localhost:3001/api/search-places", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        usersQuery: userQuery,
        usersLocation: userLocation,
      }),
    });

    // Data response from backend
    const data = await response.json();
    console.log("Response from server:", data);

    if (data.error) {
      throw new Error(data.error);
    }
    console.log("displayPlaces function:", typeof displayPlaces);
    displayPlaces(data.places);

    //Test
    console.log("AI parsed this as", data.parsedQuery);
  } catch (error) {
    console.error("Search error: ", error);
    document.getElementById("nearby-places-container").innerHTML =
      '<p class="text-center text-danger">Error performing search. Please try again.</p>';
  } finally {
    document.getElementById("places-loading-spinner").style.display = "none";
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
