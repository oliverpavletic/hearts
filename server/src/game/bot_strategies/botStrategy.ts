import { Card } from '../card'
import { Hand } from '../hand'
import { Suit } from '../suits'

export interface BotStrategy {
  chooseCard: (
    hand: Hand,
    validSuits: Suit[],
    trickCards: readonly Card[]
  ) => Card
}
