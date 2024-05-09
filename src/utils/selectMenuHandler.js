const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

// Utility function to create a game selection menu
function createGameSelectMenu(games) {
    const options = games.map(game => ({
        label: game.name.length > 100 ? `${game.name.substring(0, 97)}...` : game.name,
        description: game.summary && game.summary.length > 100 ? `${game.summary.substring(0, 97)}...` : game.summary || 'No description available',
        value: game.id.toString(),
    }));

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('selectGame')
        .setPlaceholder('Choose a game')
        .addOptions(options);

    return new ActionRowBuilder().addComponents(selectMenu);
}

module.exports = { createGameSelectMenu };
