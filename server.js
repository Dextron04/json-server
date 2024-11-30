const express = require('express');
const cors = require('cors');  // Import the CORS middleware
const fs = require('fs');
const https = require('https');  // Import the https module

const app = express();
const port = 4448; // Use a different port if 443 is occupied

// Enable CORS for specific origin (your frontend URL)
app.use(cors({
    origin: 'http://localhost:3000',  // Replace with your frontend URL if different
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Allow methods you need
    allowedHeaders: '*',  // Allow all headers (you can restrict if necessary)
}));

// Route for GET requests to /status
app.get('/status', (req, res) => {
    res.json({ message: "Hello, world!" });
});

// SSL certificate files
const options = {
    key: fs.readFileSync('private.key'),   // Path to your private key
    cert: fs.readFileSync('server.crt')   // Path to your certificate
};

// Start the server using HTTPS
https.createServer(options, app).listen(port, () => {
    console.log(`Server running at https://<public-ip>:${port}`);
});
