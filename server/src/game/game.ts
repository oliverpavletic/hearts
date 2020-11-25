import { strict as assert } from 'assert';
const uuid = require('uuid');

import { DECK_SIZE, MAX_NUM_PLAYERS } from './constants';
import { Card } from './card';
import { Bot } from './bot';
import { ShuffledDeck } from './deck';
import { Hand } from './hand';
import { OnlinePlayer, Player } from './player';
import { Suit } from './suits';
import { Trick } from './trick';
import { PublicPlayerInfo } from './publicPlayerInfo';
import { GameState } from './gameState';
import { Scorecard } from './scorecard';
import { BotGenerator } from './botGenerator';
import { EmojiData } from 'emoji-mart';

export class Game {
  private readonly STARTING_CARD: Card = new Card(2, Suit.CLUBS);
  private players: Player[];
  private userIdToPosition: Map<string, number>;
  private trick: Trick | null;
  private playedTricksInRound: number;
  private totalTricksInRound: number;
  private hasHeartsBeenBroken: boolean;
  private hostPosition: number | null;
  private scorecard: Scorecard | null;
  private botGenerator: BotGenerator;

  constructor() {
    this.players = [];
    this.userIdToPosition = new Map<string, number>();
    this.trick = null;
    this.playedTricksInRound = 0;
    this.totalTricksInRound = Math.floor(DECK_SIZE / MAX_NUM_PLAYERS);
    this.hasHeartsBeenBroken = false;
    this.hostPosition = null;
    this.scorecard = null;
    this.botGenerator = new BotGenerator();
  }

  public addBot(isASwap: boolean = false) {
    this.throwErrorIfNoSeatsAvailable();
    const userId = uuid.v4();
    this.throwErrorIfUserIdAlreadyInUsed(userId);
    const bot = this.botGenerator.generateRandomBot(userId, this.nextAvailablePosition());
    this.addPlayer(bot, isASwap);
    this.sendUpdatedStateToOnlinePlayers();
  }

  public addOnlinePlayer(playerName: string, userId: string, socket: SocketIO.Socket): void {
    this.throwErrorIfNoSeatsAvailable();
    this.throwErrorIfUserIdAlreadyInUsed(userId);

    let position = this.nextAvailablePosition();

    this.addPlayer(new OnlinePlayer(playerName, userId, position, socket));

    if (this.numPlayers(true) === 1) {
      this.hostPosition = position;
    }
  }

  private addPlayer(player: Player, isASwap: boolean = false) {
    this.players.push(player);
    this.userIdToPosition.set(player.userId, player.position);

    if (this.numPlayers() === MAX_NUM_PLAYERS && !isASwap) {
      this.startRound();
    }
  }

  public startRound(): void {
    if (this.numPlayers() !== MAX_NUM_PLAYERS) {
      throw new Error(`Cannot start round until there are exactly ${MAX_NUM_PLAYERS} players.`);
    }

    console.log(`Starting new round.`);

    if (this.scorecard === null) {
      this.scorecard = new Scorecard(this.players);
    } else {
      this.scorecard.nextRound();
    }

    this.playedTricksInRound = 0;
    this.hasHeartsBeenBroken = false;
    this.dealCards();
    this.ifBotsTurnPlayCard();
  }

  private dealCards(): void {
    const deck = new ShuffledDeck();
    let hands = deck.generateHands();
    let hand: Hand;

    assert(this.numPlayers() === MAX_NUM_PLAYERS);
    assert(hands.length === MAX_NUM_PLAYERS);

    console.log(`Dealing cards.`);

    for (let position = 0; position < MAX_NUM_PLAYERS; position += 1) {
      hand = hands[position];
      if (hand.hasCard(this.STARTING_CARD)) {
        this.trick = new Trick(position, false);
      }
      this.players[position]!.hand = hand;
    }

    assert(this.trick !== null);
    this.sendUpdatedStateToOnlinePlayers();
  }

