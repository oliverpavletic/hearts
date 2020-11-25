import { Card } from '../card';
import { Suit } from '../suits';

export let minCard = (prev: Card, curr: Card) => (prev.value < curr.value ? prev : curr);

export let maxCard = (prev: Card, curr: Card) => (prev.value > curr.value ? prev : curr);

export let maxCardOfSuit = (suits: Suit[]) => {
  return (prev: Card, curr: Card) => (suits.includes(curr.suit) && prev.value < curr.value ? curr : prev);
};

export let maxCardBelow = (value: number) => {
  return (prev: Card, curr: Card) => (curr.value < value && curr.value > prev.value ? curr : prev);
};

export let getSuitWithFewestCardsButNotZero = (cards: Card[]) => {
  let reducer = (prev: any, curr: Card) => {
    prev[curr.suit] += 1;
    return prev;
  };
  type helper = Partial<Record<Suit, any>>;
  let initalValue: helper = {
    [Suit.DIAMONDS]: 0,
    [Suit.CLUBS]: 0,
    [Suit.HEARTS]: 0,
    [Suit.SPADES]: 0,
  };

  let counts = cards.reduce(reducer, initalValue);
  let min = Suit.DIAMONDS;

  [Suit.CLUBS, Suit.HEARTS, Suit.SPADES].forEach((suit) => {
    if (counts[suit] > 0 && (counts[suit] < counts[min] || counts[min] === 0)) {
      min = suit;
    }
  });

  return min;
};
