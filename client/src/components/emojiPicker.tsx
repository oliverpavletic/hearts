import React, { Component, ReactElement } from "react";
import "emoji-mart/css/emoji-mart.css";
import { EmojiData, Picker } from "emoji-mart";
import OutsideClickHandler from "react-outside-click-handler";

import { COLOR_LIGHT_NAVY } from "../colors";

type EmojiPickerProps = {
  handleOutsideClick: () => void;
  handleClickPickerEmoji: (
    emoji: EmojiData,
    event: React.MouseEvent<Element, MouseEvent>
  ) => void;
  emojiSheet: string | null;
};

class EmojiPicker extends Component<EmojiPickerProps, Record<string, never>> {
  render(): ReactElement {
    const {
      handleOutsideClick,
      handleClickPickerEmoji,
      emojiSheet,
    } = this.props;

    let backgroundImageFn = undefined;

    if (emojiSheet !== null) {
      backgroundImageFn = (_: string, __: number) => {
        return emojiSheet;
      };
    }

    return (
      <OutsideClickHandler onOutsideClick={handleOutsideClick}>
        <Picker
          color={COLOR_LIGHT_NAVY}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) scale(.75)",
          }}
          onClick={handleClickPickerEmoji}
          backgroundImageFn={backgroundImageFn}
        />
      </OutsideClickHandler>
    );
  }
}

export default EmojiPicker;
