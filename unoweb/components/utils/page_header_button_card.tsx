import styled from "styled-components";

// Import the FontAwesomeIcon component
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// import the icons you need
import { faAdd } from "@fortawesome/free-solid-svg-icons";

const CardDiv = styled.div`
  position: relative;
`;

export default function PageHeaderButtonCard({
  header_text,
  button_text,
  button_action,
}: {
  header_text: string;
  button_text: string;
  button_action: () => void;
}) {
  return (
    <CardDiv className="p-3 bg-white shadow-sm rounded d-sm-flex justify-content-sm-between">
      <h3 className="primary-text fw-bold ms-3 text-center">{header_text}</h3>
      <div className="d-flex justify-content-center">
        <button className="btn btn-warning" onClick={button_action}>
          <FontAwesomeIcon icon={faAdd}></FontAwesomeIcon> {button_text}
        </button>
      </div>
    </CardDiv>
  );
}
