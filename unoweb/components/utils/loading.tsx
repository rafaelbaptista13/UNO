import React from "react";
import styled from "styled-components";

const LoadingSpinner = styled.div`
  margin: auto;
  width: 100px;
  height: 100px;
  border: 10px solid #f3f3f3; /* Light grey */
  border-top: 10px solid var(--second-bg-color);
  border-radius: 50%;
  animation: spinner 1.5s linear infinite;
`;

export default function Loading() {
  return <LoadingSpinner />;
}
