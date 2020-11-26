import React, { ReactElement } from "react";
import styled from "styled-components";

import { PlayerInfo } from "../types/playerInfo";
import { Rotation } from "../types/rotation";
import {
  COLOR_DIMMED_DISCONNECTED,
  COLOR_DIMMED_DISCONNECTED_HOVER,
  COLOR_LIGHT_NAVY,
  COLOR_GOLDEN_SHADOW,
} from "../colors";

const Container = styled.div`
  position: absolute;
  padding: 0.1em;
  padding-left: 0.5em;
  padding-right: 0.5em;
  text-align: left;
  font-family: "Baloo Tamma 2", cursive;
  color: whitesmoke;
  background: ${(props: {
    rotation: Rotation;
    isEmpty: boolean;
    hasAction: boolean;
    dimmed: boolean;
    hoverable: boolean;
  }) => {
    if (props.dimmed) {
      return COLOR_DIMMED_DISCONNECTED;
    }
    return COLOR_LIGHT_NAVY;
  }};
  ${(props) => {
    if (props.hoverable) {
      return `
        &:hover {
          cursor: pointer;
          background: ${COLOR_DIMMED_DISCONNECTED_HOVER};
          color: grey;
        };
      `;
    }
  }}
  border-radius: 0.2em;
  height: 3em;
  ${(props) => props.isEmpty && `width: 6em;`}
  ${(props) => {
    if (props.rotation === Rotation.TOP) {
      return `
      left: 50%;
      transform: translate(-50%, 0);`;
    }
    if (props.rotation === Rotation.LEFT) {
      return `
      top: 50%;
      transform: translate(5%, -50%);`;
    }
    if (props.rotation === Rotation.BOTTOM) {
      return `
      bottom: 0;
      left: 50%;
      transform: translate(-50%, 0);`;
    }
    if (props.rotation === Rotation.RIGHT) {
      return `
      top: 50%;
      right: 0;
      transform: translate(-5%, -50%);`;
    }
    return ``;
  }};
  ${(props) => {
    if (props.hasAction) {
      return `    
      border-color: #00000030;
      border-style: solid;
      border-width: thin;
      box-shadow: 0em 0em 3em ${COLOR_GOLDEN_SHADOW};`;
    }
    return `box-shadow: 0.2em 0.2em 0.2em black;`;
  }};
`;

const Icon = styled.div`
  float: left;
  height: 100%;
  padding-right: 0.25em;
  padding-top: 0.1em;
  padding-bottom: 0.1em;
  font-size: 2em;
  ${(props: { dimmed: boolean }) => props.dimmed && `filter: grayscale(100%);`}
`;

const NameScoreWrapper = styled.div`
  float: left;
  font-size: 1.25em;
  line-height: 1em;
  margin-top: 0.25em;
`;

const Name = styled.div`
  max-width: 6em;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Score = styled.div`
  font-size: 0.5em;
  line-height: 1em;
  text-align: center;
`;

const AddBotButtonWrapper = styled.div`
  font-size: 0.75em;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;

type PlayerProps = {
  info: PlayerInfo;
  rotation: Rotation;
  hasAction: boolean;
  handleClickAddBotBtn: () => void;
  handleClickPlayerEmoji: () => void;
  suspendPlayerClickHandlers: boolean;
};

function Player(props: PlayerProps): ReactElement {
  const {
    info,
    rotation,
    hasAction,
    handleClickAddBotBtn,
    handleClickPlayerEmoji,
    suspendPlayerClickHandlers,
  } = props;
  let content;

  if (info === null) {
    content = <AddBotButtonWrapper>Add Bot</AddBotButtonWrapper>;
  } else {
    content = (
      <>
        <Icon
          dimmed={!info.isConnected}
          onClick={
            suspendPlayerClickHandlers ? undefined : handleClickPlayerEmoji
          }
        >
          {info.emoji}
        </Icon>
        <NameScoreWrapper>
          <Name>{info.name}</Name>
          <Score>
            {info.totalScore}
            {" | "}
            {info.roundScore}
          </Score>
        </NameScoreWrapper>
      </>
    );
  }

  return (
    <Container
      rotation={rotation}
      isEmpty={info === null}
      hasAction={hasAction}
      dimmed={info === null || !info.isConnected}
      hoverable={info === null}
      onClick={
        info === null && !suspendPlayerClickHandlers
          ? handleClickAddBotBtn
          : () => {
              return;
            }
      }
    >
      {content}
    </Container>
  );
}

export default Player;
