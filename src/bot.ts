import 'dotenv/config';
import path from 'path';

if (process.env.YT_DLP_PATH) {
  const ytdlpDir = path.dirname(process.env.YT_DLP_PATH);
  process.env.PATH = `${ytdlpDir};${process.env.PATH}`;
}
if (process.env.FFMPEG_PATH) {
  const ffmpegDir = path.dirname(process.env.FFMPEG_PATH);
  process.env.PATH = `${ffmpegDir};${process.env.PATH}`;
}

import { Client, GatewayIntentBits, Events, EmbedBuilder, TextChannel, MessageFlags } from 'discord.js';
import { commands } from './commands';
import { XP_PER_MESSAGE, XP_COOLDOWN_MS, checkLevelUp, getRank, getLevelUpMessage } from './services/leveling';
import { Element, ELEMENT_INFO } from './shared/constants';
import { logger } from './shared/logger';
import * as db from './db';
import * as music from './services/music';
import { startGameAlerts, startDailyPost } from './services/alerts';

const CHANNEL_MUSIC = process.env.CHANNEL_MUSIC || '';
const CHANNEL_SPORTS = process.env.CHANNEL_SPORTS || '';
const CHANNEL_BOT = process.env.CHANNEL_BOT || '';

const MUSIC_COMMANDS = new Set(['play', 'pause', 'skip', 'stop', 'queue', 'nowplaying', 'loop', 'clear', 'shuffle']);
const SPORTS_COMMANDS = new Set(['scores', 'standings', 'schedule', 'favteam', 'bet', 'poll']);

