import express from 'express'
import http from 'http'
import socket_io from 'socket.io'
import cookie from 'cookie'
import cookieParser from 'cookie-parser'

import { GameManager } from './game/gameManager'
import { SocketEvent } from './socketEvent'
import { JSONCard } from './game/jsonCard'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const uuid = require('uuid')
const app = express()
const server = new http.Server(app)
const io = socket_io(server, { cookie: false })
const PORT = 4000
const secret = 'applesNoranges'
const cookieOptions: express.CookieOptions = {
  maxAge: 1000 * 60 * 15, // 15 minutes
  httpOnly: true,
  signed: true
}

const gameManager = new GameManager()

// ****************************************
// *********** Express Routes  ************
// ****************************************

app.use(express.json())
app.use(cookieParser(secret))

const logRequest = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  console.log(`${req.method} ${req.originalUrl}`)
  next()
}

app.use(logRequest)

app.get('/connect', (req: express.Request, res: express.Response) => {
  let joinInfo = {}
  if (typeof req.signedCookies !== 'undefined' && 'userId' in req.signedCookies) {
    const userId = req.signedCookies.userId
    joinInfo = gameManager.getJoinInfoForUserId(userId)
  } else {
    if (typeof req.signedCookies === 'undefined') {
      req.signedCookies = {}
    } else {
      console.log(req.signedCookies)
    }
    const value = uuid.v4()
    req.signedCookies.userId = value
    res.cookie('userId', value, cookieOptions)
    console.log('Gave cookie userId: ', value)
  }
  res.json(joinInfo)
})

app.get('/gameState', (req: express.Request, res: express.Response) => {
  const userId = req.signedCookies.userId
  const gameState = gameManager.getGameState(userId)

  res.json(gameState)
})

io.on('connection', (socket: SocketIO.Socket) => {
  let userId: string
  const rawCookie = socket.handshake.headers.cookie

  const cookieStr = cookieParser.signedCookie(rawCookie, secret)
  if (cookieStr === false) {
    socket.emit(SocketEvent.SERVER_RELOAD_CONNECTION, {})
    return
  }
  userId = cookie.parse(cookieStr).userId
  userId = userId.split(':')[1]
  userId = userId.split('.')[0]

  console.log('connection: ', userId)

  if (gameManager.hasGameForUserId(userId)) {
    gameManager.updateSocketForPlayer(userId, socket)
  }

  socket.on(SocketEvent.CLIENT_CREATE_GAME, (payload: { playerName: string }) => {
    try {
      console.log('CLIENT_CREATE_GAME', payload)
      const playerName = payload.playerName
      const joinInfo = gameManager.createGame(playerName, userId, socket).toJSON()

      socket.emit(SocketEvent.SERVER_SENT_JOIN_INFO, joinInfo)
    } catch (e) {
      console.log('Error:', e)
      socket.emit(SocketEvent.SERVER_ERROR, {})
    }
  })

  socket.on(SocketEvent.CLIENT_JOIN_GAME, (payload: { gameCode: string, playerName: string }) => {
    const playerName = payload.playerName
    const gameCode = payload.gameCode
    try {
      console.log('CLIENT_JOIN_GAME', payload)
      const joinInfo = gameManager.joinGame(playerName, gameCode).toJSON()
      socket.emit(SocketEvent.SERVER_SENT_JOIN_INFO, joinInfo)
    } catch (e) {
      console.log('Error:', e)
      socket.emit(SocketEvent.SERVER_INVALID_GAME_CODE, {})
    }
  })

  socket.on(SocketEvent.CLIENT_ADD_BOT, () => {
    try {
      console.log('CLIENT_ADD_BOT')
      gameManager.addBot(userId)
    } catch (e) {
      console.log('Error:', e)
      socket.emit(SocketEvent.SERVER_ERROR, {})
    }
  })

  socket.on(SocketEvent.CLIENT_SELECT_EMOJI, (payload: { emoji: string }) => {
    try {
      console.log('CLIENT_SELECT_EMOJI', payload)
      gameManager.setEmoji(userId, payload.emoji)
    } catch (e) {
      console.log('Error:', e)
      socket.emit(SocketEvent.SERVER_ERROR, {})
    }
  })

  socket.on(SocketEvent.CLIENT_PLAY_CARD, (payload: { card: JSONCard }) => {
    try {
      console.log('CLIENT_PLAY_CARD', payload)
      gameManager.playCard(userId, payload.card)
    } catch (e) {
      console.log('Error:', e)
      socket.emit(SocketEvent.SERVER_ERROR, {})
    }
  })

  socket.on(SocketEvent.CLIENT_LEAVE_GAME, () => {
    try {
      console.log('CLIENT_LEAVE_GAME')
      gameManager.removePlayer(userId)
    } catch (e) {
      console.log('Error:', e)
      socket.emit(SocketEvent.SERVER_ERROR, {})
    }
  })

  socket.on('disconnect', () => {
    console.log(`DISCONNECTED: ${userId}`)
    if (gameManager.hasGameForUserId(userId)) {
      gameManager.removeSocketForPlayer(userId)
    }
  })
})

server.listen(PORT, () => {
  console.log(`Listening on ${PORT}`)
})
