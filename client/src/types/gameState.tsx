import { JSONCard } from "./jsonCard";
import { PlayerInfo } from "./playerInfo";
import { ScorecardData } from "./scorecardData";
import { Suit } from "./suit";

export interface ServerGameState {
  boardCards: JSONCard[];
  handJSONCards: JSONCard[];
  turnPosition: number | null;
  validSuits: Suit[];
  playersInfo: PlayerInfo[] | null;
  showGameCode: boolean;
  isHost: boolean;
  scorecardData: ScorecardData | null;
}
