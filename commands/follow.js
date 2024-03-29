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
    name: "follow",
    description: "Follows a new account for forwarding",
    group: 'general',
    async execute(message, client, settings) {

        var term = message.content.replace(`${settings.botPrefix}follow `, "");
        message.channel.send("<:Twitter:785747426614444042> **Finding** :mag_right: `" + term + "`");

        Twitter.get('users/show', { screen_name: term },  function (err, data, response) {
            if(err) {
                message.channel.send(":x: **Could not find a account called** `" + term + "`");
            }
            else {
                const embed = new Discord.MessageEmbed()
                .setColor(config.discord.embed)
                .setAuthor(data.name + ' (@' + data.screen_name + ')', data.profile_image_url, 'https://twitter.com/' + data.screen_name)
                .setDescription(data.description)
                .addField("Following", formatCommas(data.friends_count), true)
                .addField("Followers", formatCommas(data.followers_count), true)
                .setFooter('From Twitter');
                message.reply(embed);

                var guildUser = message.guild.id + data.id;
                var uniqueID = guildUser.slice(5, -5);

                db.serialize(() => {
                    db.run(`INSERT OR IGNORE INTO accounts VALUES("${data.id_str}", "${data.screen_name}")`, (err) => {
                        if(err){
                            logger.error(err, 'cmnd');
                        }
                    });

                    db.run(`INSERT INTO following VALUES("${uniqueID}", "${data.id_str}", "${data.name}", "${data.screen_name}", "${message.guild.id}", "false")`, (err) => {
                        if(err){
                            message.channel.send(':x: `' + data.screen_name + '`** is already being followed!**');
                            logger.error(err, 'cmnd');
                        }
                        else
                        {
                            message.channel.send(':white_check_mark: **Successfully started following `' + data.screen_name + '`.**  *Please allow up to a hour to start receiving tweets!*');
                            logger.log(`Followed new account '${data.screen_name}' (${message.guild.name})`, 'cmnd');
                        }
                    });
                })
            }
        });


    }
}

function formatCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}