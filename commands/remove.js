const Discord = require('discord.js');
const config = require('../config.json');
const logger = require('kailogs');
const Twit = require('twit');
const sqlite = require('sqlite3').verbose();
let db = new sqlite.Database('./Tweeter.db');

var Twitter = new Twit({
    consumer_key: config.twitter.consumer_key,
    consumer_secret: config.twitter.consumer_secret,
    access_token: config.twitter.access_token,
    access_token_secret: config.twitter.access_token_secret
});

module.exports = {
    name: "remove",
    description: "Removes a account from forwarding",
    group: 'general',
    async execute(message, client, settings) {

        var term = message.content.replace(`${settings.botPrefix}remove `, "");
        //message.channel.send("<:Twitter:785747426614444042> **Searching** :mag_right: `" + term + "`");

        Twitter.get('users/show', { screen_name: term },  function (err, data, response) {
            if(err) {
                message.channel.send(":x: **Could not find a account called** `" + term + "`");
            }
            else {
                // const embed = new Discord.MessageEmbed()
                // .setColor(config.discord.embed)
                // .setAuthor(data.name + ' (@' + data.screen_name + ')', data.profile_image_url, 'https://twitter.com/' + data.screen_name)
                // .setDescription(data.description)
                // .addField("Following", data.friends_count, true)
                // .addField("Followers", data.followers_count, true)
                // .setFooter('From Twitter');
                // message.reply(embed);

                db.serialize(() => {
                    db.run(`DELETE FROM following WHERE accountID = "${data.id}" AND guildID = "${message.guild.id}"`, (err) => {
                        if(err){
                            message.channel.send(':x: **Failed to remove account!**');
                            logger.error(err, 'cmnd');
                        }
                        else
                        {
                            message.channel.send(':white_check_mark: **Successfully removed** `' + data.screen_name + '`');
                            logger.log(`Removed account '${data.screen_name}' (${message.guild.name})`, 'cmnd');
                        }
                    });
                })
            }
        });


    }
}