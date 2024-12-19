const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());

app.get('/proxy', async (req, res) => {
    const url = req.query.url;
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Fetch error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error in proxy:', error); // This will be shown in Vercel logs
        res.status(500).json({ error: 'Error fetching data', details: error.message });
    }
});

module.exports = app;
