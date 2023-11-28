"use strict";

const { Client, GatewayIntentBits } = require("discord.js");

class LoggerService {
    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
            ],
        });
    }
}

module.exports = new LoggerService();

// client.on("ready", () => {
//     console.log(`Logged is as ${client.user.tag}!`);
// });

// const token =
//     "MTE3OTAxNzYxNDU1OTgxMzczMw.GZnyWV.UcIU36m6zmD_4QIqzX2IPNQBhDZTqRsA8e6G58";
// client.login(token);

// client.on("messageCreate", (msg) => {
//     if (msg.author.bot) return;
//     if (msg.content === "hello") {
//         msg.reply("Hello cái gì??");
//     }
// });
