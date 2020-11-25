import { Suit } from './suit';

export type CardClickHandler = (suit: Suit, value: number) => void;

export const DummyClickHandler: CardClickHandler = (suit: Suit, value: number) => {};
