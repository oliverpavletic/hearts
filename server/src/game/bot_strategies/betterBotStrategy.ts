import { strict as assert } from 'assert';

import { Card } from '../card';
import { Hand } from '../hand';
import { Suit } from '../suits';
import { BotStrategy } from './botStrategy';
import { getRandomInt } from '../rand';
import { QUEEN } from '../constants';
import { minCard, maxCard, maxCardBelow, maxCardOfSuit, getSuitWithFewestCardsButNotZero } from './reducers';

export class BetterBotStrategy implements BotStrategy {
  public chooseCard(hand: Hand, validSuits: Suit[], trickCards: readonly Card[]): Card {
    if (hand.size() == 0) {
      throw new Error(`Cannot chooseAnyValidCard from an empty hand!`);
    }

    let cards = hand.deepCopyOfCards();
    assert(cards.length == hand.size());

    let validCards = cards.filter((card) => validSuits.some((suit) => suit == card.suit));

    if (validCards.length > 0) {
      if (trickCards.length === 3) {
        let maxCard = trickCards.reduce(maxCardOfSuit(validSuits));
        return validCards.reduce(maxCardBelow(maxCard.value));
      }

      return validCards.reduce(minCard);
    }

    let dalhia = cards.find((card) => card.suit == Suit.SPADES && card.value == QUEEN);

    if (typeof dalhia !== 'undefined') {
      return dalhia;
    }

    let suitWithFewestCards = getSuitWithFewestCardsButNotZero(cards);
    let ofSuitWithFewestCard = cards.filter((card) => card.suit === suitWithFewestCards);

    if (ofSuitWithFewestCard.length < 4) {
      return ofSuitWithFewestCard.reduce(maxCard);
    }

    let hearts = cards.filter((card) => card.suit === Suit.HEARTS);

    if (hearts.length > 0) {
      return hearts.reduce(maxCard);
    }

    return cards[getRandomInt(cards.length)];
  }
}
