require('dotenv').config();
const axios = require('axios');

const client_id = process.env.TWITCH_CLIENT_ID;
const accessToken = process.env.TWITCH_ACCESS_TOKEN;

if (!client_id || !accessToken) {
    console.error('Missing required environment variables for Twitch API.');
    process.exit(1);  // Exit if the necessary environment variables are not set
}

/**
 * Fetches games from IGDB based on a search query, including dynamically
 * specifying the size of cover images to retrieve and additional fields for detailed game information.
 * @param {string} query - The search query for game titles.
 * @param {string} imageSize - Specifies the size of the cover images to fetch.
 * @returns {Promise<Array>} A promise that resolves to an array of game objects.
 */
async function fetchGames(query, imageSize = 'cover_big') {
    try {
        const response = await axios({
            url: "https://api.igdb.com/v4/games/",
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Client-ID': client_id,
                'Authorization': `Bearer ${accessToken}`,
            },
            data: `search "${query}"; fields name, summary, cover.image_id, first_release_date, platforms.name, websites.url, videos.video_id, screenshots.image_id; limit 25;`
        });

        if (!response.data || !Array.isArray(response.data)) {
            console.error('Invalid response format from IGDB:', response.data);
            return [];  // Return an empty array if the data format is unexpected
        }

        return response.data.map(game => ({
            ...game,
            cover: game.cover && game.cover.image_id 
                ? `https://images.igdb.com/igdb/image/upload/t_${imageSize}/${game.cover.image_id}.jpg` 
                : null,
            releaseYear: game.first_release_date 
                ? new Date(game.first_release_date * 1000).getFullYear() 
                : 'Unknown',
            platforms: game.platforms 
                ? game.platforms.map(platform => platform.name).join(', ') 
                : 'Unknown',
            website: game.websites && game.websites.length > 0 
                ? game.websites[0].url 
                : 'No official website',
            video: game.videos && game.videos.length > 0 
                ? `https://www.youtube.com/watch?v=${game.videos[0].video_id}`
                : 'No trailer available',
            screenshot: game.screenshots && game.screenshots.length > 0 
                ? `https://images.igdb.com/igdb/image/upload/t_screenshot_big/${game.screenshots[0].image_id}.jpg`
                : 'No screenshot available'
        }));
    } catch (error) {
        console.error(`Failed to fetch games from IGDB with query "${query}":`, error);
        return [];  // Return an empty array on error to handle gracefully in calling function
    }
}

module.exports = {
    fetchGames
};
