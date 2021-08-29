const ms = require('ms');

module.exports = {

    description: 'End a giveaway',

    options: [
        {
            name: 'giveaway',
            description: 'The giveaway to end (message ID or giveaway prize)',
            type: 'STRING',
            required: true
        }
    ],

    run: async (client, interaction) => {

        // If the member doesn't have enough permissions
        if(!interaction.member.permissions.has('MANAGE_MESSAGES') && !interaction.member.roles.cache.some((r) => r.name === "Giveaways")){
            return interaction.reply({
                content: ':x: You need to have the manage messages permissions to reroll giveaways.',
                ephemeral: true
            });
        }

        const query = interaction.options.getString('giveaway');

        // try to found the giveaway with prize then with ID
        const giveaway = 
            // Search with giveaway prize
            client.giveawaysManager.giveaways.find((g) => g.prize === query && g.guildId === interaction.guild.id) ||
            // Search with giveaway ID
            client.giveawaysManager.giveaways.find((g) => g.messageID === query && g.guildId === interaction.guild.id);

        // If no giveaway was found
        if (!giveaway) {
            return interaction.reply({
                content: 'Unable to find a giveaway for `'+ args.join(' ') + '`.',
                ephemeral: true
            });
        }

        // Edit the giveaway
        client.giveawaysManager.edit(giveaway.messageID, {
            setEndTimestamp: Date.now()
        })
        // Success message
        .then(() => {
            // Success message
            interaction.reply('Giveaway will end in less than '+(client.giveawaysManager.options.updateCountdownEvery/1000)+' seconds...');
        })
        .catch((e) => {
            if(e.startsWith(`Giveaway with message ID ${giveaway.messageID} is already ended.`)){
                interaction.reply({
                    content: 'This giveaway is already ended!',
                    ephemeral: true
                });
            } else {
                console.error(e);
                interaction.reply({
                    content: 'An error occured...',
                    ephemeral: true
                });
            }
        });

    }
};
