import {
  AudioPlayer,
  AudioPlayerStatus,
  VoiceConnection,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  VoiceConnectionStatus,
  entersState,
  StreamType,
} from '@discordjs/voice';
import { execFile, spawn } from 'child_process';
import { promisify } from 'util';
import { Readable } from 'stream';
import { VoiceBasedChannel, EmbedBuilder, TextChannel } from 'discord.js';
import { logger } from '../shared/logger';

const execFileAsync = promisify(execFile);

const YT_DLP = process.env.YT_DLP_PATH || 'yt-dlp';
const COOKIES_PATH = process.env.YT_COOKIES_PATH || '/app/cookies.txt';

export interface Track {
  title: string;
  url: string;
  streamUrl: string;
  duration: string;
  thumbnail: string;
  requestedBy: string;
}

export interface GuildQueue {
  tracks: Track[];
  current: Track | null;
  player: AudioPlayer;
  connection: VoiceConnection | null;
  textChannel: TextChannel | null;
  loop: 'off' | 'track' | 'queue';
  playing: boolean;
  idleTimeout: ReturnType<typeof setTimeout> | null;
}

const queues = new Map<string, GuildQueue>();

const IDLE_TIMEOUT_MS = 5 * 60 * 1000;

export function getQueue(guildId: string): GuildQueue | undefined {
  return queues.get(guildId);
}

export function createQueue(guildId: string): GuildQueue {
  const player = createAudioPlayer();
  const queue: GuildQueue = {
    tracks: [],
    current: null,
    player,
    connection: null,
    textChannel: null,
    loop: 'off',
    playing: false,
    idleTimeout: null,
  };

  player.on(AudioPlayerStatus.Idle, () => {
    handleTrackEnd(guildId);
  });

  player.on('error', (error) => {
    logger.error({ err: error, guildId }, 'Audio player error');
    handleTrackEnd(guildId);
  });

  queues.set(guildId, queue);
  return queue;
}

export function destroyQueue(guildId: string): void {
  const queue = queues.get(guildId);
  if (queue) {
    if (queue.idleTimeout) clearTimeout(queue.idleTimeout);
    queue.player.stop(true);
    queue.connection?.destroy();
    queues.delete(guildId);
  }
}

export async function connectToChannel(channel: VoiceBasedChannel): Promise<VoiceConnection> {
  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
  });

  try {
    await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
    return connection;
  } catch {
    connection.destroy();
    throw new Error('Failed to connect to voice channel within 30 seconds.');
  }
}

export async function searchTrack(query: string): Promise<Track | null> {
  try {
    const isUrl = query.startsWith('http://') || query.startsWith('https://');
    const authArgs = ['--cookies', COOKIES_PATH];
    const args = isUrl
      ? [query, '--dump-json', '--no-playlist', '--no-check-formats', '-f', 'bestaudio', ...authArgs]
      : [`ytsearch1:${query}`, '--dump-json', '--no-playlist', '--no-check-formats', '-f', 'bestaudio', ...authArgs];

    const { stdout } = await execFileAsync(YT_DLP, args, { maxBuffer: 1024 * 1024 });
    const info = JSON.parse(stdout);

    return {
      title: info.title ?? 'Unknown',
      url: info.webpage_url ?? info.url,
      streamUrl: info.url ?? '',
      duration: info.duration_string ?? '0:00',
      thumbnail: info.thumbnail ?? '',
      requestedBy: '',
    };
  } catch (error) {
    logger.error({ err: error, query }, 'yt-dlp search failed');
    return null;
  }
}

export function isPlaylistUrl(url: string): boolean {
  return url.includes('list=') && (url.includes('youtube.com') || url.includes('youtu.be'));
}

