import React, { Component, ReactElement } from "react";
import styled from "styled-components";

import { JoinInfo } from "../types/joinInfo";
import { SocketEvent } from "../types/socketEvent";
import Game from "./game";
import LandingPage from "./landingPage";

const Background = styled.div`
  text-align: center;
`;

type MainWrapperProps = {
  joinInfo: JoinInfo | null;
  socket: SocketIOClient.Socket;
};

type MainWrapperState = {
  joinInfo: JoinInfo | null;
};

class MainWrapper extends Component<MainWrapperProps, MainWrapperState> {
  constructor(props: MainWrapperProps) {
    super(props);
    this.state = {
      joinInfo: props.joinInfo,
    };
  }

  componentDidMount(): void {
    const { socket } = this.props;

    socket.on(SocketEvent.SERVER_SENT_JOIN_INFO, (joinInfo: JoinInfo) => {
      if (this.state.joinInfo === null) {
        this.setState({ joinInfo });
      }
    });
  }

  handleLeaveGame(): void {
    this.setState({ joinInfo: null });
  }

  render(): ReactElement {
    const { joinInfo } = this.state;
    const { socket } = this.props;

    return (
      <Background>
        {joinInfo !== null && (
          <Game
            gameCode={joinInfo.gameCode}
            position={joinInfo.position}
            socket={socket}
            handleLeaveGame={this.handleLeaveGame.bind(this)}
          />
        )}
        {joinInfo === null && <LandingPage socket={socket} />}
      </Background>
    );
  }
}

export default MainWrapper;
