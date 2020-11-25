import React, { Component, ReactElement } from 'react';
import styled from 'styled-components';

import BoardCenter from './boardCenter';
import Card from './card';
import { Rotation } from '../types/rotation';
import Player from './player';
import { PlayerInfo } from '../types/playerInfo';

const BoardContainer = styled.div`
  position: relative;
  height: 300px;
  width: 700px;
`;

const Oval = styled.div`
  width: 90%;
  height: 90%;
  background: #107543;
  border-radius: 50%;
  border-style: solid;
  border-color: black;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;

const GameCodeContainer = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-family: 'Baloo Tamma 2', cursive;
  height: 2em;
  width: 5em;
  color: whitesmoke;
  font-size: 2em;
  background: #24ab68;
  border-radius: 0.2em;
  border-color: white;
  border-width: thin;
  padding: 0.1em;
  padding-left: 0.2em;
  padding-right: 0.2em;
`;

const Code = styled.div`
  line-height: 1em;
  &:hover {
    color: grey;
    text-shadow: 0.1em 0.1em 0.1em black;
  }
`;

type BoardProps = {
  cards: (Card | ReactElement)[];
  playersInfo: PlayerInfo[];
  position: number;
  gameCode: string | null;
  turnPosition: number | null;
  handleClickAddBotBtn: () => void;
  handleClickPlayerEmoji: () => void;
  suspendPlayerClickHandlers: boolean;
};

class Board extends Component<BoardProps> {
  constructor(props: BoardProps) {
    super(props);
    this.copyCodeToClip = this.copyCodeToClip.bind(this);
  }

  copyCodeToClip() {
    // ? FIXME
    try {
      const { gameCode } = this.props;
      if (gameCode === null) {
        throw new Error('Unexpected copy when gameCode=null');
      }
      navigator.clipboard.writeText(gameCode);
    } catch (e) {
      console.log('clipboard not accessible');
    }
  }

  render() {
    const {
      cards,
      playersInfo,
      position,
      gameCode,
      turnPosition,
      handleClickAddBotBtn,
      handleClickPlayerEmoji,
      suspendPlayerClickHandlers,
    } = this.props;

    return (
      <BoardContainer>
        <Oval />
        <Player
          info={playersInfo[position]}
          rotation={Rotation.BOTTOM}
          hasAction={turnPosition !== null && turnPosition === position}
          handleClickAddBotBtn={handleClickAddBotBtn}
          handleClickPlayerEmoji={handleClickPlayerEmoji}
          suspendPlayerClickHandlers={suspendPlayerClickHandlers}
        />
        <Player
          info={playersInfo[(position + 1) % 4]}
          rotation={Rotation.LEFT}
          hasAction={turnPosition !== null && turnPosition === (position + 1) % 4}
          handleClickAddBotBtn={handleClickAddBotBtn}
          handleClickPlayerEmoji={() => {}}
          suspendPlayerClickHandlers={suspendPlayerClickHandlers}
        />
        <Player
          info={playersInfo[(position + 2) % 4]}
          rotation={Rotation.TOP}
          hasAction={turnPosition !== null && turnPosition === (position + 2) % 4}
          handleClickAddBotBtn={handleClickAddBotBtn}
          handleClickPlayerEmoji={() => {}}
          suspendPlayerClickHandlers={suspendPlayerClickHandlers}
        />
        <Player
          info={playersInfo[(position + 3) % 4]}
          rotation={Rotation.RIGHT}
          hasAction={turnPosition !== null && turnPosition === (position + 3) % 4}
          handleClickAddBotBtn={handleClickAddBotBtn}
          handleClickPlayerEmoji={() => {}}
          suspendPlayerClickHandlers={suspendPlayerClickHandlers}
        />
        <BoardCenter cards={cards} />
        {gameCode !== null && (
          <GameCodeContainer>
            <div style={{ fontSize: '.5em' }}>GAME CODE</div>
            <Code onClick={this.copyCodeToClip}>{gameCode}</Code>
          </GameCodeContainer>
        )}
      </BoardContainer>
    );
  }
}

export default Board;
