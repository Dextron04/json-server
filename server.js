const express = require('express');
const cors = require('cors');  // Import the CORS middleware
const app = express();
const port = 4442; // You can change this port number

// Enable CORS for specific origin (your frontend URL)
app.use(cors({
    origin: [
        'https://localhost:3000',
        'https://rest.dextron04.in',  // Add your production domain
        'http://localhost:3000'       // Optional: for local development
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Allow methods you need
    allowedHeaders: '*',  // Allow all headers (you can restrict if necessary)
}));

// Route for GET requests to /status
app.get('/status', (req, res) => {
    res.json({ message: "Hello, world!" });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://<public-ip>:${port}`);
});