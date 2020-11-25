import React, { Component, ReactElement } from 'react';
import styled from 'styled-components';

import Board from './board';
import Card from './card';
import { CardClickHandler, DummyClickHandler } from '../types/cardClickHandler';
import { JSONCard } from '../types/jsonCard';
import Hand from './hand';
import { SocketEvent } from '../types/socketEvent';
import { Suit } from '../types/suit';
import { Rotation } from '../types/rotation';
import { PlayerInfo } from '../types/playerInfo';
import ButtonRack from './buttonRack';
import Scorecard from './scorecard';
import { ScorecardData } from '../types/scorecardData';
import LeaveGame from './leaveGame';
import EmojiPicker from './emojiPicker';
import { EmojiData } from 'emoji-mart';

const GAME_HEIGHT = 500;
const GAME_WIDTH = 700;

const GameWrapper = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  background: #162447;
  display: inline-block;
  ${(props: { scale: number }) =>
    props.scale &&
    `
    transform: translate(-50%, -50%) scale(${props.scale})
  `};
`;

type GameProps = {
  position: number;
  gameCode: string;
  socket: SocketIOClient.Socket;
  handleLeaveGame: () => void;
};

type GameState = {
  scale: number;
  boardCards: (Card | ReactElement)[];
  handJSONCards: JSONCard[];
  turnPosition: number | null;
  validSuits: Suit[];
  playersInfo: PlayerInfo[] | null;
  showGameCode: boolean;
  scorecardData: ScorecardData | null;
  // client only
  showScoreboard: boolean;
  suspendScoreboardBtnClickHandler: boolean;
  suspendCardClickHandler: boolean;
  showLeaveGame: boolean;
  suspendLeaveBtnClickHandler: boolean;
  showPicker: boolean;
  suspendPlayerClickHandlers: boolean;
};

class Game extends Component<GameProps, GameState> {
  static mod(n: number, m: number): number {
    return ((n % m) + m) % m;
  }

  constructor(props: GameProps) {
    super(props);
    this.state = {
      scale: 100,
      boardCards: [<></>, <></>, <></>, <></>],
      handJSONCards: [],
      turnPosition: null,
      validSuits: [],
      playersInfo: null,
      showGameCode: true,
      scorecardData: null,
      showScoreboard: false,
      suspendScoreboardBtnClickHandler: false,
      suspendCardClickHandler: false,
      showLeaveGame: false,
      suspendLeaveBtnClickHandler: false,
      showPicker: false,
      suspendPlayerClickHandlers: false,
    };
  }

  componentDidMount() {
    let { socket } = this.props;

    fetch('/gameState')
      .then((res) => res.json())
      .then((gameState) => {
        if ('boardCards' in gameState) {
          this.setGameStateFromJSON(gameState);
        }
      });

    socket.on(SocketEvent.SERVER_UPDATED_GAME_STATE, (gameState: any) => {
      this.setGameStateFromJSON(gameState);
    });

    this.resize();
    window.addEventListener('resize', this.resize.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize.bind(this));
  }

  setGameStateFromJSON(json: any) {
    this.setState({
      boardCards: this.generateCards(json['boardCards'], DummyClickHandler, false),
      handJSONCards: json['handJSONCards'],
      turnPosition: json['turnPosition'],
      validSuits: json['validSuits'],
      playersInfo: json['playersInfo'],
      showGameCode: json['showGameCode'],
      scorecardData: json['scorecardData'],
    });
  }

  rotationBasedOnPosition(otherPos: number) {
    const { position } = this.props;
    const rotations = [Rotation.BOTTOM, Rotation.LEFT, Rotation.TOP, Rotation.RIGHT];
    const relativePos = Game.mod(otherPos - position, 4);

    return rotations[relativePos];
  }

  generateCards(jsonCards: JSONCard[], clickHandler: CardClickHandler, inHand: boolean): ReactElement<Card>[] {
    let cards: ReactElement<Card>[] = [];
    let jsonCard: JSONCard;
    let amt = inHand ? this.state.handJSONCards.length : 4;
    for (let pos = 0; pos < amt; pos += 1) {
      jsonCard = jsonCards[pos];
      let card: ReactElement<Card>;
      if (jsonCard == null) {
        card = <></>;
      } else {
        card = (
          <Card
            suit={jsonCard.suit}
            value={jsonCard.value}
            handleCardClick={clickHandler}
            rotation={inHand ? undefined : this.rotationBasedOnPosition(pos)}
            invisible={false}
          />
        );
      }
      cards.push(card);
    }
    return cards;
  }

  handleCardInHandClick(suit: Suit, value: number): void {
    let { boardCards, handJSONCards, turnPosition, validSuits } = this.state;
    const { position, socket } = this.props;

    // not clientsturnPosition OR client clicked an invalid suit while their hand contained a valid suit
    if (
      turnPosition !== position ||
      (!validSuits.includes(suit) &&
        validSuits.some((validSuit) => handJSONCards.some((card) => validSuit === card.suit)))
    ) {
      console.log('Card clicked but was not deemed valid to play.');
      return;
    }

    const index = handJSONCards.findIndex((card) => card.suit === suit && card.value === value);
    const card = handJSONCards.splice(index, 1)[0];

    boardCards[0] = (
      <Card
        suit={suit}
        value={value}
        rotation={Rotation.BOTTOM}
        handleCardClick={DummyClickHandler}
        invisible={false}
      />
    );
    socket.emit(SocketEvent.CLIENT_PLAY_CARD, {
      card,
    });
    turnPosition = (turnPosition + 1) % 4;
    this.setState({ boardCards, handJSONCards, turnPosition });
  }

  handleClickAddBotBtn() {
    let socket = this.props.socket;
    console.log('Clicked!');
    socket.emit(SocketEvent.CLIENT_ADD_BOT, {});
  }

  handleClickScoreboardBtn() {
    this.setState({
      showScoreboard: true,
      suspendScoreboardBtnClickHandler: true,
      suspendLeaveBtnClickHandler: true,
      suspendCardClickHandler: true,
      suspendPlayerClickHandlers: true,
    });
  }

  handleClickLeaveBtn() {
    this.setState({
      showLeaveGame: true,
      suspendScoreboardBtnClickHandler: true,
      suspendLeaveBtnClickHandler: true,
      suspendCardClickHandler: true,
      suspendPlayerClickHandlers: true,
    });
  }

  handleClickLeaveGameLeave() {
    this.props.socket.emit(SocketEvent.CLIENT_LEAVE_GAME, {});
    this.props.handleLeaveGame();
  }

  handleClickPlayerEmoji() {
    this.setState({
      showPicker: true,
      suspendScoreboardBtnClickHandler: true,
      suspendLeaveBtnClickHandler: true,
      suspendCardClickHandler: true,
      suspendPlayerClickHandlers: true,
    });
  }

  handleClickPickerEmoji(emoji: any, _: React.MouseEvent<Element, MouseEvent>) {
    const { socket, position } = this.props;
    const { playersInfo } = this.state;

    try {
      playersInfo![position].emoji = emoji.native;
    } catch {
      console.log('unexpected error updating emoji');
    }

    this.handleOutsideClick();

    socket.emit(SocketEvent.CLIENT_SELECT_EMOJI, { emoji: emoji.native });
  }

  handleOutsideClick() {
    this.setState({ showScoreboard: false, showLeaveGame: false, showPicker: false });
    // Prevent outside click from triggering click on scoreboardBtn or card
    setTimeout(() => {
      this.setState({
        suspendScoreboardBtnClickHandler: false,
        suspendCardClickHandler: false,
        suspendLeaveBtnClickHandler: false,
        suspendPlayerClickHandlers: false,
      });
    }, 50);
  }

  resize() {
    const scale = Math.min(window.innerWidth / GAME_WIDTH, window.innerHeight / GAME_HEIGHT);
    this.setState({ scale });
  }

  render() {
    const {
      scale,
      boardCards,
      playersInfo,
      showGameCode,
      handJSONCards,
      turnPosition,
      showScoreboard,
      scorecardData,
      suspendScoreboardBtnClickHandler,
      suspendCardClickHandler,
      showLeaveGame,
      suspendLeaveBtnClickHandler,
      showPicker,
      suspendPlayerClickHandlers,
    } = this.state;
    const { position, gameCode } = this.props;

    return (
      <GameWrapper scale={scale}>
        {playersInfo !== null && (
          <>
            <Board
              cards={boardCards}
              playersInfo={playersInfo}
              position={position}
              gameCode={showGameCode ? gameCode : null}
              turnPosition={turnPosition}
              handleClickAddBotBtn={this.handleClickAddBotBtn.bind(this)}
              handleClickPlayerEmoji={this.handleClickPlayerEmoji.bind(this)}
              suspendPlayerClickHandlers={suspendPlayerClickHandlers}
            />
            <Hand
              cards={this.generateCards(
                handJSONCards,
                suspendCardClickHandler ? DummyClickHandler : this.handleCardInHandClick.bind(this),
                true
              )}
            />
          </>
        )}
        <ButtonRack
          handleClickLeaveBtn={this.handleClickLeaveBtn.bind(this)}
          leaveBtnToggled={showLeaveGame}
          suspendLeaveBtnClickHandler={suspendLeaveBtnClickHandler}
          handleClickScoreboardBtn={this.handleClickScoreboardBtn.bind(this)}
          scoreboardBtnToggled={showScoreboard}
          suspendScoreboardBtnClickHandler={suspendScoreboardBtnClickHandler}
        />
        {showScoreboard && (
          <Scorecard scorecardData={scorecardData} handleOutsideClick={this.handleOutsideClick.bind(this)} />
        )}
        {showLeaveGame && (
          <LeaveGame
            handleOutsideClick={this.handleOutsideClick.bind(this)}
            handleClickStay={this.handleOutsideClick.bind(this)}
            handleClickLeave={this.handleClickLeaveGameLeave.bind(this)}
          />
        )}
        {showPicker && (
          <EmojiPicker
            handleOutsideClick={this.handleOutsideClick.bind(this)}
            handleClickPickerEmoji={this.handleClickPickerEmoji.bind(this)}
          />
        )}
      </GameWrapper>
    );
  }
}

export default Game;
