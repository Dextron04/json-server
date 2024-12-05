const express = require('express');
const app = express();
const os = require('os'); // Node.js module to get system information
const fs = require('fs'); // Node.js module to read files
const cors = require('cors');
const { exec } = require("child_process");

const allowedOrigins = [
	'https://rest.dextron04.in',
	'http://localhost:3000'
]

// Only use cors middleware for handling CORS
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
}));


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

app.post("/restart", (req, res) => {
	exec("sudo reboot", (error, stdout, stderr) => {
		if(error) {
			cosole.error(`Error restarting: ${error.message}`);
			return res.status(500).json({message: "Failed to restart"})
		}

		res.json({message: "System is Resatrting. . . "})
	});
});

app.post("/raspi4b/restart", (req, res) => {
	exec("sudo reboot", (error, stdout, stderr) => {
		if(error) {
			cosole.error(`Error restarting: ${error.message}`);
			return res.status(500).json({message: "Failed to restart"})
		}

		res.json({message: "System is Resatrting. . . "})
	});
});

app.get('/raspi4b/status', (req, res) => {
    res.json({ status: 'online', cpu_usage: '25%' });
});

const port = 8080;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
