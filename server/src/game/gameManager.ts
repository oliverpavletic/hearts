import { strict as assert } from 'assert'

import { Game } from './game'
import { GameState } from './gameState'
import { GameCodeGenerator } from './gameCodeGenerator'
import { JoinInfo } from './joinInfo'
import { JSONCard } from './jsonCard'
import { Card } from './card'
import { Socket } from 'socket.io'

export class GameManager {
  private readonly games: Map<string, Game>
  private readonly userIdToGameCode: Map<string, string>
  private readonly gameCodeGenerator: GameCodeGenerator

  constructor () {
    this.games = new Map<string, Game>()
    this.userIdToGameCode = new Map<string, string>()
    this.gameCodeGenerator = new GameCodeGenerator(3, 3)
  }

  public createGame (
    playerName: string,
    userId: string,
    socket: SocketIO.Socket
  ): JoinInfo {
    const gameCode = this.gameCodeGenerator.nextGameCode()
    const game = new Game()

    assert(!this.games.has(gameCode))

    game.addOnlinePlayer(playerName, userId, socket)
    const position = game.getPlayerPosition(userId)
    this.userIdToGameCode.set(userId, gameCode)
    this.games.set(gameCode, game)

    return new JoinInfo(gameCode, position)
  }

  public joinGame (gameCode: string, playerName: string, userId: string, socket: Socket): JoinInfo {
    if (!this.games.has(gameCode)) {
      throw new Error(`There is no game with gameCode=${gameCode}`)
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const game = this.games.get(gameCode)!

    this.userIdToGameCode.set(userId, gameCode)

    game.addOnlinePlayer(playerName, userId, socket)

    const position = game.getPlayerPosition(userId)

    return new JoinInfo(gameCode, position)
  }

  public getJoinInfoForUserId (
    userId: string
  ): JoinInfo | Record<string, never> {
    if (!this.hasGameForUserId(userId)) {
      return {}
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const gameCode = this.userIdToGameCode.get(userId)!
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const game = this.games.get(gameCode)!
    const position = game.getPlayerPosition(userId)

    return new JoinInfo(gameCode, position)
  }

  public addBot (userId: string): void {
    const game = this.getGameFromUserId(userId)
    game.addBot()
  }

  public playCard (userId: string, card: JSONCard): void {
    const game = this.getGameFromUserId(userId)
    game.playCard(userId, new Card(card.value, card.suit))
  }

  public setEmoji (userId: string, emoji: string): void {
    const game = this.getGameFromUserId(userId)
    game.setEmoji(userId, emoji)
  }

  public getGameState (userId: string): GameState | Record<string, never> {
    if (!this.hasGameForUserId(userId)) {
      return {}
    }

    const game = this.getGameFromUserId(userId)
    return game.getGameState(userId)
  }

  public hasGameForUserId (userId: string): boolean {
    if (this.userIdToGameCode.has(userId)) {
      const gameCode = this.userIdToGameCode.get(userId)
      assert(gameCode)
      assert(this.games.has(gameCode))
      return true
    }

    return false
  }

  public updateSocketForPlayer (userId: string, socket: SocketIO.Socket): void {
    if (!this.hasGameForUserId(userId)) {
      throw new Error('Cannot updateSocketForPlayer with no game for userId')
    }

    const game = this.getGameFromUserId(userId)
    game.updateSocketForPlayer(userId, socket)
  }

  public removeSocketForPlayer (userId: string): void {
    if (!this.hasGameForUserId(userId)) {
      throw new Error('Cannot updateSocketForPlayer with no game for userId')
    }

    const game = this.getGameFromUserId(userId)
    game.updateSocketForPlayer(userId, null)
  }

  public removePlayer (userId: string): void {
    if (!this.hasGameForUserId(userId)) {
      throw new Error('Cannot updateSocketForPlayer with no game for userId')
    }

    const game = this.getGameFromUserId(userId)
    game.removePlayer(userId)

    this.userIdToGameCode.delete(userId)
    assert(!this.hasGameForUserId(userId))
  }

  private getGameFromUserId (userId: string): Game {
    if (!this.userIdToGameCode.has(userId)) {
      throw new Error(`There is no game associated with userId=${userId}`)
    }

    const gameCode = this.userIdToGameCode.get(userId)
    assert(gameCode)
    assert(
      this.games.has(gameCode),
      `There should be a game for every userId in userIdToGameCode but not found for userId=${userId}`
    )

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.games.get(gameCode)!
  }
}
