const express = require('express');
const app = express();
const os = require('os'); // Node.js module to get system information
const fs = require('fs'); // Node.js module to read files
const cors = require('cors');
require("dotenv").config();
const { exec } = require("child_process");

const PASSWORD = process.env.ADMIN_PASSWORD;

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
app.use(express.json()); // Middleware to parse JSON bodies


function getTempratures() {
    try {
        const temp = fs.readFileSync('/sys/class/thermal/thermal_zone0/temp', 'utf8');
        return parseFloat(temp) / 1000; // Convert the temperature from Kelvin to Celsius
    } catch (e) {
        return null;
    }
}

const validatePassword = (req, res, next) => {
    const { password } = req.body || {}; // Safely access req.body

    console.log("Request Body: ", req.body);
    console.log(PASSWORD);
    console.log("Password that was passed: ", password);

    if (!password || password !== PASSWORD) {
        return res.status(401).json({ message: "Unauthorized: Invalid password" });
    }

    if (password === PASSWORD){
    	console.log("It matched!")
    } else{
    	console.log("It did not match")
    }

    next();
};

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

app.post("/restart", validatePassword, (req, res) => {
	exec("sudo reboot", (error, stdout, stderr) => {
		if(error) {
			cosole.error(`Error restarting: ${error.message}`);
			return res.status(500).json({message: "Failed to restart"})
		}

		res.json({message: "System is Resatrting. . . "})
	});
});

app.post("/raspi4b/restart", validatePassword, (req, res) => {
	exec("sudo reboot", (error, stdout, stderr) => {
		if(error) {
			cosole.error(`Error restarting: ${error.message}`);
			return res.status(500).json({message: "Failed to restart"})
		}

		res.json({message: "System is Resatrting. . . "})
	});
});

app.get('/raspi4b/status', (req, res) => {
    const temperature = getTempratures();
    const memoryUsage = ((os.totalmem() - os.freemem()) / os.totalmem()) * 100;
    res.json({
        server: "Dex Pi 4B",
        temperature: temperature !== null ? `${temperature.toFixed(2)} °C` : 'N/A',
        memoryUsage: `${memoryUsage.toFixed(2)}%`,
    });
});

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
