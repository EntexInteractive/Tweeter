const Discord = require('discord.js');
const config = require('../config.json');
const logger = require('kailogs');
const sqlite = require('sqlite3').verbose();
let db = new sqlite.Database('./Tweeter.db');

module.exports = {
    name: "test",
    description: "Sends message to the tweet channel",
    group: 'general',
    async execute(message, client, settings) {
        db.get(`SELECT channelID FROM profiles WHERE guildID = "${message.guild.id}"`, (err, row) => {
            console.log(`SELECT * FROM profiles WHERE guildID = ${message.guild.id}`);
            console.log(row);
            client.channels.cache.get(row.channelID).send("<:Twitter:785747426614444042> **Tweets will show up here!**");
        });
    }
}