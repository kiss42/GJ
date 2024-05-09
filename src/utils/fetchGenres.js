require('dotenv').config();
const axios = require('axios');

const client_id = process.env.TWITCH_CLIENT_ID;
const accessToken = process.env.TWITCH_ACCESS_TOKEN;

// Normalize genre names by converting them to lowercase and removing trailing 's'
function normalizeGenreName(name) {
    return name.toLowerCase().replace(/s$/, '');
}

// Abbreviations for genres to accommodate user inputs like 'rpg', 'fps', etc.
const genreAbbreviations = {
    rpg: 'Role-playing (RPG)',
    fps: 'shooter',
    hack: 'Hack and Slash/Beat \'em Up',
    sim: 'Simulator',
    mmo: 'massively multiplayer online',
    mmorpg: 'massively multiplayer online role playing game',
    rts: 'real time strategy',
    moba: 'multiplayer online battle arena',
    puzzle: 'puzzle',
    card: 'Card & Board Game Games',
    adv: 'adventure',
    action:'adventure',
    platformer: 'platform',
    sandbox: 'sandbox',
    fantasy: 'Role-playing (RPG)',
    horror: 'horror',
    survival: 'Strategy',
    tbs: 'Turn-based strategy (TBS)',
    trivia: 'Quiz/Trivia'
    // Ensure these match the genre names or how you'd expect users to abbreviate them
};

// Fetch and normalize genres from IGDB, including handling abbreviations
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
            data: "fields id, name; limit 50;"
        });

        const genreMap = response.data.reduce((map, genre) => {
            const normalizedGenreName = normalizeGenreName(genre.name);
            map[normalizedGenreName] = genre.id;
            return map;
        }, {});

        // Map abbreviations to their respective IDs
        Object.keys(genreAbbreviations).forEach(abbr => {
            const normalizedAbbr = normalizeGenreName(genreAbbreviations[abbr]);
            if (genreMap[normalizedAbbr]) {
                genreMap[normalizeGenreName(abbr)] = genreMap[normalizedAbbr];
            }
        });

        return genreMap;
    } catch (error) {
        console.error('Failed to fetch genres from IGDB:', error);
        return {};
    }
}

// Find the genre ID based on user input, accommodating direct matches and abbreviations
function getGenreId(userInput, genres) {
    const normalizedInput = normalizeGenreName(userInput);
    return genres[normalizedInput] || null;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
}

async function fetchGamesByGenre(genreId) {
    try {
        const response = await axios({
            url: "https://api.igdb.com/v4/games/",
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Client-ID': client_id,
                'Authorization': `Bearer ${accessToken}`,
            },
            data: `fields name, summary, cover.url, rating; where genres = (${genreId}); sort rating desc; limit 5;`
        });
        return response.data.map(game => ({
            name: game.name,
            summary: game.summary,
            rating: game.rating || 'N/A',
            cover: game.cover ? `https://images.igdb.com/igdb/image/upload/t_${imageSize}/${game.cover.image_id}.jpg` : undefined
        }));
    } catch (error) {
        console.error(`Failed to fetch games from IGDB by genre ${genreId}:`, error);
        return [];
    }
}

async function shuffleGamesByGenre(genreId) {
    try {
        const response = await axios({
            url: "https://api.igdb.com/v4/games/",
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Client-ID': client_id,
                'Authorization': `Bearer ${accessToken}`,
            },
            // Adjust the data query as needed. Here's an example without sorting by rating.
            data: `fields name, summary, cover.url; where genres = (${genreId}); limit 50;` // Increase limit if needed and possible
        });

        let games = response.data;
        shuffleArray(games); // Shuffle the array to get random elements

        // Select the first 5 elements after shuffling
        games = games.slice(0, 5).map(game => ({
            name: game.name,
            summary: game.summary,
            cover: game.cover ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg` : undefined
        }));

        return games;
    } catch (error) {
        console.error(`Failed to fetch games from IGDB by genre ${genreId}:`, error);
        return [];
    }
}

module.exports = {
    fetchGenres,
    fetchGamesByGenre,
    shuffleGamesByGenre,
    getGenreId,
}