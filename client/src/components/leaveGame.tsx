import React, { Component } from 'react';
import styled from 'styled-components';
import { Button } from 'react-bootstrap';
import OutsideClickHandler from 'react-outside-click-handler';

import { COLOR_LIGHTEST_GREY } from '../colors';

const Wrapper = styled.div`
  position: absolute;
  padding: 10px;
  width: 300px;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background: whitesmoke;
  border: 5px solid ${COLOR_LIGHTEST_GREY};
  border-width: medium;
  border-radius: 0.2em;
  overflow: hidden;
  box-sizing: border-box;
`;

const Text = styled.div`
  font-family: 'Baloo Tamma 2', cursive;
  padding: 10px;
  font-size: 20px;
`;

type LeaveGameProps = {
  handleOutsideClick: () => void;
  handleClickStay: () => void;
  handleClickLeave: () => void;
};

class LeaveGame extends Component<LeaveGameProps, {}> {
  render() {
    const { handleOutsideClick, handleClickStay, handleClickLeave } = this.props;
    return (
      <OutsideClickHandler onOutsideClick={handleOutsideClick}>
        <Wrapper>
          <Text>Are you sure you want to leave?</Text>
          <Button variant="success" block onClick={handleClickLeave}>
            Yes
          </Button>
          <Button variant="danger" block onClick={handleClickStay}>
            No
          </Button>
        </Wrapper>
      </OutsideClickHandler>
    );
  }
}

export default LeaveGame;
