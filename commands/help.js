const Discord = require('discord.js');
const config = require('../config.json');
const fs = require('fs');

module.exports = {
    name: "help",
    description: "Gives user help with commands",
    group: 'general',
    async execute(message, client, settings) {

        let commands = client.commands.array();
        const embed = new Discord.MessageEmbed();
        embed.setColor(config.discord.embed);
        embed.setThumbnail(client.user.avatarURL())
        embed.setTitle("Commands");
        commands.forEach((c) => {
            if(c.group == 'general') {
                embed.addField('`' + settings.botPrefix + c.name + '`', c.description);
            }
        });
        message.channel.send(embed);
    }
}