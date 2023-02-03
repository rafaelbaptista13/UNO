import styled from "styled-components";

// Import the FontAwesomeIcon component
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// import the icons you need
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

const CardDiv = styled.div`
  position: relative;
`;

export default function ErrorCard({ message }: { message: string }) {
  return (
    <CardDiv className="p-3 bg-white shadow-sm rounded d-flex align-items-center">
      <FontAwesomeIcon
        className="ms-2"
        size="xl"
        icon={faTriangleExclamation}
      ></FontAwesomeIcon>
      <h5 className="text-center mb-0 ms-3">{message}</h5>
    </CardDiv>
  );
}