  public playCard(userId: string, card: Card): void {
    if (this.trick === null) {
      throw new Error('Cannot playCard until startRound has been called. trick=null');
    }

    if (this.numPlayers() !== MAX_NUM_PLAYERS) {
      // Possible that a player just left as a card was played, so we update the table and return
      this.sendUpdatedStateToOnlinePlayers();
      return;
    }

    let player = this.playerWithUserId(userId);

    if (!this.verifyCardPlayedHasValidSuit(player, card)) {
      throw new Error(`A ${card.toString()} was played but does not have a valid suit.`);
    }

    this.transferCardFromHandToTrick(player, card);

    if (card.suit === Suit.HEARTS) {
      this.hasHeartsBeenBroken = true;
    }

    console.log(`${player.name} played a ${card.toString()}.`);
    console.log(this.getGameState(userId));

    if (this.trick.isComplete()) {
      this.sendUpdatedStateToOnlinePlayers(true);
      setTimeout(() => {
        assert(this.trick !== null);
        assert(this.scorecard !== null);

        let [winnerScore, winnerPosition] = this.trick.computeWinnerScoreAndPosition();

        this.players[winnerPosition]!.addToScore(winnerScore);
        this.scorecard.addToCurrentRound(winnerPosition, winnerScore);
        this.trick = new Trick(winnerPosition, this.hasHeartsBeenBroken);
        this.playedTricksInRound += 1;

        console.log(`Trick complete. ${this.players[winnerPosition]!.name} got ${winnerScore} points.`);
        this.sendUpdatedStateToOnlinePlayers();

        if (this.isRoundComplete()) {
          console.log(`Round complete.`);

          this.handleShootingTheMoon();
          this.players.forEach((player) => player!.endRound());
          this.startRound();

          return;
        }

        this.ifBotsTurnPlayCard();
      }, 750);

      return;
    }

    this.sendUpdatedStateToOnlinePlayers();
    this.ifBotsTurnPlayCard();
  }

  public setEmoji(userId: string, emoji: string) {
    let player = this.playerWithUserId(userId);

    player.setEmoji(emoji);

    this.sendUpdatedStateToOnlinePlayers();
  }

  public getUserIdOfPlayerWithAction(): string {
    if (this.trick === null) {
      throw new Error(`Cannot call getUserIdOfPlayerWithAction() until round has started! trick==null`);
    }

    return this.players[this.trick.turnPosition]!.userId;
  }

  public getPlayerPosition(userId: string): number {
    return this.playerWithUserId(userId).position;
  }

  public getGameState(userId: string): GameState {
    let player = this.playerWithUserId(userId);

    return {
      boardCards: this.trick === null ? new Array(MAX_NUM_PLAYERS).fill(null) : this.trick.getCardsJSON(),
      handJSONCards: player.hand.JSONCards(),
      turnPosition: this.numPlayers() !== MAX_NUM_PLAYERS || this.trick === null ? null : this.trick.turnPosition,
      validSuits: this.trick === null ? [] : this.trick.validSuits,
      playersInfo: this.getPublicPlayersInfo(),
      showGameCode: this.numPlayers() !== MAX_NUM_PLAYERS,
      isHost: this.hostPosition === player.position,
      scorecardData: this.scorecard === null ? null : this.scorecard.getData(),
    };
  }

  public updateSocketForPlayer(userId: string, socket: SocketIO.Socket | null) {
    if (!this.userIdToPosition.has(userId)) {
      throw new Error(`Cannot updateSocketForPlayer that is not in the game. \nuserId=${userId}`);
    }

    let player = this.playerWithUserId(userId);
    if (!(player instanceof OnlinePlayer)) {
      throw new Error('Cannot updateSocketForPlayer that is not an OnlinePlayer');
    }

    (player as OnlinePlayer).updateSocket(socket);

    this.sendUpdatedStateToOnlinePlayers();
  }

  public removePlayer(userId: string) {
    if (!this.userIdToPosition.has(userId)) {
      throw new Error(`Cannot removePlayer that is not in the game. \nuserId=${userId}`);
    }

    let position: number = this.userIdToPosition.get(userId)!;
    let bot: Bot = this.players[position].toBot(this.botGenerator);
    this.players[position] = bot;

    if (this.scorecard !== null) {
      this.scorecard.updateHeader(this.players);
    }

    this.sendUpdatedStateToOnlinePlayers();
  }

