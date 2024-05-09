const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const { fetchGames } = require('../utils/igdb');
const { searchGames } = require('../utils/search');
const { createRatingComponent, createReviewInputModal } = require('../utils/reviewUtility');

// Embed creation function
function createGameDetailEmbed(game, reviewContent, rating) {
    const embed = new EmbedBuilder()
        .setTitle(game.name)
        .setDescription(`**Review:**\n${reviewContent}\n\n**Rating:** ${rating}`)
        .setImage(game.screenshot || game.cover || 'placeholder_image_url')
        .setURL(game.website || 'https://www.igdb.com')
        .addFields(
            { name: 'Release Year', value: game.releaseYear.toString(), inline: true },
            { name: 'Platforms', value: game.platforms, inline: true },
            { name: 'Watch Trailer', value: game.video ? `[Click Here](${game.video})` : 'Not Available', inline: false }
        )
        .setColor(0x0099FF);

    return embed;
}

// Function to create game select menu
function createGameSelectMenu(games) {
    const gameOptions = games.map(game => ({
        label: game.name.length > 100 ? `${game.name.substring(0, 97)}...` : game.name,
        description: game.description && game.description.length > 100 ? `${game.description.substring(0, 97)}...` : game.description || 'No description available',
        value: game.id.toString()
    }));

    const selectMenu = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('select_game')
                .setPlaceholder('Select a game to review')
                .addOptions(gameOptions)
        );

    return selectMenu;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gamereviews')
        .setDescription('Search for a game and write a review')
        .addStringOption(option => option.setName('title').setDescription('Enter the title of the game to review').setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const gameTitle = interaction.options.getString('title');
        let games = await fetchGames(gameTitle);

        games = searchGames(games, gameTitle);

        if (games.length === 0) {
            await interaction.editReply({ content: 'No games found with that title.', ephemeral: true });
            return;
        }

        const selectMenu = createGameSelectMenu(games);
        await interaction.editReply({ content: 'Choose a game to review:', components: [selectMenu], ephemeral: true });

        const filter = i => i.customId === 'select_game' && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 30000 });

        collector.on('collect', async i => {
            const selectedGameId = i.values[0];
            const selectedGame = games.find(game => game.id.toString() === selectedGameId);

            if (!selectedGame) {
                await i.reply({ content: 'Game not found.', ephemeral: false });
                return;
            }

            const reviewModal = createReviewInputModal();
            await i.showModal(reviewModal);

            const modalSubmitFilter = sub => sub.customId === 'review_modal' && sub.user.id === i.user.id;
            const submittedReview = await interaction.awaitModalSubmit({ filter: modalSubmitFilter, time: 60000 });

            const reviewContent = submittedReview.fields.getTextInputValue('review_input').trim();
            if (!reviewContent) {
                await submittedReview.reply({ content: 'No valid review submitted.', ephemeral: true });
                return;
            }

            const ratingMenu = createRatingComponent();
            await submittedReview.reply({
                content: `Heres the 411:`,
                components: [ratingMenu],
                ephemeral: false
            });

            const ratingFilter = j => j.customId === 'select_rating' && j.user.id === i.user.id;
            const ratingCollector = interaction.channel.createMessageComponentCollector({ filter: ratingFilter, time: 30000 });

            ratingCollector.on('collect', async j => {
                const selectedRating = j.values[0];
                const gameDetailEmbed = createGameDetailEmbed(selectedGame, reviewContent, selectedRating);

                await j.update({ embeds: [gameDetailEmbed], components: [], ephemeral: false });
            });
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.followUp({ content: 'No game selected within the time limit.', ephemeral: true });
            }
        });
    }
};
