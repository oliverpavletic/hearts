import { Card } from './card';
import { JSONCard } from './jsonCard';
import { Suit } from './suits';

export class Hand {
  private cards: Card[];

  constructor(cards: Card[]) {
    this.cards = cards;
    this.cards.sort(Card.compareCards);
  }

  public deepCopyOfCards(): Card[] {
    let copy: Card[] = [];

    this.cards.forEach((card) => {
      copy.push(new Card(card.value, card.suit));
    });

    return copy;
  }

  public JSONCards(): JSONCard[] {
    let cards: JSONCard[] = [];

    this.cards.forEach((card) => cards.push({ suit: card.suit, value: card.value }));

    return cards;
  }

  public size() {
    return this.cards.length;
  }

  public hasCard(cardToMatch: Card): boolean {
    return this.cards.some((card) => Card.equals(card, cardToMatch));
  }

  public takeCard(cardToTake: Card): Card {
    let index: number = this.cards.findIndex((card) => Card.equals(card, cardToTake));

    if (index < 0) {
      throw Error(`Tried to take the ${cardToTake} but it didn't exist in the hand.`);
    }

    return this.cards.splice(index, 1)[0];
  }

  public hasSuits(suits: Suit[]): boolean {
    return this.cards.some((card) => suits.some((suit) => suit == card.suit));
  }
}
