import { strict as assert } from 'assert';

import { Game } from './game';
import { GameState } from './gameState';
import { GameCodeGenerator } from './gameCodeGenerator';
import { JoinInfo } from './joinInfo';
import { JSONCard } from './jsonCard';
import { Card } from './card';
import { EmojiData } from 'emoji-mart';

export class GameManager {
  private games: Map<string, Game>;
  private userIdToGameCode: Map<string, string>;
  private gameCodeGenerator: GameCodeGenerator;

  constructor() {
    this.games = new Map<string, Game>();
    this.userIdToGameCode = new Map<string, string>();
    this.gameCodeGenerator = new GameCodeGenerator(3, 3);
  }

  public createGame(playerName: string, userId: string, socket: SocketIO.Socket): JoinInfo {
    let gameCode = this.gameCodeGenerator.nextGameCode();
    let game = new Game();
    let position: number;

    assert(!this.games.has(gameCode));

    game.addOnlinePlayer(playerName, userId, socket);
    position = game.getPlayerPosition(userId);
    this.userIdToGameCode.set(userId, gameCode);
    this.games.set(gameCode, game);

    return new JoinInfo(gameCode, position);
  }

  public joinGame(playerName: string, gameCode: string, userId: string, socket: SocketIO.Socket): JoinInfo {
    if (!this.games.has(gameCode)) {
      throw new Error(`There is no game with gameCode=${gameCode}`);
    }

    let game = this.games.get(gameCode);

    this.userIdToGameCode.set(userId, gameCode);

    let position = game!.getPlayerPosition(userId);

    return new JoinInfo(gameCode, position);
  }

  public getJoinInfoForUserId(userId: string) {
    if (!this.hasGameForUserId(userId)) {
      return {};
    }

    let gameCode = this.userIdToGameCode.get(userId)!;
    let game = this.games.get(gameCode);
    let position = game!.getPlayerPosition(userId);

    return new JoinInfo(gameCode, position);
  }

  public addBot(userId: string) {
    let game = this.getGameFromUserId(userId);

    game.addBot();
  }

  public playCard(userId: string, card: JSONCard): void {
    let game = this.getGameFromUserId(userId);
    game.playCard(userId, new Card(card.value, card.suit));
  }

  public setEmoji(userId: string, emoji: string) {
    let game = this.getGameFromUserId(userId);
    game.setEmoji(userId, emoji);
  }

  public getGameState(userId: string): GameState | {} {
    if (!this.hasGameForUserId(userId)) {
      return {};
    }

    let game = this.getGameFromUserId(userId);
    return game.getGameState(userId);
  }

  public hasGameForUserId(userId: string) {
    if (this.userIdToGameCode.has(userId)) {
      assert(this.games.has(this.userIdToGameCode.get(userId)!));
      return true;
    }

    return false;
  }

  public updateSocketForPlayer(userId: string, socket: SocketIO.Socket) {
    if (!this.hasGameForUserId(userId)) {
      throw new Error('Cannot updateSocketForPlayer with no game for userId');
    }

    let game = this.getGameFromUserId(userId);
    game.updateSocketForPlayer(userId, socket);
  }

  public removeSocketForPlayer(userId: string) {
    if (!this.hasGameForUserId(userId)) {
      throw new Error('Cannot updateSocketForPlayer with no game for userId');
    }

    let game = this.getGameFromUserId(userId);
    game.updateSocketForPlayer(userId, null);
  }

  public removePlayer(userId: string) {
    if (!this.hasGameForUserId(userId)) {
      throw new Error('Cannot updateSocketForPlayer with no game for userId');
    }

    let game = this.getGameFromUserId(userId);
    game.removePlayer(userId);

    this.userIdToGameCode.delete(userId);
    assert(!this.hasGameForUserId(userId));
  }

  private getGameFromUserId(userId: string): Game {
    if (!this.userIdToGameCode.has(userId)) {
      throw new Error(`There is no game associated with userId=${userId}`);
    }

    let gameCode = this.userIdToGameCode.get(userId);
    assert(
      this.games.has(gameCode!),
      `There should be a game for every userId in userIdToGameCode but not found for userId=${userId}`
    );

    return this.games.get(gameCode!)!;
  }
}
