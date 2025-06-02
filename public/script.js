
let map, marker;
const statusDiv = document.getElementById("status");
const userId = prompt("Enter your user ID:") || "unknown";

function initMap() {
  // Will initialize on user's location
}

function updateMap(lat, lng) {
  const latLng = { lat, lng };

  if (!map) {
    map = new google.maps.Map(document.getElementById("map"), {
      zoom: 15,
      center: latLng,
      mapTypeId: 'roadmap'
    });

    marker = new google.maps.Marker({
      position: latLng,
      map,
      title: "📍 You are here",
      animation: google.maps.Animation.DROP
    });
  } else {
    map.setCenter(latLng);
    marker.setPosition(latLng);
  }
}

function updateStatus(position) {
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

  statusDiv.style.opacity = 0;
  setTimeout(() => {
    statusDiv.innerHTML = info;
    statusDiv.style.opacity = 1;
  }, 300);

  updateMap(latitude, longitude);
  sendLocationToServer(latitude, longitude);
}

function sendLocationToServer(lat, lng) {
  fetch("/api/location", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ latitude: lat, longitude: lng, userId })
  }).catch(() => {
    statusDiv.textContent = "❌ Error sending location.";
  });
}

if ("geolocation" in navigator) {
  navigator.geolocation.watchPosition(
    updateStatus,
    (err) => {
      console.error(err);
      statusDiv.textContent = "❌ Error getting location: " + err.message;
    },
    {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 5000
    }
  );
} else {
  statusDiv.textContent = "❌ Geolocation not supported.";
}
