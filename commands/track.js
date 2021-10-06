const Discord = require('discord.js');
const config = require('../config.json');
const logger = require('kailogs');
const sqlite = require('sqlite3').verbose();
let db = new sqlite.Database('./Tweeter.db');

module.exports = {
    name: "track",
    description: "Tracks a certain keyword for news/updates",
    group: 'general',
    async execute(message, client, settings) {

        var term = message.content.replace(`${settings.botPrefix}track `, "");
        message.channel.send("<:Twitter:785747426614444042> **Tracking** :mag_right: `" + term + "`");

        db.run(`INSERT OR REPLACE INTO tracking VALUES("${message.guild.id}", "${term}")`, (err) => {
            if(err){
                message.channel.send(':x: ```' + err + '```');
                logger.error(err, 'cmnd');
            }
            else
            {
                message.channel.send(':white_check_mark: **Successfully started tracking `' + term + '`.**  *Please allow up to a hour to start receiving tweets!*');
                logger.log(`Started tracking '${term}' (${message.guild.id})`, 'cmnd');
            }
        });
    }
}