  private sendUpdatedStateToOnlinePlayers(withNullTurnPosition: boolean = false) {
    this.players.forEach((player) => {
      if (player instanceof OnlinePlayer && player.isConnected()) {
        let gameState = this.getGameState(player.userId);
        if (withNullTurnPosition) {
          gameState['turnPosition'] = null;
        }
        (player as OnlinePlayer).sendUpdatedState(gameState);
        console.log(`Sent updated game state to ${player.name}`);
      }
    });
  }

  private ifBotsTurnPlayCard(): void {
    assert(this.trick !== null);
    let player = this.players[this.trick.turnPosition];
    if (player instanceof Bot) {
      let card = player.choseCard(this.trick.validSuits, this.trick.getCards());
      setTimeout(() => {
        this.playCard(player!.userId, card);
      }, 750);
    }
  }

  private getPublicPlayersInfo(): PublicPlayerInfo[] {
    let info: PublicPlayerInfo[] = new Array(MAX_NUM_PLAYERS).fill(null);

    for (let position = 0; position < this.players.length; position += 1) {
      if (this.players[position] === null) {
        continue;
      }
      info[position] = this.players[position]!.getPublicPlayerInfo();
    }

    return info;
  }

  private handleShootingTheMoon() {
    assert(this.scorecard !== null);
    let shotTheMoon = this.players.findIndex((player) => player.score.roundScore === 26);

    if (shotTheMoon >= 0) {
      for (let position = 0; position < this.players.length; position += 1) {
        if (position === shotTheMoon) {
          this.players[position].removeFromScore(26);
          this.scorecard.removeFromCurrentRound(position, 26);
        } else {
          this.players[position].addToScore(26);
          this.scorecard.addToCurrentRound(position, 26);
        }
      }
    }
  }

  private throwErrorIfNoSeatsAvailable(): void {
    if (this.numPlayers() === MAX_NUM_PLAYERS) {
      throw new Error(`Cannot add new player. Party is full with ${MAX_NUM_PLAYERS} players.`);
    }
  }

  private throwErrorIfUserIdAlreadyInUsed(userId: string): void {
    if (this.userIdToPosition.has(userId)) {
      throw new Error(`Cannot add new player. UserId already in party. \nuserId=${userId}`);
    }
  }

  private playerWithUserId(userId: string): Player {
    if (!this.userIdToPosition.has(userId)) {
      throw new Error(`Cannot access user that is not in the game. \nuserId=${userId}`);
    }

    let playerPosition = this.userIdToPosition.get(userId)!;
    let player = this.players[playerPosition];
    assert(player !== null);

    return player;
  }

  private verifyCardPlayedHasValidSuit(player: Player, card: Card): boolean {
    if (this.trick === null) {
      throw new Error('Cannot verifyCardPlayedHasValidSuit until startRound has been called. trick=null');
    }

    if (this.trick.isValidSuit(card.suit)) {
      return true;
    }

    if (!player.hasSuitsInHand(this.trick.validSuits)) {
      return true;
    }

    return false;
  }

  private transferCardFromHandToTrick(player: Player, cardToTransfer: Card): void {
    let cardTaken = player.takeCard(cardToTransfer);

    assert(Card.equals(cardTaken, cardToTransfer));
    assert(this.trick !== null);
    this.trick.addCard(cardTaken);
  }

  private isRoundComplete(): boolean {
    return this.playedTricksInRound === this.totalTricksInRound;
  }

  private numPlayers(onlineOnly: boolean = false): number {
    let n = 0;

    this.players.forEach((player) => {
      if (player !== null && (!onlineOnly || player instanceof OnlinePlayer)) {
        n += 1;
      }
    });

    return n;
  }

  private nextAvailablePosition(): number {
    this.throwErrorIfNoSeatsAvailable();

    for (let position = 0; position < this.players.length; position += 1) {
      if (this.players[position] === null) {
        return position;
      }
    }

    if (this.players.length < MAX_NUM_PLAYERS) {
      return this.players.length;
    }

    throw new Error(
      'Invalid state reached in nextAvailablePosition. There are available seats but no position was found!'
    );
  }
}
