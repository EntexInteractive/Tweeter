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
    name: "favorite",
    description: "Favorites a account to override settings",
    group: 'general',
    async execute(message, client, settings) {
        var args = message.content.split(" ");

        var term = message.content.replace(`${settings.botPrefix}favorite ${args[1]}`, "");
        message.channel.send("<:Twitter:785747426614444042> **Finding** :mag_right: `" + term + "`");

        Twitter.get('users/search', { q: term },  function (err, json, response) {
            var data = json[0];
            if(err) {
                message.channel.send(":x: **Could not find a account called** `" + term + "`");
                logger.error(err, 'cmnd');
            }
            else if(args[1] == "add") {
                console.log(data);
                db.get(`SELECT * FROM following WHERE accountID = "${data.id_str}" AND guildID = "${message.guild.id}"`, (err, row) => {
                    if(err){
                        message.channel.send(":x: **You're not following a account called** `" + term + "`");
                        logger.error(err, 'cmnd');
                    }
                    else
                    {
                        db.run(`UPDATE following SET favorite = "true" WHERE accountID = "${data.id_str}" AND guildID = "${message.guild.id}"`, (err) => {
                            if(err){
                                logger.error(err, 'cmnd');
                            }
                            else
                            {
                                message.channel.send(':white_check_mark: **Successfully added `' + data.name + '` from favorites** ');
                                logger.log(`Favorited new account '${data.screen_name}' (${message.guild.name})`, 'cmnd');
                            }
                        });
                    }
                });
            }
            else if(args[1] == "remove") {
                console.log(data);
                db.get(`SELECT * FROM following WHERE accountID = "${data.id_str}" AND guildID = "${message.guild.id}"`, (err, row) => {
                    if(err){
                        message.channel.send(":x: **You're not following a account called** `" + term + "`");
                        logger.error(err, 'cmnd');
                    }
                    else
                    {
                        db.run(`UPDATE following SET favorite = "false" WHERE accountID = "${data.id_str}" AND guildID = "${message.guild.id}"`, (err) => {
                            if(err){
                                logger.error(err, 'cmnd');
                            }
                            else
                            {
                                message.channel.send(':white_check_mark: **Successfully removed `' + data.name + '` from favorites** ');
                                logger.log(`Unfavorited new account '${data.screen_name}' (${message.guild.name})`, 'cmnd');
                            }
                        });
                    }
                });
            }
            else
            {
                message.channel.send(":x: **Error finding ** `" + term + "`");
            }
        });


    }
}