export async function searchPlaylist(url: string): Promise<Track[]> {
  try {
    const authArgs = ['--cookies', COOKIES_PATH];
    const args = [url, '--dump-json', '--flat-playlist', '--yes-playlist', ...authArgs];

    const { stdout } = await execFileAsync(YT_DLP, args, { maxBuffer: 10 * 1024 * 1024 });
    const lines = stdout.trim().split('\n');

    const tracks: Track[] = [];
    for (const line of lines) {
      try {
        const info = JSON.parse(line);
        tracks.push({
          title: info.title ?? 'Unknown',
          url: info.url ?? info.webpage_url ?? `https://www.youtube.com/watch?v=${info.id}`,
          streamUrl: '',
          duration: info.duration_string ?? '0:00',
          thumbnail: info.thumbnail ?? info.thumbnails?.[0]?.url ?? '',
          requestedBy: '',
        });
      } catch {
        continue;
      }
    }
    return tracks;
  } catch (error) {
    logger.error({ err: error, url }, 'yt-dlp playlist fetch failed');
    return [];
  }
}

export async function playTrack(guildId: string, track: Track): Promise<void> {
  const queue = queues.get(guildId);
  if (!queue || !queue.connection) return;

  if (queue.idleTimeout) {
    clearTimeout(queue.idleTimeout);
    queue.idleTimeout = null;
  }

  let audioStreamUrl = track.streamUrl;
  if (!audioStreamUrl) {
    const resolved = await searchTrack(track.url);
    if (!resolved) return;
    audioStreamUrl = resolved.streamUrl;
  }

  const ffmpeg = spawn(
    'ffmpeg',
    [
      '-reconnect',
      '1',
      '-reconnect_streamed',
      '1',
      '-reconnect_delay_max',
      '5',
      '-i',
      audioStreamUrl,
      '-f',
      'opus',
      '-c:a',
      'libopus',
      '-ar',
      '48000',
      '-ac',
      '2',
      '-b:a',
      '96k',
      'pipe:1',
    ],
    { stdio: ['ignore', 'pipe', 'pipe'] },
  );

  const resource = createAudioResource(ffmpeg.stdout as Readable, {
    inputType: StreamType.OggOpus,
  });

  ffmpeg.stderr.on('data', (data) => {
    logger.debug({ guildId }, `ffmpeg stderr: ${data}`);
  });

  queue.current = track;
  queue.playing = true;
  queue.player.play(resource);
  queue.connection.subscribe(queue.player);
}

function handleTrackEnd(guildId: string): void {
  const queue = queues.get(guildId);
  if (!queue) return;

  if (queue.loop === 'track' && queue.current) {
    playTrack(guildId, queue.current);
    return;
  }

  if (queue.loop === 'queue' && queue.current) {
    queue.tracks.push(queue.current);
  }

  const next = queue.tracks.shift();
  if (next) {
    playTrack(guildId, next);
    if (queue.textChannel) {
      const embed = new EmbedBuilder()
        .setColor(0x8b4513)
        .setTitle('🎵 Now Playing')
        .setDescription(`**${next.title}**\n\`${next.duration}\` • Requested by ${next.requestedBy}`)
        .setThumbnail(next.thumbnail)
        .setFooter({ text: 'Music is the universal language of the spirit.' });
      queue.textChannel.send({ embeds: [embed] }).catch(() => {});
    }
  } else {
    queue.current = null;
    queue.playing = false;
    queue.idleTimeout = setTimeout(() => {
      logger.info({ guildId }, 'Idle timeout reached, leaving voice channel');
      destroyQueue(guildId);
    }, IDLE_TIMEOUT_MS);
  }
}

export function formatQueue(queue: GuildQueue): string {
  if (queue.tracks.length === 0) return 'The queue is empty.';

  return (
    queue.tracks
      .slice(0, 10)
      .map((t, i) => `\`${i + 1}.\` **${t.title}** (\`${t.duration}\`) — ${t.requestedBy}`)
      .join('\n') + (queue.tracks.length > 10 ? `\n... and ${queue.tracks.length - 10} more` : '')
  );
}
