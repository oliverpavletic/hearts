import { strict as assert } from 'assert'

import { Card } from './card'
import { Hand } from './hand'
import { PublicPlayerInfo } from './publicPlayerInfo'
import { Score } from './score'
import { Suit } from './suits'
import { GameState } from './gameState'
import { SocketEvent } from '../socketEvent'
import { Bot } from './bot'
import { BotGenerator } from './botGenerator'

export abstract class Player {
  private readonly _name: string
  private readonly _userId: string
  private readonly _position: number
  private _score: Score
  protected emoji: string
  protected _hand: Hand

  constructor (name: string, userId: string, position: number) {
    this._name = name
    this._userId = userId
    this._position = position
    this._score = new Score(0, 0)
    this.emoji = '😃'
    this._hand = new Hand([])
  }

  set hand (hand: Hand) {
    this._hand = hand
  }

  get hand (): Hand {
    return this._hand
  }

  set score (score: Score) {
    this._score = score
  }

  get score (): Score {
    return this._score
  }

  get name (): string {
    return this._name
  }

  get userId (): string {
    return this._userId
  }

  get position (): number {
    return this._position
  }

  public takeCard (card: Card): Card {
    return this._hand.takeCard(card)
  }

  public hasSuitsInHand (suits: Suit[]): boolean {
    return this._hand.hasSuits(suits)
  }

  public addToScore (value: number): void {
    this._score.roundScore += value
    this._score.totalScore += value
  }

  public removeFromScore (value: number): void {
    this._score.roundScore -= value
    this._score.totalScore -= value
  }

  public endRound (): void {
    assert(this._hand.size() === 0)
    this._score.roundScore = 0
  }

  public setEmoji (emoji: string): void {
    this.emoji = emoji
  }

  abstract isConnected (): boolean

  abstract toBot (botGenerator: BotGenerator): Bot

  public getPublicPlayerInfo (): PublicPlayerInfo {
    return {
      name: this._name,
      emoji: this.emoji,
      roundScore: this._score.roundScore,
      totalScore: this._score.totalScore,
      isConnected: this.isConnected()
    }
  }
}

export class OnlinePlayer extends Player {
  private socket: SocketIO.Socket | null

  constructor (
    name: string,
    userId: string,
    position: number,
    socket: SocketIO.Socket
  ) {
    super(name, userId, position)
    this.socket = socket
  }

  public sendUpdatedState (gameState: GameState): void {
    if (this.socket === null) {
      throw new Error('Cannot sendUpdatedState with a null socket.')
    }
    this.socket.emit(SocketEvent.SERVER_UPDATED_GAME_STATE, gameState)
  }

  public updateSocket (socket: SocketIO.Socket | null): void {
    this.socket = socket
  }

  public isConnected (): boolean {
    return this.socket !== null
  }

  public toBot (botGenerator: BotGenerator): Bot {
    const bot = botGenerator.generateRandomBot(this.userId, this.position)

    bot.hand = this.hand
    bot.score = this.score

    return bot
  }
}
