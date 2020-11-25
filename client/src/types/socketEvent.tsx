export enum SocketEvent {
  CLIENT_PLAY_CARD = "CLIENT_PLAY_CARD",
  CLIENT_JOIN_GAME = "CLIENT_JOIN_GAME",
  CLIENT_CREATE_GAME = "CLIENT_CREATE_GAME",
  CLIENT_LEAVE_GAME = "CLIENT_LEAVE_GAME",
  CLIENT_ADD_BOT = "CLIENT_ADD_BOT",
  CLIENT_SELECT_EMOJI = "CLIENT_SELECT_EMOJI",
  CLIENT_LOG_ERROR = "CLIENT_LOG_ERROR",
  SERVER_INVALID_GAME_CODE = "SERVER_INVALID_GAME_CODE",
  SERVER_SENT_JOIN_INFO = "SERVER_SENT_JOIN_INFO",
  SERVER_UPDATED_GAME_STATE = "SERVER_UPDATED_GAME_STATE",
  SERVER_RELOAD_CONNECTION = "SERVER_RELOAD_CONNECTION",
  SERVER_ERROR = "SERVER_ERROR",
}
