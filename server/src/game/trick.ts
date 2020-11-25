import { strict as assert } from 'assert';

import { Card } from './card';
import { MAX_NUM_PLAYERS, QUEEN } from './constants';
import { JSONCard } from './jsonCard';
import { mod } from './mod';
import { Suit } from './suits';

export class Trick {
  private _cards: Card[];
  private _validSuits: Suit[];
  private _turnPosition: number;

  constructor(turnPosition: number, isHeartsValid: boolean) {
    this._turnPosition = turnPosition;
    this._validSuits = [Suit.CLUBS, Suit.DIAMONDS, Suit.SPADES].concat(isHeartsValid ? [Suit.HEARTS] : []);
    this._cards = [];
  }

  get turnPosition(): number {
    return this._turnPosition;
  }

  public addCard(card: Card) {
    this._cards.push(card);

    if (this.size() == 1) {
      this._validSuits = [card.suit];
    }

    this._turnPosition = (this._turnPosition + 1) % MAX_NUM_PLAYERS;
  }
  
  public getCards(): readonly Card[] {
    return this._cards;
  }

  public getCardsJSON(): (JSONCard | null)[] {
    let cards: JSONCard[] = new Array(MAX_NUM_PLAYERS).fill(null);

    for (let trickPosition = 0; trickPosition < this._cards.length; trickPosition += 1) {
      // Return in order of actual position, not trickPosition
      let card = this._cards[trickPosition];
      cards[this.actualPositionFromTrickPosition(trickPosition)] = { suit: card.suit, value: card.value };
    }

    return cards;
  }

  public computeWinnerScoreAndPosition(): [number, number] {
    if (!this.isComplete()) {
      throw new Error(`Cannot call computeWinnerScoreAndPosition on incomplete trick. Only ${this.size} cards played.`);
    }

    let winnerScore = 0;
    let winnerTrickPosition = null;
    let winnerCard: Card | null = null;
    let card: Card;

    for (let trickPosition = 0; trickPosition < MAX_NUM_PLAYERS; trickPosition += 1) {
      card = this._cards[trickPosition];

      if (winnerCard == null || (card.suit == winnerCard.suit && card.value > winnerCard.value)) {
        winnerCard = card;
        winnerTrickPosition = trickPosition;
      }

      winnerScore += card.suit == Suit.HEARTS ? 1 : 0;
      winnerScore += card.suit == Suit.SPADES && card.value == QUEEN ? 13 : 0;
    }

    assert(winnerTrickPosition !== null, 'computeWinnerScoreAndPosition did not find a winner...');
    let winnerActualPosition = this.actualPositionFromTrickPosition(winnerTrickPosition);

    return [winnerScore, winnerActualPosition];
  }

  get validSuits(): Suit[] {
    return this._validSuits;
  }

  public isValidSuit(suit: Suit): boolean {
    return this._validSuits.indexOf(suit) >= 0;
  }

  public isEmpty(): boolean {
    return this.size() == 0;
  }

  public isComplete(): boolean {
    return this.size() == MAX_NUM_PLAYERS;
  }

  public nextCardTrickPosition() {
    return this.size();
  }

  private size(): number {
    return this._cards.length;
  }

  private actualPositionFromTrickPosition(trickPosition: number) {
    assert(trickPosition >= 0 && trickPosition <= MAX_NUM_PLAYERS);

    let translationAmt = this.size() - trickPosition;
    let actualPosition = mod(this.turnPosition - translationAmt, MAX_NUM_PLAYERS);

    assert(actualPosition >= 0 && actualPosition <= MAX_NUM_PLAYERS);

    return actualPosition;
  }
}
