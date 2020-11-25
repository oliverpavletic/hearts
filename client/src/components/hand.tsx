import React, { ReactElement } from 'react';
import styled from 'styled-components';
import { DummyClickHandler } from '../types/cardClickHandler';
import { Suit } from '../types/suit';
import Card from './card';

const HandContainer = styled.div`
  display: table;
  margin: 0 auto;
  padding-top: 2em;
  height: 5em;
  width: 2.5em;
`;

const CardContainer = styled.div`
  display: table-cell;
`;

// Used to prevent resizing of the Hands height
const DummyCard = (
  <Card suit={Suit.SPADES} value={0} invisible={true} rotation={undefined} handleCardClick={DummyClickHandler} />
);

function Hand(props: { cards: ReactElement<Card>[] }) {
  const { cards } = props;
  let key = 0;
  return (
    <HandContainer>
      {cards.map((card: ReactElement<Card>) => (
        <CardContainer key={key++}>{card}</CardContainer>
      ))}
      {cards.length === 0 && DummyCard}
    </HandContainer>
  );
}

export default Hand;
