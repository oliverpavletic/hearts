import { Card } from '../card'
import { Suit } from '../suits'

export const minCard = (prev: Card, curr: Card): Card => (prev.value < curr.value ? prev : curr)

export const maxCard = (prev: Card, curr: Card): Card => (prev.value > curr.value ? prev : curr)

export const maxCardOfSuit = (suits: Suit[]) => {
  return (prev: Card, curr: Card): Card => (suits.includes(curr.suit) && prev.value < curr.value ? curr : prev)
}

export const maxCardBelow = (value: number) => {
  return (prev: Card, curr: Card): Card => (curr.value < value && curr.value > prev.value ? curr : prev)
}

export const getSuitWithFewestCardsButNotZero = (cards: Card[]): Suit => {
  interface helper {
    [Suit.DIAMONDS]: number
    [Suit.CLUBS]: number
    [Suit.HEARTS]: number
    [Suit.SPADES]: number
  }
  const reducer = (prev: helper, curr: Card): helper => {
    prev[curr.suit] += 1
    return prev
  }
  const initalValue: helper = {
    [Suit.DIAMONDS]: 0,
    [Suit.CLUBS]: 0,
    [Suit.HEARTS]: 0,
    [Suit.SPADES]: 0
  }

  const counts = cards.reduce(reducer, initalValue)
  let min = Suit.DIAMONDS;

  [Suit.CLUBS, Suit.HEARTS, Suit.SPADES].forEach((suit) => {
    if (counts[suit] > 0 && (counts[suit] < counts[min] || counts[min] === 0)) {
      min = suit
    }
  })

  return min
}
