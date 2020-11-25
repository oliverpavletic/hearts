import assert from 'assert';

import { MAX_NUM_PLAYERS } from './constants';

export class JoinInfo {
  private _gameCode: string;
  private _position: number;

  constructor(gameCode: string, position: number) {
    assert(position >= 0 && position <= MAX_NUM_PLAYERS);
    this._gameCode = gameCode;
    this._position = position;
  }

  get gameCode(): string {
    return this._gameCode;
  }

  get position(): number {
    return this._position;
  }

  public toJSON() {
    return { position: this._position, gameCode: this._gameCode };
  }
}
