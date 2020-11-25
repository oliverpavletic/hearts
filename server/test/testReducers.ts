import { expect } from 'chai';
import { describe } from 'mocha';

import {
  minCard,
  maxCard,
  maxCardBelow,
  maxCardOfSuit,
  getSuitWithFewestCardsButNotZero,
} from '../src/game/bot_strategies/reducers';
import { Card } from '../src/game/card';
import { Suit } from '../src/game/suits';

describe('Reducers Test', () => {
  const cards = [
    new Card(2, Suit.DIAMONDS),
    new Card(5, Suit.HEARTS),
    new Card(10, Suit.DIAMONDS),
    new Card(2, Suit.CLUBS),
    new Card(3, Suit.HEARTS),
    new Card(2, Suit.HEARTS),
    new Card(10, Suit.HEARTS),
  ];

  it('minCard reducer', () => {
    let min = cards.reduce(minCard);
    expect(min).to.have.property('_value').to.be.equal(2);
    expect(min).to.have.property('_suit').to.be.equal(Suit.HEARTS);
  });

  it('maxCard reducer', () => {
    let max = cards.reduce(maxCard);
    expect(max).to.have.property('_value').to.be.equal(10);
    expect(max).to.have.property('_suit').to.be.equal(Suit.HEARTS);
  });

  it('maxBelow reducer', () => {
    let maxBelow = cards.reduce(maxCardBelow(10));
    expect(maxBelow).to.have.property('_value').to.be.equal(5);
    expect(maxBelow).to.have.property('_suit').to.be.equal(Suit.HEARTS);
  });

  it('minCamaxOfSuitrd reducer', () => {
    let maxOfSuit = cards.reduce(maxCardOfSuit([Suit.HEARTS]));
    expect(maxOfSuit).to.have.property('_value').to.be.equal(10);
    expect(maxOfSuit).to.have.property('_suit').to.be.equal(Suit.HEARTS);
  });

  it('getSuitWithFewestCardsButNotZero reducer', () => {
    let suitWithFewest = getSuitWithFewestCardsButNotZero(cards);
    expect(suitWithFewest).to.be.equal(Suit.CLUBS);
  });
});
