const { Client, Collection, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ]
});

const prisma = new PrismaClient();
client.commands = new Collection();
const commandsPath = path.join(__dirname, './commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  try {
    const command = require(filePath);
    if (command.data && typeof command.execute === 'function') {
      client.commands.set(command.data.name, command);
    } else {
      throw new Error(`Command structure validation failed: ${file}`);
    }
  } catch (error) {
    console.error(`Error loading command ${file}:`, error);
  }
}
client.once('ready', () => {
  console.log('Discord Bot is ready!');
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, { prisma });
  } catch (error) {
    console.error('Error executing command:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  }
});
client.login(process.env.DISCORD_TOKEN);
