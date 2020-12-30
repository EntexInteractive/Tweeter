const Discord = require('discord.js');
const config = require('../config.json');
const logger = require('kailogs');

module.exports = {
    name: "invite",
    description: "Sends the invite link",
    group: 'general',
    stat: null,
    async execute(message, client, settings) {

        const embed = new Discord.MessageEmbed()
        .setColor(config.discord.embed_hex)
        .setAuthor('Invite Me!', client.user.avatarURL(), 'https://discord.com/api/oauth2/authorize?client_id=402008803178053642&permissions=2147479287&scope=bot')
        .setDescription("I'd be happy to join your server! Click the `Invite Me!` link at the top to add me. Then type `/help` to learn what I can do. " +
            "When you add me to a server, type a command so I can configure myself for your server.")
        .setFooter('Made with Kai Technology')
        message.channel.send(embed);
        logger.log(`Invited by ${message.author.name} on guild ${message.guild.id} (${message.guild.name})`, 'command');
    }
}