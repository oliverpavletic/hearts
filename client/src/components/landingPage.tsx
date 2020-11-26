import React, { Component, ReactElement } from "react";
import styled from "styled-components";
import { Button, ButtonGroup, Form } from "react-bootstrap";

import { SocketEvent } from "../types/socketEvent";

import GitHubLogo from "../GitHub-Mark-Light-64px.png";

const GITHUB_LINK = "https://github.com/oliverpavletic/hearts";

const Title = styled.div`
  font-family: "Baloo Tamma 2", cursive;
  font-size: 5em;
  color: whitesmoke;
  padding-top: 0.5em;
`;

const Container = styled.div`
  display: inline-block;
  width: 27em;
  padding: 2em;
  @media only screen and (max-width: 27em) {
    width: 90%;
  }
`;

const GitHubLogoContainer = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  padding: 0.1em;
  transform: scale(0.5);
  &:hover {
    filter: invert(100%);
  }
`;

enum FormToggled {
  JOIN = "JOIN",
  CREATE = "CREATE",
}

type LandingPageProps = {
  socket: SocketIOClient.Socket;
};

type LandingPageState = {
  formToggled: FormToggled;
  gameCodeIsValid: boolean | null;
};

class LandingPage extends Component<LandingPageProps, LandingPageState> {
  constructor(props: LandingPageProps) {
    super(props);
    this.onToggle = this.onToggle.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = { formToggled: FormToggled.CREATE, gameCodeIsValid: null };
  }

  onToggle(): void {
    const { formToggled } = this.state;
    const nextToggle: FormToggled =
      formToggled === FormToggled.JOIN ? FormToggled.CREATE : FormToggled.JOIN;

    this.setState({ formToggled: nextToggle });
  }

  handleSubmit(): void {
    const { socket } = this.props;
    const { formToggled } = this.state;
    const playerNameNode = document.getElementById(
      "playerName"
    ) as HTMLInputElement;

    if (typeof playerNameNode === "undefined") {
      alert("Error submitting form. Try refreshing the page.");
      return;
    }

    const playerName = playerNameNode.value;

    socket.on(SocketEvent.SERVER_INVALID_GAME_CODE, () => {
      this.setState({ gameCodeIsValid: false });
    });

    if (formToggled === FormToggled.JOIN) {
      const gameCodeNode = document.getElementById(
        "gameCode"
      ) as HTMLInputElement;

      if (typeof gameCodeNode === "undefined") {
        alert("Error submitting form. Try refreshing the page.");
        return;
      }

      const gameCode = gameCodeNode.value;
      socket.emit(SocketEvent.CLIENT_JOIN_GAME, {
        playerName,
        gameCode,
      });
    } else {
      socket.emit(SocketEvent.CLIENT_CREATE_GAME, {
        playerName,
      });
    }
  }

  render(): ReactElement {
    const titleText = (
      <span>
        HE
        <span style={{ fontSize: ".75em" }}>♡</span>
        RTS
      </span>
    );

    const { formToggled, gameCodeIsValid } = this.state;

    return (
      <>
        <Title>{titleText}</Title>
        <Container>
          <ButtonGroup
            aria-label="Basic example"
            style={{ paddingBottom: "1em", width: "100%" }}
          >
            <Button
              variant="outline-light"
              style={{ boxShadow: "none" }}
              className={
                formToggled === FormToggled.JOIN ? "active" : undefined
              }
              onClick={this.onToggle}
            >
              Join Game
            </Button>
            <Button
              variant="outline-light"
              style={{ boxShadow: "none" }}
              className={
                formToggled === FormToggled.CREATE ? "active" : undefined
              }
              onClick={this.onToggle}
            >
              Create Game
            </Button>
          </ButtonGroup>
          <Form>
            {formToggled === FormToggled.JOIN && (
              <Form.Group>
                <Form.Control
                  id="gameCode"
                  size="lg"
                  type="text"
                  placeholder="Enter game code"
                  style={{ textAlign: "center" }}
                  // isValid={typeof gameCodeIsValid !== null && gameCodeIsValid}
                  isInvalid={gameCodeIsValid !== null && !gameCodeIsValid}
                />
              </Form.Group>
            )}
            <Form.Group>
              <Form.Control
                id="playerName"
                size="lg"
                type="text"
                placeholder="Enter player name"
                style={{ textAlign: "center" }}
                // isValid={typeof nameIsValid !== 'undefined' && nameIsValid}
                // isInvalid={typeof nameIsValid !== 'undefined' && !nameIsValid}
              />
            </Form.Group>
            <Button
              variant="primary"
              style={{ width: "100%" }}
              onClick={this.handleSubmit}
            >
              {formToggled === FormToggled.JOIN ? "Join Game" : "Create Game"}
            </Button>
          </Form>
        </Container>
        <GitHubLogoContainer>
          <a href={GITHUB_LINK} rel="noopener noreferrer" target="_blank">
            <img src={GitHubLogo} alt={""}></img>
          </a>
        </GitHubLogoContainer>
      </>
    );
  }
}

export default LandingPage;
