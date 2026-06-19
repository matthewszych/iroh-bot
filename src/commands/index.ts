import { Command } from '../shared/constants';
import { wisdomCmd } from './wisdom';
import { askIrohCmd } from './ask-iroh';
import { chooseElementCmd } from './choose-element';
import { profileCmd } from './profile';
import { leaderboardCmd } from './leaderboard';
import { teaCmd } from './tea';
import { irohCmd } from './iroh';
import { playCmd } from './play';
import { pauseCmd } from './pause';
import { skipCmd } from './skip';
import { stopCmd } from './stop';
import { queueCmd } from './queue';
import { nowPlayingCmd } from './nowplaying';
import { loopCmd } from './loop';
import { clearCmd } from './clear';
import { shuffleCmd } from './shuffle';

const aiEnabled = process.env.ENABLE_AI === 'true';

export const commands: Command[] = [
  wisdomCmd,
  ...(aiEnabled ? [askIrohCmd] : []),
  chooseElementCmd,
  profileCmd,
  leaderboardCmd,
  teaCmd,
  irohCmd,
  playCmd,
  pauseCmd,
  skipCmd,
  stopCmd,
  queueCmd,
  nowPlayingCmd,
  loopCmd,
  clearCmd,
  shuffleCmd,
];
