import express from 'express';
import http from 'http';
import socket_io from 'socket.io';
import cookie from 'cookie';
import cookieParser from 'cookie-parser';
const uuid = require('uuid');

import { GameManager } from './game/gameManager';
import { SocketEvent } from './socketEvent';
import { EmojiData } from 'emoji-mart';

const app = express();
const server = new http.Server(app);
const io = socket_io(server, { cookie: false });
const PORT = 4000;
const secret = 'applesNoranges';
const cookieOptions: express.CookieOptions = {
  maxAge: 1000 * 60 * 15, // 15 minutes
  httpOnly: true,
  signed: true,
};

const gameManager = new GameManager();

// ****************************************
// *********** Express Routes  ************
// ****************************************

app.use(express.json());
app.use(cookieParser(secret));

let logRequest = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
};

app.use(logRequest);

app.get('/connect', (req: express.Request, res: express.Response) => {
  let joinInfo = {};
  if (typeof req.signedCookies !== 'undefined' && 'userId' in req.signedCookies) {
    let userId = req.signedCookies['userId'];
    joinInfo = gameManager.getJoinInfoForUserId(userId);
  } else {
    if (typeof req.signedCookies === 'undefined') {
      req.signedCookies = {};
    } else {
      console.log(req.signedCookies);
    }
    let value = uuid.v4();
    req.signedCookies['userId'] = value;
    res.cookie('userId', value, cookieOptions);
    console.log(`Gave cookie userId=${value}`);
  }
  res.json(joinInfo);
});

app.get('/gameState', (req: express.Request, res: express.Response) => {
  let userId = req.signedCookies['userId'];
  let gameState = gameManager.getGameState(userId);

  res.json(gameState);
});

io.on('connection', (socket: SocketIO.Socket) => {
  let userId: string;
  let cookieStr: string | false;
  const rawCookie = socket.handshake.headers.cookie;

  cookieStr = cookieParser.signedCookie(rawCookie, secret);
  if (!cookieStr) {
    throw new Error('No cookie!');
  }
  userId = cookie.parse(cookieStr).userId;
  userId = userId.split(':')[1];
  userId = userId.split('.')[0];

  console.log(`CONNECTED: ${userId}`);

  if (gameManager.hasGameForUserId(userId)) {
    gameManager.updateSocketForPlayer(userId, socket);
  }

  socket.on(SocketEvent.CLIENT_CREATE_GAME, (body: { playerName: string }) => {
    let playerName = body.playerName;
    let joinInfo = gameManager.createGame(playerName, userId, socket).toJSON();

    socket.emit(SocketEvent.SERVER_SENT_JOIN_INFO, joinInfo);
  });

  socket.on(SocketEvent.CLIENT_JOIN_GAME, (body: { gameCode: string; playerName: string }) => {
    let playerName = body.playerName;
    let gameCode = body.gameCode;
    try {
      let joinInfo = gameManager.joinGame(playerName, gameCode, userId, socket).toJSON();
      socket.emit(SocketEvent.SERVER_SENT_JOIN_INFO, joinInfo);
    } catch (e) {
      console.log(e);
      socket.emit(SocketEvent.SERVER_INVALID_GAME_CODE, {});
    }
  });

  socket.on(SocketEvent.CLIENT_ADD_BOT, () => {
    gameManager.addBot(userId);
  });

  socket.on(SocketEvent.CLIENT_SELECT_EMOJI, (payload: { emoji: string }) => {
    gameManager.setEmoji(userId, payload.emoji);
  });

  socket.on(SocketEvent.CLIENT_PLAY_CARD, (payload: any) => {
    gameManager.playCard(userId, payload.card);
  });

  socket.on(SocketEvent.CLIENT_LEAVE_GAME, () => {
    gameManager.removePlayer(userId);
  });

  socket.on('disconnect', () => {
    console.log(`DISCONNECTED: ${userId}`);
    // TODO remove player from game, handle incomplete game
    if (gameManager.hasGameForUserId(userId)) {
      gameManager.removeSocketForPlayer(userId);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
