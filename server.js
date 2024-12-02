const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());


app.get('/raspi4b', (req, res) => {
    res.json({ message: 'you found me' });
});

app.get('/raspi4b/status', (req, res) => {
    res.json({ status: 'online', cpu_usage: '25%' });
});

const port = 4440;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
