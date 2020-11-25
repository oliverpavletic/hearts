import { Suit } from './suits'

export class Card {
  private readonly _value: number
  private readonly _suit: Suit

  constructor (value: number, suit: Suit) {
    this._value = value
    this._suit = suit
  }

  get value (): number {
    return this._value
  }

  get suit (): Suit {
    return this._suit
  }

  public toString (): string {
    return `${this.value} of ${this.suit}`
  }

  static equals (a: Card, b: Card): boolean {
    return this.compareCards(a, b) === 0
  }

  static compareCards (a: Card, b: Card): number {
    type helper = Partial<Record<Suit, any>>
    const scaler: helper = {
      [Suit.DIAMONDS]: 1,
      [Suit.CLUBS]: 10,
      [Suit.HEARTS]: 100,
      [Suit.SPADES]: 1000
    }
    return scaler[a.suit] * a.value - scaler[b.suit] * b.value
  }
}
