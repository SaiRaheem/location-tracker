// public/script.js

const statusDiv = document.getElementById("status");

const userId = prompt("Enter your user ID:") || "unknown";

function sendLocationToServer(latitude, longitude) {
  fetch("/api/location", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ latitude, longitude, userId })
  })
  .then(res => {
    if (res.ok) {
      statusDiv.textContent = "📍 Location sent successfully!";
    } else {
      statusDiv.textContent = "❌ Failed to send location.";
    }
  })
  .catch(() => {
    statusDiv.textContent = "❌ Error sending location.";
  });
}

function showMap(latitude, longitude) {
  const map = L.map("map").setView([latitude, longitude], 13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
  L.marker([latitude, longitude])
    .addTo(map)
    .bindPopup("You are here")
    .openPopup();
}

if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      statusDiv.textContent = `Latitude: ${latitude}, Longitude: ${longitude}`;
      sendLocationToServer(latitude, longitude);
      showMap(latitude, longitude);
    },
    (error) => {
      console.error(error);
      statusDiv.textContent = "❌ Error getting location: " + error.message;
    }
  );
} else {
  statusDiv.textContent = "❌ Geolocation is not supported by your browser.";
}
