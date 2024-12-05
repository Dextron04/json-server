const express = require('express');
const app = express();
const os = require('os'); // Node.js module to get system information
const fs = require('fs'); // Node.js module to read files



function getTempratures() {
    try {
        const temp = fs.readFileSync('/sys/class/thermal/thermal_zone0/temp', 'utf8');
        return parseFloat(temp) / 1000; // Convert the temperature from Kelvin to Celsius
    } catch (e) {
        return null;
    }
}

// Route for GET requests to /status
app.get('/status', (req, res) => {
    const temperature = getTempratures();
    const memoryUsage = ((os.totalmem() - os.freemem()) / os.totalmem()) * 100;
    res.json({
        server: "Dex Pi",
        temperature: temperature !== null ? `${temperature.toFixed(2)} °C` : 'N/A',
        memoryUsage: `${memoryUsage.toFixed(2)}%`,
    });
});

app.get('/raspi4b/status', (req, res) => {
    res.json({ status: 'online', cpu_usage: '25%' });
});

const port = 8080;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
