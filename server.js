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
];

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

app.get('/test', (req, res) => {
    res.json({
        message: "The test was successful! :)"
    });
});

// Restarting the server dashboard
app.post("/restart-server-dashboard", (req, res) => {
	exec("pm2 restart server-dashboard", (error, stdout, stderr) => {
		if(error) {
			cosole.error(`Error restarting: ${error.message}`);
			return res.status(500).json({message: "Failed to restart"})
		}

		res.json({message: "System is Resatrting. . . "})
	});
});

// Restarting the json-server
app.post("/restart-server", validatePassword, (req, res) => {
    console.log("Restart request received");
    res.status(200).json({ message: "System is Restarting..." });
    exec("pm2 restart server", (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return res.status(500).json({ message: `Error: ${error.message}` });
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
            return res.status(500).json({ message: `Stderr: ${stderr}` });
        }

        console.log(`Stdout: ${stdout}`);
        res.status(200).json({ message: "System is Restarting..." });
    });
});

app.post("/restart-launchpad", validatePassword, (req, res) => {
    console.log("Restart request received");
    res.status(200).json({ message: "System is Restarting..." });
    exec("sudo systemctl restart launchpad-wifi", (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return res.status(500).json({ message: `Error: ${error.message}` });
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
            return res.status(500).json({ message: `Stderr: ${stderr}` });
        }

        console.log(`Stdout: ${stdout}`);
        res.status(200).json({ message: "Restarting Launch Pad" });
    });
});

app.post("/full-system-shutdown", validatePassword, (req, res) => {
	console.log("Full System Shutdown Initiated");
	res.status(200).json({message: "System Shutting down..."});
	exec("sudo shutdown now", (error, stdout, stderr) => {
		if(error){
			console.error(`Error: ${error.message}`);
			return res.status(500).json({message: `Error: ${error.message}`});
		}
		if(stderr){
			return res.status(500).json({message: `Stderr: ${stderr}`});
		}
	});
});

// Restarting the json-server (4B)
app.post("/raspi4b/restart-server", validatePassword, (req, res) => {
    console.log("Restart request received");
    res.status(200).json({ message: "System is Restarting..." });
    exec("pm2 restart server", (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return res.status(500).json({ message: `Error: ${error.message}` });
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
            return res.status(500).json({ message: `Stderr: ${stderr}` });
        }

        console.log(`Stdout: ${stdout}`);
        res.status(200).json({ message: "System is Restarting..." });
    });
});

// Restarting the main server
app.post("/restart", validatePassword, (req, res) => {
	exec("sudo reboot", (error, stdout, stderr) => {
		if(error) {
			cosole.error(`Error restarting: ${error.message}`);
			return res.status(500).json({message: "Failed to restart"})
		}

		res.json({message: "System is Resatrting. . . "})
	});
});

// Restarting the 4B Server
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

// GitHub Webhook endpoint
app.post('/github-webhook', (req, res) => {
    const event = req.headers['x-github-event'];

    if (event === 'push') {
        console.log('Push event received!');

        // Run git pull and restart service commands
        exec('git -C /home/dex/server-dashboard pull origin main && pm2 restart server-dashboard', (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing command: ${error.message}`);
                return res.status(500).send('Failed to update and restart');
            }
            console.log(`Command Output: ${stdout}`);
            console.error(`Command Error Output: ${stderr}`);
            res.status(200).send('Updated and restarted successfully');
        });
    } else {
        console.log(`Unhandled event type: ${event}`);
        res.status(400).send('Unhandled event');
    }
});

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
