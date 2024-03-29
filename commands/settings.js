const Discord = require('discord.js');
const config = require('../config.json');
const logger = require('kailogs');
const sqlite = require('sqlite3').verbose();
let db = new sqlite.Database('./Tweeter.db');

module.exports = {
    name: "settings",
    description: "Changes the bot settings",
    group: 'general',
    async execute(message, client, settings) {
        if (message.member.hasPermission("MANAGE_GUILD") || message.member.id == config.discord.devID)
        {
            var args = message.content.split(' ');
            var setting = args[1].toLowerCase();

            if(setting == "view")
            {
                db.get(`SELECT * FROM profiles WHERE guildID = ?`, [message.guild.id], (err, row) => {
                    if(err){
                        logger.error(err, 'main');
                        if(settings.debugMode == "true") {
                            message.channel.send("Debug: " + err);
                        }
                    };

                    const commandEmbed = new Discord.MessageEmbed()
                    .setColor(config.discord.embed)
                    .setAuthor("Settings", message.guild.iconURL())
                    .addField("botPrefix", "`" + row.botPrefix + "`")
                    .addField("showReplies", "`" + row.showReplies + "`")
                    .addField("showRetweets", "`" + row.showRetweets + "`")
                    .addField("tweetChannel", "`" + row.channelID + "`")                 
                    message.channel.send(commandEmbed);
                });
            }
            else if(setting == "setchannel")
            {
                db.run(`UPDATE profiles SET channelID = ${message.channel.id} WHERE guildID = ${message.guild.id}`, (err) => {
                    if(err)
                    {
                        logger.error(err, 'main');
                        message.channel.send(":x: **Failed to set channel!**");
                    }
                    else
                    {
                        message.channel.send(":white_check_mark: **Successfully set channel as tweetChannel**");
                    }
                });
            }
            else
            {
                var newSetting = args[2].toLowerCase();
                db.run(`UPDATE profiles SET ${setting} = "${newSetting}" WHERE guildID = "${message.guild.id}"`, function(err) {
                    if(err) {
                        message.channel.send(":x: `"+ setting +"`** is not a vaild setting!**");
                        logger.error(err, 'cmnd');
                    }
                    else
                    {
                        message.channel.send(':white_check_mark: **Successfully changed `' + setting + '` to `' + newSetting + '`**');
                    }
                });
            }
        }
    }
}