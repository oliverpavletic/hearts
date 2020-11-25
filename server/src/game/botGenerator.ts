import { Bot } from './bot'
import { getRandomStrategy } from './bot_strategies/botStrategyManager'
import { getRandomInt } from './rand'

interface BotAppearance {
  name: string
  emoji: string
}

export class BotGenerator {
  private readonly botApperances: BotAppearance[]
  private botApperanceIndex: number

  constructor () {
    this.botApperances = [
      { name: 'Woozy', emoji: '🥴' },
      { name: 'Squish', emoji: '🐙' },
      { name: 'Dr. Fox', emoji: '🦊' },
      { name: 'Apple', emoji: '🍎' }
    ]
    this.botApperanceIndex = getRandomInt(this.botApperances.length)
  }

  public generateRandomBot (userId: string, position: number): Bot {
    const appearance = this.botApperances[this.botApperanceIndex]
    const strategy = getRandomStrategy()

    this.botApperanceIndex =
      (this.botApperanceIndex + 1) % this.botApperances.length

    return new Bot(
      appearance.name,
      userId,
      position,
      strategy,
      appearance.emoji
    )
  }
}
