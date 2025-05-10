module.exports = (app, validatePassword, getTempratures, os) => {
    app.post("/restart-server", validatePassword, (req, res) => {
        // TODO: Implement actual restart logic for raspi2
        res.status(200).json({ message: "[Placeholder] Raspi2 server restart endpoint hit." });
    });

    app.post("/restart", validatePassword, (req, res) => {
        // TODO: Implement actual reboot logic for raspi2
        res.status(200).json({ message: "[Placeholder] Raspi2 reboot endpoint hit." });
    });

    app.get('/status', (req, res) => {
        const temperature = getTempratures();
        const memoryUsage = ((os.totalmem() - os.freemem()) / os.totalmem()) * 100;
        res.json({
            server: "Dex Pi 2",
            temperature: temperature !== null ? `${temperature.toFixed(2)} °C` : 'N/A',
            memoryUsage: `${memoryUsage.toFixed(2)}%`,
        });
    });
}; 