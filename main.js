const Discord = require('discord.js');
const fs = require('fs');
const Twit = require('twit');
const {
    consumer_key,
    consumer_secret,
    access_token,
    access_token_secret,
    discord_prefix,
    discord_token,
    discord_channel
} = require('./config.json');

var logType = ['ERROR', 'CONN', 'INFO', 'DEBUG'];

consoleLog(logType[1], 'Connecting to Gateway...');

const client = new Discord.Client();

var EventEmitter = require('events');
var Tweeter = new EventEmitter();
var Twitter = new Twit({
    consumer_key: consumer_key,
    consumer_secret: consumer_secret,
    access_token: access_token,
    access_token_secret: access_token_secret
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
    if (message.content.startsWith(`${discord_prefix}ping`)) {
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

    if(message.content.startsWith(`${discord_prefix}list`)) {
        const embedMessage = new Discord.MessageEmbed()
        .setColor('#1DA1F2')
        .setTitle('Currently following these Twitter accounts')
        .setDescription('- @PlayApex\n- @shrugtal\n- @MannyHagopian\n- @MonsterclipRSPN\n- @ChadGrenier\n- @zylbrad7\n- @monsterhunter\n- @tommiecas')
    
        message.channel.send(embedMessage);
    }

    if(message.content.startsWith(`${discord_prefix}test`)) {
        client.channels.cache.get(discord_channel).send(':white_check_mark: Your tweets will show up here!');
    }

    if(message.content.startsWith(`${discord_prefix}disconnect`)) {
        Tweeter.emit('stop');
    }

    if(message.content.startsWith(`${discord_prefix}connect`)) {
        Tweeter.emit('start');
    }
});

client.login(discord_token);

// Twitter
Tweeter.on('start', function (save) {
    let userIds = [1048018930785083392, 1038220641311309829, 438653616, 20950208, 41494136, 703828455683596288, 306490355, 15865245, 3774450793, 3190084598 ]
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
                client.channels.cache.get(discord_channel).send(embedMessage);
            }
        }
    });

    Tweeter.on('stop', function (disconnect) {
        consoleLog(logType[1], 'Stopped the data stream');
        stream.stop();
        client.channels.cache.get(discord_channel).send(':white_check_mark: Terminated connection to data stream');
        client.user.setStatus('dnd');
    })

    Tweeter.on('start', function (disconnect) {
        consoleLog(logType[1], 'Restarted the data stream');
        sleep(1000);
        stream.start();
        client.channels.cache.get(discord_channel).send(':white_check_mark: Attempting connection to data stream');
    })
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