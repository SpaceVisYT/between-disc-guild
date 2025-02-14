const { Client: DiscordClient, GatewayIntentBits } = require("discord.js");
const { Client: GuildedClient } = require("guilded.js");

const DISCORD_CHANNEL_ID = "DISCORD CHANNEL ID HERE";
const GUILDED_CHANNEL_ID = "GUILDED CHANNEL ID HERE";

const discordClient = new DiscordClient({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const guildedClient = new GuildedClient({
    token: "GUILDED BOT TOKEN HERE"
});

const messageMap = new Map();

discordClient.once("ready", () => {
    console.log("✅ Discord client is ready!");
});

guildedClient.once("ready", () => {
    console.log("✅ Guilded client is ready!");
});

discordClient.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    
    try {
        const guildedChannel = await guildedClient.channels.fetch(GUILDED_CHANNEL_ID);
        const sentMessage = await guildedChannel.send({
            content: `**${message.author.displayName}:** ${message.content}`
        });

        messageMap.set(`discord-${message.id}`, sentMessage.id);
        messageMap.set(`guilded-${sentMessage.id}`, message.id);
        console.log(`🔄 Forwarded from Discord → Guilded: ${message.content}`);
    } catch (err) {
        console.error("❌ Error forwarding message to Guilded:", err);
    }
});

guildedClient.on("messageCreated", async (message) => {
    if (!message.author || message.author.bot) return;
    
    const isReply = message.replyMessageIds && message.replyMessageIds.length > 0;
    try {
        const discordChannel = await discordClient.channels.fetch(DISCORD_CHANNEL_ID);
        if (isReply) {
            const originalDiscordMessageId = messageMap.get(`guilded-${message.replyMessageIds[0]}`);
            if (originalDiscordMessageId) {
                const originalDiscordMessage = await discordChannel.messages.fetch(originalDiscordMessageId);
                await originalDiscordMessage.reply(`${message.author.name}: ${message.content}`);
            }
        } else {
            const sentMessage = await discordChannel.send(`**${message.author.name}:** ${message.content}`);
            messageMap.set(`guilded-${message.id}`, sentMessage.id);
            messageMap.set(`discord-${sentMessage.id}`, message.id);
        }
        console.log(`🔄 Forwarded from Guilded → Discord: ${message.content}`);
    } catch (err) {
        console.error("❌ Error forwarding message to Discord:", err);
    }
});

discordClient.on("messageCreate", async (message) => {
    if (message.author.bot || !message.reference) return;
    
    const originalGuildedMessageId = messageMap.get(`discord-${message.reference.messageId}`);
    if (!originalGuildedMessageId) return;
    }
);

discordClient.login("DISCORD BOT TOKEN HERE").catch(console.error);
guildedClient.login();
