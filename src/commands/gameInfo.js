const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder } = require('discord.js');
const { fetchGames } = require('../utils/igdb');
const { createGameSelectMenu } = require('../utils/selectMenuHandler');

// Utility function to check if a string is a valid URL
function isValidHttpUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
        return false;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gameinfo')
        .setDescription('Discover details about a game')
        .addStringOption(option => option.setName('title').setDescription('The title of the game you are interested in').setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false });
        // Accept either "title" (current) or "query" (older registered slash command) for compatibility
        const gameTitleRaw = interaction.options.getString('title') || interaction.options.getString('query');
        const gameTitle = gameTitleRaw ? gameTitleRaw.trim() : '';

        console.log('[gameinfo] options received:', interaction.options.data);

        if (!gameTitle) {
            await interaction.editReply({ content: 'Please provide a game title to search for.' });
            return;
        }
        
        try {
            const games = await fetchGames(gameTitle);
            if (games.length === 0) {
                await interaction.editReply({ content: 'No games found with the specified title.' });
                return;
            }

            const gameSelectMenu = createGameSelectMenu(games);
            await interaction.editReply({ content: 'Here\'s the 411:', components: [gameSelectMenu] });

            const collector = interaction.channel.createMessageComponentCollector({
                filter: i => i.customId === 'selectGame' && i.user.id === interaction.user.id,
                time: 25000
            });

            collector.on('collect', async i => {
                const selectedGame = games.find(game => game.id.toString() === i.values[0]);
                if (!selectedGame) {
                    await i.update({ content: 'The selected game could not be retrieved.', components: [] });
                    return;
                }

                const platformsText = `Platforms: ${selectedGame.platforms || 'Unknown'}`;
                const embed = new EmbedBuilder()
                    .setTitle(selectedGame.name)
                    .setDescription(`${selectedGame.summary || 'No description available.'}\n\n${platformsText}`);
                
                if (isValidHttpUrl(selectedGame.cover)) {
                    embed.setImage(selectedGame.cover);
                }

                await i.update({ embeds: [embed], components: [] });
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    interaction.followUp({ content: 'No game was selected within the time limit.', ephemeral: false });
                }
            });
        } catch (error) {
            console.error('An error occurred while fetching games:', error);
            await interaction.editReply({ content: 'An error occurred while processing your request.' });
        }
    },
};
