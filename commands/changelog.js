const Discord = require('discord.js');
const fs = require('fs');
const config = require('../config.json');
const package = require('../package.json');
const logger = require('kailogs');

module.exports = {
    name: "changelog",
    description: "Sends a message talking about whats changed",
    group: 'general',
    stat: null,
    async execute(message) {
        var changelog = await readChangelog('./textfiles/changelog.txt');
        
        const embed = new Discord.MessageEmbed()
        .setColor(config.discord.embed_hex)
        .setTitle(`What's new with ${message.client.user.username} v${package.version}?`)
        .setDescription(changelog)

        message.reply(embed);
        logger.log(`Displayed changelog on guild ${message.guild.id} (${message.guild.name})`, 'command');
    }
}

async function readChangelog(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf8', function (err, data) {
            if(err){
                reject(err);
            }
            resolve(data);
        });
    });
}