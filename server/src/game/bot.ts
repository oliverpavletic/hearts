import { BotGenerator } from './botGenerator';
import { BotStrategy } from './bot_strategies/botStrategy';
import { Card } from './card';
import { Player } from './player';
import { Suit } from './suits';

export class Bot extends Player {
  private strategy: BotStrategy;

  constructor(name: string, userId: string, position: number, strategy: BotStrategy, emoji: string) {
    super(name, userId, position);
    this.strategy = strategy;
    this.emoji = emoji;
  }

  public choseCard(validSuits: Suit[], trickCards: readonly Card[]): Card {
    return this.strategy.chooseCard(this._hand, validSuits, trickCards);
  }

  public isConnected(): boolean {
    return true;
  }

  public toBot(botGenerator: BotGenerator): Bot {
    return this;
  }
}
