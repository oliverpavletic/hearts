import React, { Component } from 'react';
import styled from 'styled-components';

import { CardClickHandler } from '../types/cardClickHandler';
import { Suit } from '../types/suit';
import { Rotation } from '../types/rotation';

// Firefox 1.0+
declare const InstallTrigger: any;
const isFirefox = typeof InstallTrigger !== 'undefined';

const CardBody = styled.div`
  position: ${(props: { rotation: Rotation | undefined; selected: boolean; invisible: boolean }) => {
    if (props.rotation) {
      return 'absolute';
    }
    return 'relative';
  }};
  height: 3.5em;
  width: 2.5em;
  color: black;
  background: white;
  font-family: 'DM Serif Display', serif;
  ${(props) => props.invisible && `opacity: 0;`}
  ${(props) =>
    !props.rotation &&
    `
    margin: .1em;`};
  ${(props) =>
    props.rotation &&
    `
    left: 50%;
    top 50%;
  `};
  transform: ${(props) => {
    if (props.rotation === Rotation.TOP) {
      return 'translate(-50%, 0%) rotate(0) translate(0, -125%)';
    }
    if (props.rotation === Rotation.LEFT) {
      return 'translate(-50%, 0%) rotate(90deg) translate(0, 25%)';
    }
    if (props.rotation === Rotation.RIGHT) {
      return 'translate(-50%, 0%) rotate(90deg) translate(0, -125%)';
    }
    // BOTTOM
    return 'translate(-50%, 0%) rotate(0) translate(0, 25%)';
  }};
  transform-origin: top center;
  border-radius: 0.2em;
  border-style: solid;
  border-color: grey;
  border-width: thin;
  // ${(props) =>
    props.selected &&
    ` 
  //   -moz-opacity: 0.5; /* Firefox and Mozilla browsers */
  //   -webkit-opacity: 0.5; /* WebKit browser e.g. Safari */
  //   filter: alpha(opacity=50); /* For IE8 and earlier */`};
  cursor: pointer;
`;

const Value = styled.div`
  position: absolute;
  font-size: 1.5em;
  margin-left: 0.25em;
  color: ${(props: { color: string }) => props.color};
`;

const SuitDiv = styled.div`
  position: absolute;
  font-size: ${(props: { isFirefox: boolean; color: string }) => (props.isFirefox ? '1.5em' : '1.25em')};
  bottom: 0;
  right: 0;
  margin-right: 0.1em;
  margin-bottom: 0.1em;
  color: ${(props) => props.color};
`;

const unicodeSuits = { Clubs: '♣', Diamonds: '♦', Hearts: '♥', Spades: '♠' };

type CardProps = {
  suit: Suit;
  value: number;
  rotation: Rotation | undefined;
  handleCardClick: CardClickHandler;
  invisible: boolean;
};

type CardState = {
  selected: boolean;
};

class Card extends Component<CardProps, CardState> {
  constructor(props: CardProps) {
    super(props);
    this.state = { selected: false };
  }

  getKey() {
    const { value, suit } = this.props;
    return value + suit;
  }

  faceOf(value: number): string | number {
    if (value === 11) {
      return 'J';
    }

    if (value === 12) {
      return 'Q';
    }

    if (value === 13) {
      return 'K';
    }

    if (value === 14) {
      return 'A';
    }

    return value;
  }

  render() {
    const { value, suit, rotation, handleCardClick, invisible } = this.props;
    const { selected } = this.state;
    const suitIcon = typeof unicodeSuits[suit] === 'undefined' ? 'X' : unicodeSuits[suit];
    const color = ['Diamonds', 'Hearts'].includes(suit) ? 'red' : 'black';

    return (
      <CardBody
        rotation={rotation}
        onClick={() => handleCardClick(suit, value)}
        selected={selected}
        invisible={invisible}
      >
        <Value color={color}>{this.faceOf(value)}</Value>
        <SuitDiv color={color} isFirefox={isFirefox}>
          {suitIcon}
        </SuitDiv>
      </CardBody>
    );
  }
}

export default Card;
