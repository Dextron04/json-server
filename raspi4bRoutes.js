module.exports = (app, validatePassword, getTempratures, os) => {
    app.post("/restart-server", validatePassword, (req, res) => {
        console.log("Restart request received");
        res.status(200).json({ message: "System is Restarting..." });
        const { exec } = require("child_process");
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

    app.post("/restart", validatePassword, (req, res) => {
        const { exec } = require("child_process");
        exec("sudo reboot", (error, stdout, stderr) => {
            if (error) {
                console.error(`Error restarting: ${error.message}`);
                return res.status(500).json({ message: "Failed to restart" })
            }
            res.json({ message: "System is Resatrting. . . " })
        });
    });

    app.get('/status', (req, res) => {
        const temperature = getTempratures();
        const memoryUsage = ((os.totalmem() - os.freemem()) / os.totalmem()) * 100;
        res.json({
            server: "Dex Pi 4B",
            temperature: temperature !== null ? `${temperature.toFixed(2)} °C` : 'N/A',
            memoryUsage: `${memoryUsage.toFixed(2)}%`,
        });
    });
}; 