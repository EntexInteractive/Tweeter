const Discord = require('discord.js');
const config = require('../config.json');
const logger = require('kailogs');

const sqlite = require('sqlite3').verbose();
let db = new sqlite.Database('./Tweeter.db');

module.exports = {
    name: "list",
    description: "Lists the currently followed accounts",
    group: 'general',
    async execute(message, client, settings) {
        db.all(`SELECT * FROM following WHERE guildID = "${message.guild.id}" ORDER BY accountName ASC`, (err, rows) => {

            const embed = new Discord.MessageEmbed();
            embed.setColor(config.discord.embed);
            embed.setAuthor(message.guild.name, message.guild.iconURL())
            embed.setTitle("Currently Following");
            rows.forEach((row) => {
                console.log(row);
                if(row.favorite == "true") {
                    embed.addField(row.accountName + ' :star:', "@" + row.accountTag);
                }
                else if(row.favorite == "false") {
                    embed.addField(row.accountName, "@" + row.accountTag);
                }
            });
            message.channel.send(embed);
        });
    }
}