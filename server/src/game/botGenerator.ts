import { Bot } from './bot';
import { BotStrategyManager } from './bot_strategies/botStrategyManager';
import { getRandomInt } from './rand';

type BotAppearance = {
  name: string;
  emoji: string;
};

export class BotGenerator {
  private botApperances: BotAppearance[];
  private botApperanceIndex: number;

  constructor() {
    this.botApperances = [
      { name: 'Woozy', emoji: '🥴' },
      { name: 'Squish', emoji: '🐙' },
      { name: 'Dr. Fox', emoji: '🦊' },
      { name: 'Apple', emoji: '🍎' },
    ];
    this.botApperanceIndex = getRandomInt(this.botApperances.length);
  }

  public generateRandomBot(userId: string, position: number): Bot {
    let appearance = this.botApperances[this.botApperanceIndex];
    let strategy = BotStrategyManager.getRandomStrategy();

    this.botApperanceIndex = (this.botApperanceIndex + 1) % this.botApperances.length;

    return new Bot(appearance.name, userId, position, strategy, appearance.emoji);
  }
}
