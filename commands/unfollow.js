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
    name: "unfollow",
    description: "Removes a account from forwarding",
    group: 'general',
    async execute(message, client, settings) {

        var term = message.content.replace(`${settings.botPrefix}unfollow `, "");
        //message.channel.send("<:Twitter:785747426614444042> **Searching** :mag_right: `" + term + "`");

        Twitter.get('users/show', { screen_name: term },  function (err, data, response) {
            if(err) {
                message.channel.send(":x: **Could not find a account called** `" + term + "`");
            }
            else {
                db.serialize(() => {
                    db.run(`DELETE FROM following WHERE accountID = "${data.id_str}" AND guildID = "${message.guild.id}"`, (err) => {
                        if(err){
                            message.channel.send(':x: **Failed to remove account!**');
                            logger.error(err, 'cmnd');
                        }
                        else
                        {
                            message.channel.send(':white_check_mark: **Successfully unfollowed** `' + data.screen_name + '`');
                            logger.log(`Removed account '${data.screen_name}' from guild '${message.guild.name}'`, 'cmnd');
                        }
                    });

                    db.all(`SELECT * FROM following WHERE accountID = ${data.id_str}`, (err, row) => {
                        if(err) {
                            console.log(err);
                        }
                        if(row.length <= 0) {
                            db.run(`DELETE FROM accounts WHERE ID = "${data.id_str}"`, (err) => {
                                if(err){
                                    logger.error(err, 'cmnd');
                                }
                                else
                                {
                                    logger.log(`Removed account '${data.screen_name}' from database`, 'cmnd');
                                }
                            });
                        }
                    });
                })
            }
        });


    }
}