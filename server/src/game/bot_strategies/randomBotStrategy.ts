import { strict as assert } from 'assert';

import { Card } from '../card';
import { Hand } from '../hand';
import { Suit } from '../suits';
import { BotStrategy } from './botStrategy';
import { getRandomInt } from '../rand';

export class RandomBotStrategy implements BotStrategy {
  public chooseCard(hand: Hand, validSuits: Suit[], _: readonly Card[]): Card {
    if (hand.size() == 0) {
      throw new Error(`Cannot chooseAnyValidCard from an empty hand!`);
    }

    let cards = hand.deepCopyOfCards();
    assert(cards.length == hand.size());

    let validCards = cards.filter((card) => validSuits.some((suit) => suit == card.suit));

    if (validCards.length == 0) {
      validCards = cards;
    }

    return validCards[getRandomInt(validCards.length)];
  }
}
