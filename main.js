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

var tweetCount = 0;

var EventEmitter = require('events');
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
    client.user.setPresence({ activity: { name: `${numCommas(tweetCount)} tweets/hr!`, type: 'WATCHING' }});
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

client.on('guildCreate', (guild) => {
    logger.log(`Joined server '${guild.id}' (${guild.name})`, 'main');

    // Create Profile
    db.run(`INSERT INTO profiles(guildID) VALUES(${guild.id})`, function(err) {
        if(err) {
            logger.error(err, 'dtbs');
        }

        logger.log(`Added profile for guild '${guild.id}' (${guild.name})`, 'main');
    });
    
    try {
        client.channels.cache.get(guild.systemChannelID).send("Hi I'm Kai! :wave: To see what I can do use `/help`");
    } catch (err) {
        logger.error('No message channel found: ' + err, 'main');
    }
});

client.on('guildDelete', (guild) => {
    logger.log(`Left server ${guild.id} (${guild.name})`, 'main');

    // Remove Profile
    db.run(`DELETE FROM profiles WHERE guildID = ${guild.id}`, function(err) {
        if(err) {
            logger.error(err, 'dtbs');
        }

        logger.log(`Deleted profile for guild '${guild.id}' (${guild.name})`, 'main');
    });
});

// Twitter
Tweeter.on('start', function (save) {
    getUsers().then((users) => {
        logger.log('Gathered users from database', 'database');
        var stream = Twitter.stream('statuses/filter', { follow: users });

        stream.on('connect', function (request) {
            //logger.log('Connecting to follow tweet stream...', 'main');
            //client.user.setPresence({ activity: { name: 'Connecting...' }, status: 'idle' });
            client.user.setStatus('idle');
        });
    
        stream.on('connected', function (response) {
            logger.log('Connected to follow tweet stream', 'main');
            //client.user.setPresence({ activity: { name: 'Now 24/7' }, status: 'online' });
            client.user.setStatus('online');
        });
    
        stream.on('disconnected', function (disconnectMessage) {
            //logger.warn('Disconnected from follow tweet stream', 'main');
            //client.user.setPresence({ activity: { name: 'Disconnected' }, status: 'dnd' });
            client.user.setStatus('dnd');
        });
    
        stream.on('tweet', function (tweet) {
            try {
                logger.log(`Received tweet: '@${tweet.user.screen_name}' (${BigInt(tweet.user.id)})`, 'main');
                tweetCount++;

                db.run(`UPDATE stats SET received = received + 1`, function(err) {
                    if(err) {
                        logger.error(err, 'database');
                    }
                });
    
                if(users.includes(tweet.user.id_str))
                {
                    logger.log(`Verified tweet: '@${tweet.user.screen_name}' (${tweet.user.id_str})`, 'main');
                    db.all(`SELECT * FROM following WHERE accountID = ${tweet.user.id_str}`, (err, rows) => {
                        rows.forEach((row) => {
                            db.get(`SELECT * FROM profiles WHERE guildID = ?`, [row.guildID], (err, profile) => {
                                if(err) {
                                    logger.error(err, 'main');
                                }
                                else if(profile.channelID != null)
                                {
                                    if(row.favorite == "true")
                                    {
                                        displayTweet(tweet, profile.channelID);
                                        logger.log(`Forwarding tweet from favorite '${tweet.user.screen_name}' to '${client.guilds.cache.get(profile.guildID).name}' ->`, 'main');

                                        db.run(`UPDATE stats SET forward = forward + 1`, function(err) {
                                            if(err) {
                                                logger.error(err, 'database');
                                            }
                                        });
                                    }
                                    else
                                    {
                                        if(tweet.retweeted_status != undefined && profile.showRetweets == "true")
                                        {
                                            displayTweet(tweet, profile.channelID);
                                            logger.log(`Forwarding retweet from '${tweet.user.screen_name}' to '${client.guilds.cache.get(profile.guildID).name}' ->`, 'main');
                                        }
                                        else if(tweet.in_reply_to_status_id != null && profile.showReplies == "true")
                                        {
                                            displayTweet(tweet, profile.channelID);
                                            logger.log(`Forwarding reply from '${tweet.user.screen_name}' to '${client.guilds.cache.get(profile.guildID).name}' ->`, 'main');
                                        }
                                        else if(tweet.in_reply_to_status_id == null && tweet.retweeted_status == undefined)
                                        {
                                            displayTweet(tweet, profile.channelID);
                                            logger.log(`Forwarding tweet from '${tweet.user.screen_name}' to '${client.guilds.cache.get(profile.guildID).name}' ->`, 'main');
                                        }
                                    }
                                }
                                else
                                {
                                    logger.warn(`Could not forward tweet from '${tweet.user.screen_name}' to '${guild.name}' because no channel was found!`, 'main');
                                }                                
                            });
                        });
                    });
                }
            } catch (err) {
                logger.error(err);
            }
        });

        clock.on('hour', function (date) {
            logger.log("Refreshing follow tweet stream...", 'main');
            stream.stop();
            stream.start();
        });
    });

    // getKeywords().then((keywords) => {
    //     //var stream = null;
    //     if(keywords.length > 0)
    //     {
    //         var stream = Twitter.stream('statuses/filter', { track: keywords, language: 'en' });

    //         // stream.on('connect', function (request) {
    //         //     logger.log('Connecting to tracking stream...', 'main');
    //         // });
        
    //         stream.on('connected', function (response) {
    //             logger.log('Connected to tracking stream', 'main');
    //         });
        
    //         // stream.on('disconnected', function (disconnectMessage) {
    //         //     logger.warn('Disconnected from tracking stream', 'main');
    //         // });

    //         stream.on('tweet', function (tweet) {
    //             db.get(`SELECT * FROM profiles WHERE guildID = ?`, [config.discord.guildID], (err, profile) => {
    //                 if(err) {
    //                     logger.error(err, 'main');
    //                 }
    //                 else if(profile.trackChannelID != null)
    //                 {
    //                     if(tweet.in_reply_to_status_id == null && tweet.retweeted_status == undefined)
    //                     {
    //                         displayTweet(tweet, profile.trackChannelID);
    //                         logger.log(`Forwarding tracked tweet from to '${client.guilds.cache.get(profile.guildID).name}' ->`, 'main');
    //                     }
    //                 }
    //                 else
    //                 {
    //                     logger.warn(`Could not forward tweet from '${tweet.user.screen_name}' to '${guild.name}' because no channel was found!`, 'main');
    //                 }                                
    //             });
    //         });
    //     }

    //     clock.on('hour', function (date) {
    //         logger.log("Refreshing Tracking stream...", 'main');
    //         stream.stop();
    //         stream.start();
    //     });
    // });
});

