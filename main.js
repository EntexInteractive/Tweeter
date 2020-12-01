const Discord = require('discord.js');
const fs = require('fs');
const Twit = require('twit');
const config = require('./config.json');

var logType = ['ERROR', 'CONN', 'INFO', 'DEBUG'];

consoleLog(logType[1], 'Connecting to Gateway...');

const client = new Discord.Client();

var EventEmitter = require('events');
var Tweeter = new EventEmitter();
var Twitter = new Twit({
    consumer_key: config.twitter.consumer_key,
    consumer_secret: config.twitter.consumer_secret,
    access_token: config.twitter.access_token,
    access_token_secret: config.twitter.access_token_secret
});

// Discord
client.once('connected', () => {
    consoleLog(logType[1], 'Connected to Discord API');
});

client.once('ready', () => {
    consoleLog(logType[1], 'Connected to Discord API');
    client.user.setPresence({ activity: { name: 'Now 24/7' }, status: 'dnd' });
    Tweeter.emit('start');
});

client.once('error', () => {
    consoleLog(logType[0],'Error connecting to Discord API');
});

client.once('disconnect', () => {
    consoleLog(logType[1], 'Disconnected from Discord API');
});

client.on('message', message => {
    if (message.content.startsWith(`${config.discord.prefix}ping`)) {
        message.channel.send("Pinging...").then(msg =>{
              var botping = Math.round(client.ws.ping)
              var ping = msg.createdTimestamp - message.createdTimestamp;
  
              var embed = new Discord.MessageEmbed()
              .setDescription(":hourglass_flowing_sand: " + ping + "ms\n\n:stopwatch: " + botping + "ms")
              .setColor('#1DA1F2')
              
              msg.delete();
              message.channel.send(embed);
        });
    }

    if(message.content.startsWith(`${config.discord.prefix}list`)) {
        const embedMessage = new Discord.MessageEmbed()
        .setColor('#1DA1F2')
        .setTitle('Currently following these Twitter accounts')
        .setDescription('- @PlayApex\n- @shrugtal\n- @monsterhunter\n')
    
        message.channel.send(embedMessage);
    }

    if(message.content.startsWith(`${config.discord.prefix}test`)) {
        client.channels.cache.get(config.discord.channel).send(':white_check_mark: Your tweets will show up here!');
    }

    if(message.content.startsWith(`${config.discord.prefix}disconnect`)) {
        Tweeter.emit('stop');
    }

    if(message.content.startsWith(`${config.discord.prefix}connect`)) {
        Tweeter.emit('start');
    }

    if(message.content.startsWith(`${config.discord.prefix}stop`)) {
        if(message.member.hasPermission('ADMINISTRATOR')) {
            message.channel.send(":white_check_mark: Shutting down...").then(msg => {
                process.exit();
            });
        } else {
            message.channel.send(":rage: You can't kill me!");
        }
    }

    if(message.content.startsWith(`${config.discord.prefix}donate`)) {
        const embedMessage = new Discord.MessageEmbed()
        .setColor('#1DA1F2')
        .setAuthor('Donation Info', client.user.avatarURL(), config.discord.donation_link)
        .setDescription("Tweeter is just one of many projects I'm working on. If you love Tweeter please consider donating to help support the development of this" + 
        "bot and many more to come! Donating also helps invest in better hardware to run this bot.")
        message.channel.send(embedMessage);
    }
});

client.login(config.discord.token);

// Twitter
Tweeter.on('start', function (save) {
    let userIds = config.twitter.followed_accounts
    var stream = Twitter.stream('statuses/filter', { follow: userIds });

    stream.on('connect', function (request) {
        consoleLog(logType[1], 'Connecting to Twitter API...');
        client.user.setPresence({ activity: { name: 'Connecting...' }, status: 'idle' });
    });

    stream.on('connected', function (response) {
        consoleLog(logType[1], 'Connected to Twitter API');
        client.user.setPresence({ activity: { name: 'Now 24/7' }, status: 'online' });
    });

    stream.on('disconnected', function (disconnectMessage) {
        consoleLog(logType[1], 'Disconnected from Twitter API');
        client.user.setPresence({ activity: { name: 'Disconnected' }, status: 'dnd' });
        sleep(2000);
        stream.start();
    });

    stream.on('tweet', function (tweet) {
        //consoleLog(logType[3], `Received tweet: ${tweet.id}`);
        if(!tweet.text.startsWith('RT'))
        {
            if(userIds.includes(tweet.user.id))
            {
                const embedMessage = new Discord.MessageEmbed()
                .setColor('#1DA1F2')
                .setAuthor(tweet.user.name + ' (@' + tweet.user.screen_name + ')', tweet.user.profile_image_url, 'https://twitter.com/' + tweet.user.screen_name + '/status/' + tweet.id_str)
                .setDescription(tweet.text)
                .addField("Following", tweet.user.friends_count, true)
                .addField("Followers", tweet.user.followers_count, true)
                .setFooter('From Twitter')
            
                consoleLog(logType[2], `Forwarding tweet from ${tweet.user.screen_name} to Discord ->`);
                client.channels.cache.get(config.discord.channel).send(embedMessage);
            }
        }
    });
});

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function consoleLog(type, message) {
    var time = require('moment');
    var currentTime = time().format('HH:mm:ss');
    return console.log(`[${currentTime}] [${type}]: ${message}`);
}