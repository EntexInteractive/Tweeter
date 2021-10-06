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
        .setColor(config.discord.embed)
        .setAuthor('Invite Me!', client.user.avatarURL(), 'https://discord.com/api/oauth2/authorize?client_id=754801403452719195&permissions=27664&scope=bot')
        .setDescription("Click the `Invite Me!` link at the top to add me. Then type `!settings setchannel` to set the channel to receive tweets.")
        .setFooter('Made with Kai Technology')
        message.channel.send(embed);
        logger.log(`Invited by '${message.author.name}' on guild '${message.guild.id}' (${message.guild.name})`, 'cmnd');
    }
}