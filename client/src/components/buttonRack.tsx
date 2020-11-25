import React, { Component, ReactElement } from "react";
import styled from "styled-components";

import { BoxArrowLeft } from "./icons/boxArrowLeft";
import { JournalText } from "./icons/journalText";
// import { PatchQuestion } from './icons/patchQuestion';
import { COLOR_LIGHT_NAVY } from "../colors";

const Wrapper = styled.div`
  top: 0.35em;
  left: ${(props: { left: number; toggled: boolean; frozen: boolean }) =>
    props.left}em;
  position: absolute;
  height: 1.75em;
  width: 1.75em;
  padding: 0.2em;
  color: ${COLOR_LIGHT_NAVY};
  ${(props) => {
    if (props.frozen) {
      return ``;
    }
    if (!props.toggled) {
      return `&:hover {
        cursor: pointer;
        color: whitesmoke;
      }`;
    }
    return `
      color: whitesmoke;
      cursor: pointer;
    `;
  }};
`;

const InnerWrapper = styled.div`
  height: 100%;
  width: 100%;
  position: relative;
`;

type ButtonRackProps = {
  handleClickLeaveBtn: () => void;
  leaveBtnToggled: boolean;
  suspendLeaveBtnClickHandler: boolean;
  handleClickScoreboardBtn: () => void;
  scoreboardBtnToggled: boolean;
  suspendScoreboardBtnClickHandler: boolean;
  // handleClickRulesBtn: () => void;
};

class ButtonRack extends Component<ButtonRackProps, Record<string, never>> {
  render(): ReactElement {
    const {
      handleClickLeaveBtn,
      leaveBtnToggled,
      suspendLeaveBtnClickHandler,
      handleClickScoreboardBtn,
      scoreboardBtnToggled,
      suspendScoreboardBtnClickHandler,
    } = this.props;

    return (
      <>
        <Wrapper
          left={0.35}
          toggled={leaveBtnToggled}
          frozen={scoreboardBtnToggled}
          onClick={
            suspendLeaveBtnClickHandler ? undefined : handleClickLeaveBtn
          }
        >
          <InnerWrapper>{BoxArrowLeft}</InnerWrapper>
        </Wrapper>
        <Wrapper
          left={2.45}
          toggled={scoreboardBtnToggled}
          frozen={leaveBtnToggled}
          onClick={
            suspendScoreboardBtnClickHandler
              ? undefined
              : handleClickScoreboardBtn
          }
        >
          <InnerWrapper>{JournalText}</InnerWrapper>
        </Wrapper>
        {/* <Wrapper left={4.55}>
          <InnerWrapper>{PatchQuestion}</InnerWrapper>
        </Wrapper> */}
      </>
    );
  }
}

export default ButtonRack;
