// testFetchGames.js
const { fetchGames } = require('./src/utils/igdb');

async function test() {
  const query = 'last of us'; // Example game title to search for
  const games = await fetchGames(query);
  console.log(games);
}

test();
