import React, { ReactElement } from 'react';
import styled from 'styled-components';
import Card from './card';

const Center = styled.div`
  position: absolute;
  height: 10em;
  width: 10em;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;

type BoardCenterProps = {
  cards: (Card | ReactElement)[];
};

function BoardCenter(props: BoardCenterProps) {
  const { cards } = props;

  return (
    <Center>
      {cards[0]}
      {cards[1]}
      {cards[2]}
      {cards[3]}
    </Center>
  );
}

export default BoardCenter;
