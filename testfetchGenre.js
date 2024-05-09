require('dotenv').config();
const axios = require('axios');

const client_id = process.env.TWITCH_CLIENT_ID;
const accessToken = process.env.TWITCH_ACCESS_TOKEN;

async function fetchGenres() {
    try {
        const response = await axios({
            url: "https://api.igdb.com/v4/genres/",
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Client-ID': client_id,
                'Authorization': `Bearer ${accessToken}`,
            },
            data: "fields id, name; limit 60;"
        });

        // Print the fetched genres
        console.log(response.data);
    } catch (error) {
        console.error('Failed to fetch genres from IGDB:', error);
    }
}

// Execute the fetchGenres function
fetchGenres();

