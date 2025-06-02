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
      // Optional: you can update status or just keep silent here
      // statusDiv.textContent = "📍 Location sent successfully!";
    } else {
      statusDiv.textContent = "❌ Failed to send location.";
    }
  })
  .catch(() => {
    statusDiv.textContent = "❌ Error sending location.";
  });
}

function createPulseIcon() {
  const div = document.createElement('div');
  div.className = 'pulse-marker';
  return L.divIcon({
    className: '', // Remove default leaflet styles for icon container
    html: div.outerHTML,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -18],
  });
}

function showMap(latitude, longitude) {
  if (!window.map) {
    window.map = L.map("map").setView([latitude, longitude], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(window.map);

    window.marker = L.marker([latitude, longitude], { icon: createPulseIcon() })
      .addTo(window.map)
      .bindPopup("📍 You are here")
      .openPopup();
  } else {
    window.map.setView([latitude, longitude], 13);
    window.marker.setLatLng([latitude, longitude]);
  }
}

if ("geolocation" in navigator) {
  navigator.geolocation.watchPosition(
    (position) => {
      const {
        latitude,
        longitude,
        altitude,
        speed,
        heading,
        accuracy
      } = position.coords;

      const timestamp = new Date(position.timestamp).toLocaleString();

      const speedKmh = speed != null ? (speed * 3.6).toFixed(2) : "Not available";

      const info = `
        📍 Latitude: ${latitude.toFixed(6)}<br>
        📍 Longitude: ${longitude.toFixed(6)}<br>
        🎯 Accuracy: ${accuracy} meters<br>
        ⬆️ Altitude: ${altitude != null ? altitude + " m" : "Not available"}<br>
        ⚡ Speed: ${speedKmh} km/h<br>
        🧭 Heading: ${heading != null ? heading + "°" : "Not available"}<br>
        ⏱️ Time: ${timestamp}
      `;

      // Animate the status update fade out/in
      statusDiv.style.opacity = 0;
      setTimeout(() => {
        statusDiv.innerHTML = info;
        statusDiv.style.opacity = 1;
      }, 300);

      sendLocationToServer(latitude, longitude);

      showMap(latitude, longitude);
    },
    (error) => {
      console.error(error);
      statusDiv.textContent = "❌ Error getting location: " + error.message;
    },
    {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 5000
    }
  );
} else {
  statusDiv.textContent = "❌ Geolocation is not supported by your browser.";
}
