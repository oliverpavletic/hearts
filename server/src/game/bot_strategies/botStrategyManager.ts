import { getRandomInt } from '../rand'
import { BotStrategy } from './botStrategy'
import { BetterBotStrategy } from './betterBotStrategy'
// import { RandomBotStrategy } from './randomBotStrategy'
// import { SimpleBotStrategy } from './simpleBotStrategy'

const strategies: BotStrategy[] = [new BetterBotStrategy()]

export const getRandomStrategy = (): BotStrategy => {
  return strategies[getRandomInt(strategies.length)]
}
