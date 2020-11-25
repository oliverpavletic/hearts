import { assert } from 'console'

import { Card } from './card'
import { Hand } from './hand'
import { DECK_SIZE, MAX_NUM_PLAYERS } from './constants'
import { SUITS } from './suits'

const VALUES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]

class Deck {
  protected cards: Card[]

  constructor () {
    this.cards = []
    SUITS.forEach((suit) => {
      VALUES.forEach((value) => {
        this.cards.push(new Card(value, suit))
      })
    })
    assert(this.cards.length === DECK_SIZE)
  }

  public generateHands (): Hand[] {
    const hands: Hand[] = []
    const handSize: number = Math.floor(DECK_SIZE / MAX_NUM_PLAYERS)
    let hand: Hand

    for (let i = 0; i < MAX_NUM_PLAYERS; i += 1) {
      hand = new Hand(this.cards.splice(0, handSize))
      assert(hand.size() === handSize)
      hands.push(hand)
    }

    return hands
  }
}

export class ShuffledDeck extends Deck {
  constructor () {
    super()
    this.shuffle()
  }

  private shuffle (): void {
    let randomIndex: number
    let temp: Card

    for (let i = this.cards.length - 1; i !== 0; i -= 1) {
      randomIndex = Math.floor(Math.random() * (i + 1))
      temp = this.cards[i]
      this.cards[i] = this.cards[randomIndex]
      this.cards[randomIndex] = temp
    }
  }
}
