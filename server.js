const express = require('express');
const app = express();
const port = 4448; // You can change this port number

// Route for GET requests to /data
app.get('/data', (req, res) => {
    res.json({ message: "Hello, world!" });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://<public-ip>:${port}`);
});
