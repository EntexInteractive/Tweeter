const config = require('../config.json');
const logger = require('kailogs');

module.exports = {
    name: "restart",
    description: "Restarts the bot (Dev only)",
    group: 'dev',
    stat: null,
    async execute(message, client, settings) {
        if (message.member.id == config.discord.devID)
        {
            message.channel.send(":white_check_mark: Log saved :floppy_disk: and restarting...").then(msg => {
                process.exit();
            })
        }
    }
}