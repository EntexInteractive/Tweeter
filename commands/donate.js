const Discord = require('discord.js');
const config = require('../config.json');
const logger = require('kailogs');

module.exports = {
    name: "donate",
    description: "Donate to Tweeter!",
    group: 'general',
    async execute(message, client, settings) {
        const embed = new Discord.MessageEmbed()
        .setColor(config.discord.embed)
        .setAuthor('Donation Info', client.user.avatarURL(), "https://www.patreon.com/kaitech")
        .setDescription("Tweeter is just one of many projects we're working on. If you love Tweeter please consider donating to help support the development of this" + 
        " bot and many more to come! Donating also helps invest in better hardware to run this bot.")
        message.channel.send(embed);
    }
}