import { getRandomInt } from '../rand';
import { BotStrategy } from './botStrategy';
import { BetterBotStrategy } from './betterBotStrategy';
import { RandomBotStrategy } from './randomBotStrategy';
import { SimpleBotStrategy } from './simpleBotStrategy';

export class BotStrategyManager {
  private static strategies: BotStrategy[] = [
    new BetterBotStrategy(),
    new SimpleBotStrategy(),
    new RandomBotStrategy(),
  ];

  public static getRandomStrategy() {
    return BotStrategyManager.strategies[getRandomInt(BotStrategyManager.strategies.length)];
  }
}
