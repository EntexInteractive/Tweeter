const Discord = require('discord.js');
const config = require('../config.json');
const logger = require('kailogs');
const Twit = require('twit');

var Twitter = new Twit({
    consumer_key: config.twitter.consumer_key,
    consumer_secret: config.twitter.consumer_secret,
    access_token: config.twitter.access_token,
    access_token_secret: config.twitter.access_token_secret
});

module.exports = {
    name: "search",
    description: "Searchs Twitter for a user or a tweet.",
    group: 'general',
    async execute(message, client, settings) {

        var args = message.content.split(' ');

        if(args[1] == "user")
        {
            var term = message.content.replace(`${settings.botPrefix}search user `, "");
            message.channel.send("<:Twitter:785747426614444042> **Finding user** :mag_right: `" + term + "`");

            Twitter.get('users/search', { q: term },  function (err, json, response) {
                if(err) {
                    message.channel.send(":x: **Failed to find user!**");
                }
                else if(json.length > 0) {
                    var data = json[0];

                    const embed = new Discord.MessageEmbed();
                    embed.setColor(data.profile_link_color)
                
                    // Set user
                    if(data.retweeted_status != undefined) {
                        embed.setAuthor(`${data.name} retweeted`, data.profile_image_url, 'https://twitter.com/' + data.screen_name + '/status/' + data.id_str);
                        embed.setTitle(`${data.retweeted_status.user.name} (@ ${data.retweeted_status.user.screen_name})`);
                    }
                    else if(data.in_reply_to_status_id != null) {
                        embed.setAuthor(`${data.name} replying to`, data.profile_image_url, 'https://twitter.com/' + data.screen_name + '/status/' + data.id_str);
                    }
                    else if(data.in_reply_to_status_id == null && data.retweeted_status == undefined) {
                        embed.setAuthor(data.name + ' (@' + data.screen_name + ')', data.profile_image_url, 'https://twitter.com/' + data.screen_name + '/status/' + data.id_str);
                    }
                
                    // Set description
                    if(data.retweeted_status != undefined) {
                        embed.setDescription(data.retweeted_status.text.replace("&amp;", "&"));
                    }
                    else if(data.extended_tweet != undefined) {
                        embed.setDescription(data.extended_data.full_text.replace("&amp;", "&"));
                    }
                    else {
                        embed.setDescription(data.description.replace("&amp;", "&"));
                    }
                
                    if(data.retweeted_status != undefined) {
                        embed.addField("Following", formatCommas(data.retweeted_status.user.friends_count), true);
                        embed.addField("Followers", formatCommas(data.retweeted_status.user.followers_count), true);
                    }
                    else {
                        embed.addField("Following", formatCommas(data.friends_count), true);
                        embed.addField("Followers", formatCommas(data.followers_count), true);
                    }
                
                    
                    embed.setFooter('From Twitter')
                    message.channel.send(embed);            
                }
            });
        }
        else if(args[1] == "tweet")
        {
            var term = message.content.replace(`${settings.botPrefix}search tweet `, "");
            message.channel.send("<:Twitter:785747426614444042> **Searching** :mag_right: `" + term + "`");
            
            Twitter.get('search/tweets', { q: term },  function (err, json, response) {
                if(err) {
                    message.channel.send(":x: **Failed to find tweet!**");
                }
                else if(json.statuses.length > 0) {
                    var data = json.statuses[0];
                    console.log(data);

                    const embed = new Discord.MessageEmbed();
                    embed.setColor(data.user.profile_link_color)
                
                    // Set user
                    if(data.retweeted_status != undefined) {
                        embed.setAuthor(`${data.user.name} retweeted`, data.user.profile_image_url, 'https://twitter.com/' + data.user.screen_name + '/status/' + data.id_str);
                        embed.setTitle(`${data.retweeted_status.user.name} (@ ${data.retweeted_status.user.screen_name})`);
                    }
                    else if(data.in_reply_to_status_id != null) {
                        embed.setAuthor(`${data.user.name} replying to`, data.user.profile_image_url, 'https://twitter.com/' + data.user.screen_name + '/status/' + data.id_str);
                    }
                    else if(data.in_reply_to_status_id == null && data.retweeted_status == undefined) {
                        embed.setAuthor(data.user.name + ' (@' + data.user.screen_name + ')', data.user.profile_image_url, 'https://twitter.com/' + data.user.screen_name + '/status/' + data.id_str);
                    }
                
                    // Set description
                    if(data.retweeted_status != undefined) {
                        embed.setDescription(data.retweeted_status.text.replace("&amp;", "&"));
                    }
                    else if(data.extended_tweet != undefined) {
                        embed.setDescription(data.extended_data.full_text.replace("&amp;", "&"));
                    }
                    else {
                        embed.setDescription(data.text.replace("&amp;", "&"));
                    }
                
                    // Set image if there is one
                    if(data.extended_entities != undefined)
                    {
                        embed.setImage(data.extended_entities.media[0].media_url)
                    }
                    else if(data.retweeted_status != undefined && data.retweeted_status.extended_entities != undefined)
                    {
                        embed.setImage(data.retweeted_status.extended_entities.media[0].media_url)
                    }

                    if(data.retweeted_status != undefined) {
                        embed.addField("Following", formatCommas(data.retweeted_status.user.friends_count), true);
                        embed.addField("Followers", formatCommas(data.retweeted_status.user.followers_count), true);
                    }
                    else {
                        embed.addField("Following", formatCommas(data.user.friends_count), true);
                        embed.addField("Followers", formatCommas(data.user.followers_count), true);
                    }
                
                    
                    embed.setFooter('From Twitter')
                    message.channel.send(embed);
                }
                else
                {
                    message.channel.send(":x: **Could not find any tweets related to:** `" + term + "`");
                }
            });
        }
        else if(args[1] == "tweets")
        {
            var term = message.content.replace(`${settings.botPrefix}search tweets `, "");
            message.channel.send("<:Twitter:785747426614444042> **Searching** :mag_right: `" + term + "`");
            
            Twitter.get('search/tweets', { q: term },  function (err, json, response) {
                var tweets = json.statuses;

                if(err) {
                    message.channel.send(":x: **Failed to find tweets!**");
                }
                else if(tweets.length > 0) {
                    const embed = new Discord.MessageEmbed();
                    embed.setColor(config.discord.embed);
                    embed.setTitle("Showing results for term: `" + term + "`");
                    tweets.forEach((tweet) => {
                        if(tweet.lang == "en") {
                            embed.addField(tweet.user.name + ' (@' + tweet.user.screen_name + ')', tweet.text.replace("&amp;", "&"));
                        }
                    });

                    embed.setFooter('From Twitter');
                    message.reply(embed);
                }
                else
                {
                    message.channel.send(":x: **Could not find any tweets related to:** `" + term + "`");
                }
            });
        }
        else
        {
            message.channel.send(":x: `" + args[1] + "` **is not vaild parameter!**");
        }


    }
}

function formatCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}