function getTargetChannel(commandName: string): string {
  if (MUSIC_COMMANDS.has(commandName)) return CHANNEL_MUSIC;
  if (SPORTS_COMMANDS.has(commandName)) return CHANNEL_SPORTS;
  return CHANNEL_BOT;
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

const xpCooldowns = new Map<string, number>();

client.once(Events.ClientReady, (c) => {
  logger.info(`Uncle Iroh is ready! Logged in as ${c.user.tag}`);
  client.user!.setActivity('brewing tea | /wisdom', { type: 0 });
  startGameAlerts(client);
  startDailyPost(client);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isStringSelectMenu() && interaction.customId === 'element_select') {
    const element = interaction.values[0] as Element;
    const userId = interaction.user.id;
    const guildId = interaction.guildId!;

    await db.setElement(element, userId, guildId);

    const info = ELEMENT_INFO[element];
    const embed = new EmbedBuilder()
      .setColor(info.color)
      .setTitle(`${info.emoji} Element Chosen!`)
      .setDescription(
        `You have chosen **${element.charAt(0).toUpperCase() + element.slice(1)}**!\n\n` +
          `*An excellent choice. Every element has its strengths — what matters is how you grow with it.*\n\n` +
          'Use `/wisdom` to receive guidance on your path.',
      )
      .setFooter({ text: 'Uncle Iroh' })
      .setTimestamp();

    await interaction.update({ embeds: [embed], components: [] });
    return;
  }

  if (!interaction.isChatInputCommand()) return;

  const command = commands.find((c) => c.data.name === interaction.commandName);
  if (command) {
    try {
      const targetChannelId = getTargetChannel(interaction.commandName);

      if (!targetChannelId || interaction.channelId === targetChannelId) {
        await command.execute(interaction);
      } else {
        const botChannel = await interaction.guild?.channels.fetch(targetChannelId).catch(() => null) as TextChannel | null;
        if (!botChannel) {
          await command.execute(interaction);
          return;
        }

        const originalReply = interaction.reply.bind(interaction);
        const originalEditReply = interaction.editReply.bind(interaction);
        const originalFollowUp = interaction.followUp.bind(interaction);
        const originalDeferReply = interaction.deferReply.bind(interaction);

        interaction.deferReply = (async () => {
          await originalDeferReply({ flags: ['Ephemeral' as const] });
        }) as any;

        interaction.reply = (async (options: any) => {
          if (typeof options === 'string') {
            await botChannel.send({ content: `*${interaction.user.username} used /${interaction.commandName}:*\n${options}` });
          } else if (options.ephemeral) {
            return originalReply(options);
          } else {
            await botChannel.send({ ...options, content: options.content ? `*${interaction.user.username} used /${interaction.commandName}:*\n${options.content}` : undefined });
          }
          if (!interaction.replied) {
            return originalReply({ content: `🍵 Posted in <#${targetChannelId}>`, flags: ['Ephemeral' as const] });
          } else {
            await originalEditReply({ content: `🍵 Posted in <#${targetChannelId}>` });
          }
        }) as any;

        interaction.editReply = (async (options: any) => {
          if (typeof options === 'string') {
            await botChannel.send({ content: `*${interaction.user.username} used /${interaction.commandName}:*\n${options}` });
          } else {
            await botChannel.send({ ...options, content: options.content ? `*${interaction.user.username} used /${interaction.commandName}:*\n${options.content}` : undefined });
          }
          return originalEditReply({ content: `🍵 Posted in <#${targetChannelId}>` });
        }) as any;

        interaction.followUp = (async (options: any) => {
          if (typeof options === 'string') {
            await botChannel.send(options);
          } else if (options.ephemeral) {
            return originalFollowUp(options);
          } else {
            await botChannel.send(options);
          }
        }) as any;

        await command.execute(interaction);
      }
    } catch (error) {
      logger.error({ err: error, command: interaction.commandName }, 'Command execution failed');
      try {
        const reply = { content: 'Even Uncle Iroh makes mistakes sometimes. Please try again.', flags: ['Ephemeral' as const] };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(reply);
        } else {
          await interaction.reply(reply);
        }
      } catch {
        /* interaction expired */
      }
    }
  }
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot || !message.guild) return;

  const userId = message.author.id;
  const guildId = message.guildId!;
  const key = `${userId}-${guildId}`;

  const lastXp = xpCooldowns.get(key);
  if (lastXp && Date.now() - lastXp < XP_COOLDOWN_MS) return;

  await db.createUser(userId, guildId);
  const user = (await db.getUser(userId, guildId))!;
  if (!user.element) return;

  await db.addXp(XP_PER_MESSAGE, userId, guildId);
  xpCooldowns.set(key, Date.now());

  const updatedUser = (await db.getUser(userId, guildId))!;
  const newLevel = checkLevelUp(updatedUser.level, updatedUser.xp);
  if (newLevel) {
    await db.setLevel(newLevel, userId, guildId);
    const rank = getRank(updatedUser.element, newLevel);
    const info = ELEMENT_INFO[updatedUser.element as Element] || { color: 0x8b4513, emoji: '🍵' };

    const embed = new EmbedBuilder()
      .setColor(info.color)
      .setTitle('⬆️ Level Up!')
      .setDescription(
        `${getLevelUpMessage()}\n\n` +
          `${info.emoji} **${message.author.username}** reached level **${newLevel}** — *${rank}*!`,
      )
      .setTimestamp();

    message.channel.send({ embeds: [embed] }).catch(() => {});
  }
});

client.on(Events.VoiceStateUpdate, (oldState, _newState) => {
  const guildId = oldState.guild.id;
  const queue = music.getQueue(guildId);
  if (!queue?.connection) return;

  const channel = oldState.guild.members.me?.voice.channel;
  if (!channel) return;

  const members = channel.members.filter((m) => !m.user.bot);
  if (members.size === 0) {
    logger.info({ guildId }, 'No users in voice channel, leaving');
    music.destroyQueue(guildId);
  }
});

const token = process.env.DISCORD_TOKEN;
if (!token) {
  logger.fatal('DISCORD_TOKEN not found in .env file');
  process.exit(1);
}

db.migrate().then(() => {
  logger.info('Database migrated');
  client.login(token);
});
