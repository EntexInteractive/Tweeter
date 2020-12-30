const Discord = require('discord.js');
const config = require('../config.json');
const package = require('../package.json');
const request = require('request');
const logger = require('kailogs');

module.exports = {
    name: "info",
    description: "Gives the user more information about the bot",
    group: "general",
    stat: null,
    async execute(message, client, settings) {
        var options = {
            url: 'https://api.github.com/repos/TheGuitarleader/Kai.js',
            headers: {
              'User-Agent': 'theguitarleader'
            }
        };

        function callback(error, response, body) {
            if (!error && response.statusCode == 200) {
                var info = JSON.parse(body);

                const embed = new Discord.MessageEmbed()
                .setColor(config.discord.embed_hex)
                .setTitle(`${info.name} v${package.version}`)
                .setThumbnail(client.user.avatarURL())
                .setDescription(`Made by Kyle Ebby\n\n` +
                `Built on:\nDiscord.js v${package.dependencies["discord.js"].replace("^","")}\n`)
                .addField("Active Servers", client.guilds.cache.size, false)
                .addField("Stars", info.stargazers_count, true)
                .addField("Issues", info.open_issues, true)
                .setURL(info.html_url)
                .setFooter('Made with Kai Technology')    
                message.reply(embed);
                logger.log(`Showed info on guild '${message.guild.id}' (${message.guild.name})`, 'command');
            }
        }
          
        request(options, callback);
    }
}