import { EmojiData } from 'emoji-mart';

export type PublicPlayerInfo = {
  name: string;
  emoji: string;
  roundScore: number;
  totalScore: number;
  isConnected: boolean;
};
