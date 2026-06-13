import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, GuildMember, TextChannel } from 'discord.js';
import { AudioPlayerStatus } from '@discordjs/voice';
import { Command } from '../shared/constants';
import * as music from '../services/music';

export const playCmd: Command = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song from YouTube')
    .addStringOption((opt) =>
      opt.setName('query').setDescription('YouTube URL or search term').setRequired(true),
    ) as SlashCommandBuilder,

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const member = interaction.member as GuildMember;
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
      await interaction.reply({ content: 'You must be in a voice channel to play music, young one.', ephemeral: true });
      return;
    }

    await interaction.deferReply();

    const query = interaction.options.getString('query', true);
    const track = await music.searchTrack(query);

    if (!track) {
      await interaction.editReply('I could not find that song. Perhaps try a different search?');
      return;
    }

    track.requestedBy = interaction.user.username;

    let queue = music.getQueue(interaction.guildId!);
    if (!queue) {
      queue = music.createQueue(interaction.guildId!);
    }

    if (!queue.connection) {
      queue.connection = await music.connectToChannel(voiceChannel);
    }

    queue.textChannel = interaction.channel as TextChannel;

    const isPlaying = queue.playing && queue.player.state.status !== AudioPlayerStatus.Idle;

    if (isPlaying) {
      queue.tracks.push(track);
      const embed = new EmbedBuilder()
        .setColor(0x8b4513)
        .setTitle('📥 Added to Queue')
        .setDescription(`**${track.title}**\n\`${track.duration}\` • Position: ${queue.tracks.length}`)
        .setThumbnail(track.thumbnail)
        .setFooter({ text: 'Patience brings all things in time.' });
      await interaction.editReply({ embeds: [embed] });
    } else {
      await music.playTrack(interaction.guildId!, track);
      const embed = new EmbedBuilder()
        .setColor(0x8b4513)
        .setTitle('🎵 Now Playing')
        .setDescription(`**${track.title}**\n\`${track.duration}\` • Requested by ${track.requestedBy}`)
        .setThumbnail(track.thumbnail)
        .setFooter({ text: 'Music is the universal language of the spirit.' });
      await interaction.editReply({ embeds: [embed] });
    }
  },
};
