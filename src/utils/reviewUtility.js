const { ActionRowBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

/**
 * Creates a rating selection component.
 * @returns {ActionRowBuilder} A rating selection component.
 */
function createRatingComponent() {
    const ratingOptions = [
        { label: '⭐ ', description: 'This game is straight booty meat', value: '⭐' },
        { label: '⭐⭐', description: 'Drier than grandmas putatty', value: '⭐⭐' },
        { label: '⭐⭐⭐', description: 'Good but not great', value: '⭐⭐⭐' },
        { label: '⭐⭐⭐⭐', description: 'Now this is good game', value: '⭐⭐⭐⭐' },
        { label: '⭐⭐⭐⭐⭐', description: 'GAME OF THE YEAR', value: '⭐⭐⭐⭐⭐' }
    ];

    return new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('select_rating')
                .setPlaceholder('Select your rating')
                .addOptions(ratingOptions)
        );
}

/**
 * Creates a text input component for a review.
 * @returns {ModalBuilder} A modal with a text input field for reviews.
 */
function createReviewInputModal() {
    const textInput = new TextInputBuilder()
        .setCustomId('review_input')
        .setLabel('Your Review')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Type your review here...')
        .setRequired(true);

    const modal = new ModalBuilder()
        .setCustomId('review_modal')
        .setTitle('Submit Your Review')
        .addComponents(new ActionRowBuilder().addComponents(textInput));

    return modal;
}

module.exports = {
    createRatingComponent,
    createReviewInputModal
};
