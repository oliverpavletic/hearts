import { JSONCard } from './jsonCard'
import { PublicPlayerInfo } from './publicPlayerInfo'
import { ScorecardData } from './scorecard'
import { Suit } from './suits'

export interface GameState {
  boardCards: Array<JSONCard | null>
  handJSONCards: JSONCard[]
  turnPosition: number | null
  validSuits: Suit[]
  playersInfo: PublicPlayerInfo[] | null
  showGameCode: boolean
  isHost: boolean
  scorecardData: ScorecardData | null
}
