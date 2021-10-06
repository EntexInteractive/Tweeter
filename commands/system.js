const Discord = require('discord.js');
const config = require('../config.json');
var os = require("os");

module.exports = {
    name: "system",
    description: "Shows current system telemetry. (Dev Only)",
    async execute(message, client) {
        if (message.member.id == config.discord.devID)
        {
            const embed = new Discord.MessageEmbed();
            embed.setColor(config.discord.embed_hex);
            embed.setAuthor(client.user.username, client.user.displayAvatarURL());
            embed.setTitle(":desktop:  Server Data");

            var uptime = Math.floor(process.uptime()) / 120;
            var memTotal = os.totalmem() / 1000000000;
            var memUsed = process.memoryUsage().rss / 1000000000;

            embed.addFields(
                {name: "Type:", value: "`" + os.type() + "`"},
                {name: "Platform:", value: "`"+ os.platform() + "`", inline: true},
                {name: "Uptime:", value: "`"+ uptime.toString().substring(0,5) + " hours`"},
                {name: "RAM Usage:", value: "`" + memUsed.toString().substring(0,5) + "GB / " + Math.round(memTotal) + "GB`", inline: true}
            );

            message.reply(embed);
        }
    }
}