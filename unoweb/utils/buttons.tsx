import styled from "styled-components";

export const ButtonPrimary = styled.button.attrs({
  className: "btn",
})`
  background: var(--third-bg-color);
  border: 0px;
  color: #fff;

  &:hover,
  &:focus,
  &:active {
    color: #fff;
    background-color: #ac6d20;
  }
`;

export const ButtonPrimaryDarker = styled.button.attrs({
  className: "btn",
})`
  background: #611F07;
  border: 0px;
  color: #fff;

  &:hover,
  &:focus,
  &:active {
    color: #fff;
    background-color: #A5360D;
  }
`;

export const ButtonPrimaryInverseDarker = styled.button.attrs({
  className: "btn",
})`
  background: #fff;
  border: 3px solid #611F07;
  color: #611F07;

  &:hover,
  &:focus,
  &:active {
    color: #fff;
    background-color: #A5360D;
  }
`;