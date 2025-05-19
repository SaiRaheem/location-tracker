// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const DATA_FILE = path.join(__dirname, 'locations.json');

// Helper to read existing locations or return empty array
function readLocations() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Helper to write locations array to file
function saveLocations(locations) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(locations, null, 2));
}

app.post('/api/location', (req, res) => {
  console.log("📥 Incoming location data:", req.body);  
  const { latitude, longitude, userId } = req.body;

  if (!latitude || !longitude) {
    return res.status(400).send('Missing latitude or longitude');
  }

  const timestamp = new Date().toISOString();
  const newEntry = { latitude, longitude, userId: userId || 'unknown', timestamp };

  const locations = readLocations();
  locations.push(newEntry);
  saveLocations(locations);

  console.log('Saved location:', newEntry);
  res.status(200).send('Location saved');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