// Saves the log at 11:59pm
clock.on('23:59', function (date) {
    logger.log("End of logging for today. Saving log...", 'main');
    logger.save();
    logger.createLog('./logs');
});

setInterval(function() {
    client.user.setPresence({ activity: { name: `${numCommas(tweetCount)} tweets/hr!`, type: 'WATCHING' }});
    logger.log(`Updating tweetCount: '${numCommas(tweetCount)} tweets/hr!'`);
    tweetCount = 0;
}, 60 * 60000)

function numCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

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

const getKeywords = () => {
    return new Promise((res, rej) => {
        let result = [];
        db.each(`SELECT term FROM tracking`, (err, row) => {
            if(err) {
                rej(err)
            }
            result.push(row.term);
        }, () => {
            console.log(result);
            res(result);
        })
    })
}

function displayTweet(tweet, channel) {
    const embed = new Discord.MessageEmbed();
    embed.setColor(tweet.user.profile_link_color)

    // Set user
    if(tweet.retweeted_status != undefined) {
        embed.setAuthor(`${tweet.user.name} retweeted`, tweet.user.profile_image_url, 'https://twitter.com/' + tweet.user.screen_name + '/status/' + tweet.id_str);
        embed.setTitle(`${tweet.retweeted_status.user.name} (@ ${tweet.retweeted_status.user.screen_name})`);
    }
    else if(tweet.in_reply_to_status_id != null) {
        embed.setAuthor(`${tweet.user.name} replying to`, tweet.user.profile_image_url, 'https://twitter.com/' + tweet.user.screen_name + '/status/' + tweet.id_str);
    }
    else if(tweet.in_reply_to_status_id == null && tweet.retweeted_status == undefined) {
        embed.setAuthor(tweet.user.name + ' (@' + tweet.user.screen_name + ')', tweet.user.profile_image_url, 'https://twitter.com/' + tweet.user.screen_name + '/status/' + tweet.id_str);
    }

    // Set description
    if(tweet.retweeted_status != undefined) {
        //embed.setDescription(tweet.retweeted_status.text);
        embed.setDescription(changeHTMLCharacters(tweet.retweeted_status.text));
    }
    else if(tweet.extended_tweet != undefined) {
        //embed.setDescription(tweet.extended_tweet.full_text);
        embed.setDescription(changeHTMLCharacters(tweet.extended_tweet.full_text));
    }
    else {
        //embed.setDescription(tweet.text);
        embed.setDescription(changeHTMLCharacters(tweet.text));
    }

    // Set image if there is one
    if(tweet.extended_entities != undefined)
    {
        embed.setImage(tweet.extended_entities.media[0].media_url)
    }
    else if(tweet.retweeted_status != undefined && tweet.retweeted_status.extended_entities != undefined)
    {
        embed.setImage(tweet.retweeted_status.extended_entities.media[0].media_url)
    }

    if(tweet.retweeted_status != undefined) {
        embed.addField("Following", formatCommas(tweet.retweeted_status.user.friends_count), true);
        embed.addField("Followers", formatCommas(tweet.retweeted_status.user.followers_count), true);
    }
    else {
        embed.addField("Following", formatCommas(tweet.user.friends_count), true);
        embed.addField("Followers", formatCommas(tweet.user.followers_count), true);
    }
    
    embed.setFooter('From Twitter')
    client.channels.cache.get(channel).send(embed);
}

function formatCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function changeHTMLCharacters(text) {
    let tweetArray = text.split(' ');
    let formatTweet = "";

    console.log(tweetArray);

    tweetArray.forEach((word) => {
        word = word.replace("&amp;","&");
        word = word.replace("&lt;","<");
        word = word.replace("&gt;",">");

        formatTweet += word + " ";
    });
    
    return formatTweet;
}