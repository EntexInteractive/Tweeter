const Discord = require('discord.js');
const Client = require('./client/client');
const fs = require('fs');
const Twit = require('twit');
const config = require('./config.json');
const package = require('./package.json');
const clock = require('date-events')();
const logger = require('kailogs');

const client = new Client();
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

const sqlite = require('sqlite3').verbose();
let db = new sqlite.Database('./Tweeter.db');

for(const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

logger.loadLog('./logs');
logger.log(`${package.name} v${package.version}`, 'main');
client.login(config.discord.token);

var EventEmitter = require('events');
const { resolve } = require('path');
const { rejects } = require('assert');
var Tweeter = new EventEmitter();
var Twitter = new Twit({
    consumer_key: config.twitter.consumer_key,
    consumer_secret: config.twitter.consumer_secret,
    access_token: config.twitter.access_token,
    access_token_secret: config.twitter.access_token_secret
});

client.once('ready', () => {
    logger.log('Connected to Discord API', 'main');
    client.user.setStatus('dnd');
    //client.user.setPresence({ activity: { name: 'Disconnected' }, status: 'dnd' });
    Tweeter.emit('start');
});

client.once('disconnect', () => {
    logger.warn('Disconnected from Discord API', 'main');
});

client.on('message', message => {
    if(message.author.bot) return;

    db.get(`SELECT * FROM profiles WHERE guildID = ?`, [message.guild.id], (err, row) => {
        if(err){
            logger.error(err, 'main');
        };

        if(!message.content.startsWith(row.botPrefix)) return;

        if (message.member.id == config.discord.devID)
        {
            if(message.content.startsWith(`${row.botPrefix}disconnect`)) {
                Tweeter.emit('stop');
            }
        
            if(message.content.startsWith(`${row.botPrefix}connect`)) {
                Tweeter.emit('start');
            }
        }
        
        try {
            const args = message.content.slice(row.botPrefix.length).split(/ +/);
            const commandName = args.shift().toLowerCase();
            const command = client.commands.get(commandName);
            command.execute(message, client, row); 
            logger.log(`Ran command: '${command.name}' from '${message.author.username}' (${message.guild.name})`, 'main');
            
        } catch(err) {
            logger.warn(`Unknown command: '${message.content}' from '${message.author.username}' (${message.guild.name})`, 'main');
            logger.error(err, 'main');
        }
    
        if(row.guildID == null) 
        {
            logger.warn(`GuildID: '${message.guild.id}' (${message.guild.name}) came back null!`, 'main');
        }
    });
});

// Twitter
Tweeter.on('start', function (save) {
    getUsers().then((users) => {
        console.log(users);
        var stream = Twitter.stream('statuses/filter', { follow: users });

        stream.on('connect', function (request) {
            logger.log('Connecting to Twitter API...', 'main');
            //client.user.setPresence({ activity: { name: 'Connecting...' }, status: 'idle' });
            client.user.setStatus('idle');
        });
    
        stream.on('connected', function (response) {
            logger.log('Connected to Twitter API', 'main');
            //client.user.setPresence({ activity: { name: 'Now 24/7' }, status: 'online' });
            client.user.setStatus('online');
        });
    
        stream.on('disconnected', function (disconnectMessage) {
            logger.warn('Disconnected from Twitter API', 'main');
            //client.user.setPresence({ activity: { name: 'Disconnected' }, status: 'dnd' });
            client.user.setStatus('dnd');
        });
    
        stream.on('tweet', function (tweet) {
            logger.log(`Received tweet: '@${tweet.user.screen_name}'`, 'main');
            console.log(users);

            users.forEach((u) => {
                if(u.includes(tweet.user.id))
                {
                    db.all(`SELECT * FROM following WHERE accountID = ${tweet.user.id}`, (err, rows) => {
                        rows.forEach((row) => {
                            db.get(`SELECT * FROM profiles WHERE guildID = ?`, [row.guildID], (err, channel) => {
                                if(err) {
                                    logger.error(err, 'main');
                                }
                                const embedMessage = new Discord.MessageEmbed()
                                .setColor(config.discord.embed)
                                .setAuthor(tweet.user.name + ' (@' + tweet.user.screen_name + ')', tweet.user.profile_image_url, 'https://twitter.com/' + tweet.user.screen_name + '/status/' + tweet.id_str)
                                .setDescription(tweet.text)
                                .addField("Following", tweet.user.friends_count, true)
                                .addField("Followers", tweet.user.followers_count, true)
                                .setFooter('From Twitter')
                            
                                var guild = client.guilds.cache.get(row.guildID);
                                logger.log(`Forwarding tweet from '${tweet.user.screen_name}' to '${guild.name}' ->`, 'main');
                                client.channels.cache.get(channel.channelID).send(embedMessage);
                            });
                        });
                    });
                }
            })
        });

        clock.on('hour', function (date) {
            logger.log("Refreshing Twitter stream...", 'main');
            stream.stop();
            stream.start();
        });
    });
});

// Saves the log at 11:59pm
clock.on('23:59', function (date) {
    logger.log("End of logging for today. Saving log...", 'main');
    logger.save();
    logger.createLog('./logs');
});

const getUsers = () => {
    return new Promise((res, rej) => {
        let result = [];
        db.each(`SELECT ID FROM accounts`, (err, row) => {
            if(err) {
                rej(err)
            }
            result.push(row.ID);
        }, () => {
            res(result);
        })
    })
}