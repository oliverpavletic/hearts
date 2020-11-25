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
