import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { commands } from './commands';
import { logger } from './shared/logger';

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token || !clientId) {
  logger.fatal('DISCORD_TOKEN and CLIENT_ID must be set in .env');
  process.exit(1);
}

const rest = new REST().setToken(token);

const clearMode = process.argv.includes('--clear');

(async () => {
  try {
    if (clearMode) {
      if (guildId) {
        await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] });
        logger.info({ guildId }, 'Cleared all guild commands');
      } else {
        await rest.put(Routes.applicationCommands(clientId), { body: [] });
        logger.info('Cleared all global commands');
      }
      return;
    }

    logger.info('Registering slash commands...');

    const commandData = commands.map((cmd) => cmd.data.toJSON());

    if (guildId) {
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commandData });
      logger.info({ count: commandData.length, guildId }, 'Registered commands to guild');
    } else {
      await rest.put(Routes.applicationCommands(clientId), { body: commandData });
      logger.info({ count: commandData.length }, 'Registered commands globally');
    }
  } catch (error) {
    logger.error({ err: error }, 'Failed to register commands');
  }
})();
