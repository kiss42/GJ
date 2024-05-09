const Fuse = require('fuse.js');

function searchGames(games, gameTitle) {
    // Ensure games is an array
    if (!Array.isArray(games)) {
        console.error('Expected an array of games, received:', games);
        return []; // Return an empty array if input is invalid
    }

    const options = {
        keys: ['name'],
        includeScore: true
    };

    const fuse = new Fuse(games, options);
    return fuse.search(gameTitle).map(result => result.item);
}

module.exports = { searchGames };
