const { SlashCommandBuilder } = require('@discordjs/builders');
const { shuffleGamesByGenre, fetchGenres, getGenreId } = require('../utils/fetchGenres'); // Ensure this path matches your structure

module.exports = {
    data: new SlashCommandBuilder()
        .setName('getrandomgame')
        .setDescription('Suggests 5 random games from a specified genre.')
        .addStringOption(option =>
            option.setName('genre')
                .setDescription('The game genre')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false }); // Defer the reply
        const genreInput = interaction.options.getString('genre').toLowerCase();

        // Fetch genres and then find the ID for the input genre
        const genres = await fetchGenres();
        const genreId = getGenreId(genreInput, genres);

        if (!genreId) {
            await interaction.editReply({ content: `Couldn't find the genre: ${genreInput}`, ephemeral: true });
            return;
        }

        // Use shuffleGamesByGenre to fetch and shuffle games
        let games = await shuffleGamesByGenre(genreId);
        
        if (games.length === 0) {
            await interaction.editReply({ content: `No games found for the genre: ${genreInput}`, ephemeral: true });
            return;
        }

        // Generate response text without the rating
        const responseText = games.map((game, index) => `${index + 1}. **${game.name}**`).join('\n');
        await interaction.editReply(`Here\'s 5 Random games in the ${genreInput} genre:\n${responseText}`);
    },
};
