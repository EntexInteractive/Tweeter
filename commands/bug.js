const Discord = require('discord.js');
const config = require('../config.json');
const package = require('../package.json');
const request = require('request');
const logger = require('kailogs');
const { features } = require('process');

module.exports = {
    name: "bug",
    description: "Links to the bug tracker.",
    group: "general",
    stat: null,
    async execute(message, client, settings) {
        var options = {
            url: 'https://api.github.com/repos/TheGuitarleader/Tweeter/issues?state=all',
            headers: {
              'User-Agent': 'theguitarleader'
            }
        };

        function callback(error, response, body) {
            if (!error && response.statusCode == 200) {
                var activeBugs = 0;
                var fixedBugs = 0;
                var featureRequests = 0;

                var info = JSON.parse(body);
                info.forEach((issue) => {
                    console.log(issue);
                    if(issue.state == "open") {
                        issue.labels.forEach((label) => {
                            if(label.name == "Bug") {
                                activeBugs++;
                            }
                            else if(label.name == "Feature Request") {
                                featureRequests++;
                            }
                        });
                    }

                    if(issue.state == "closed") {
                        issue.labels.forEach((label) => {
                            if(label.name == "Patched") {
                                fixedBugs++;
                            }
                        });
                    }
                });

                const embed = new Discord.MessageEmbed()
                .setColor(config.discord.embed)
                .setTitle(`Tweeter Bug Tracker`)
                .setThumbnail(client.user.avatarURL())
                .setDescription(`This helps us keep track of bugs and possible \nthings to add to make Tweeter even better!\n
                To submit a issue or something to add:
                - Click the link above.
                - Fill out the title and add a brief description.
                - Add the necessary label if its a bug or a feature.`)
                .addField("Features Submitted", featureRequests, false)
                .addField("Known Bugs", activeBugs, true)
                .addField("Bugs Fixed", fixedBugs, true)
                .setURL("https://github.com/TheGuitarleader/Tweeter/issues/new")
                .setFooter('Made with Kai Technology')    
                message.reply(embed);
                logger.log(`Showed bug tracker on guild '${message.guild.id}' (${message.guild.name})`, 'cmnd');
            }
        }
          
        request(options, callback);
    }
}