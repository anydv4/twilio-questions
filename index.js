const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();

// Enable CORS
app.use(cors());

app.get('/proxy', async (req, res) => {
    const url = req.query.url;

    // Validate the input URL
    if (!url) {
        console.error('Error: URL query parameter is required');
        return res.status(400).json({ error: 'URL query parameter is required' });
    }
    if (!url.startsWith('https://')) {
        console.error('Error: Invalid URL format. Only HTTPS URLs are allowed');
        return res.status(400).json({ error: 'Invalid URL format. Only HTTPS URLs are allowed' });
    }

    try {
        // Debugging logs
        console.log('Fetching data from:', url);

        // Fetch data from the provided URL with a 5-second timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000); // 5 seconds timeout

        const response = await fetch(url, { signal: controller.signal });

        // Clear timeout after fetch
        clearTimeout(timeout);

        if (!response.ok) {
            console.error(`Error: Fetch failed with status ${response.status} ${response.statusText}`);
            return res.status(response.status).json({
                error: `Failed to fetch data. Status: ${response.status} ${response.statusText}`,
            });
        }

        const data = await response.json();

        // Log the response for debugging
        console.log('Data fetched successfully:', JSON.stringify(data, null, 2));

        // Send response back to the client
        res.json(data);
    } catch (error) {
        clearTimeout(timeout);

        if (error.name === 'AbortError') {
            console.error('Error: Request timed out');
            return res.status(408).json({ error: 'Request timed out' });
        }

        console.error('Error in proxy:', {
            message: error.message,
            stack: error.stack,
        });

        res.status(500).json({
            error: 'Error fetching data',
            details: error.message,
        });
    }
});

// Default export for serverless deployment (Vercel)
module.exports = app;

// Uncomment below if running locally with Node.js
// const PORT = 3000;
// app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
