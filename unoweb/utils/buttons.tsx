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