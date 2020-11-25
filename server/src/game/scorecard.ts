import { Player } from './player';

type Header = {
  playerNames: string[];
};

type Round = {
  roundNum: number;
  scores: number[];
};

export type ScorecardData = {
  header: Header;
  rounds: Round[];
  totals: number[];
};

export class Scorecard {
  private header: Header;
  private rounds: Round[];
  private totals: number[];

  constructor(players: (Player | null)[]) {
    const names = this.namesFromPlayers(players);
    this.header = {
      playerNames: names,
    };
    this.rounds = [{ roundNum: 1, scores: new Array(players.length).fill(0) }];
    this.totals = new Array(players.length).fill(0);
  }

  public addToCurrentRound(position: number, score: number) {
    this.rounds[this.rounds.length - 1].scores[position] += score;
    this.totals[position] += score;
  }

  public removeFromCurrentRound(position: number, score: number) {
    this.rounds[this.rounds.length - 1].scores[position] -= score;
    this.totals[position] -= score;
  }

  public nextRound() {
    const roundNum = this.rounds.length + 1;
    const numPlayers = this.rounds[roundNum - 2].scores.length;
    this.rounds.push({ roundNum: roundNum, scores: new Array(numPlayers).fill(0) });
  }

  public getData(): ScorecardData {
    return {
      header: this.header,
      rounds: this.rounds,
      totals: this.totals,
    };
  }

  public updateHeader(players: (Player | null)[]) {
    const names = this.namesFromPlayers(players);
    this.header.playerNames = names;
  }

  private namesFromPlayers(players: (Player | null)[]) {
    let names = players.map((player) => {
      if (player === null) {
        throw new Error('Cannot pass null players to Scorecard!');
      }
      return player.name;
    });

    return names;
  }
}
