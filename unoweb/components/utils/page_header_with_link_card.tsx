import styled from "styled-components";

// Import the FontAwesomeIcon component
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// import the icons you need
import { faAdd } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

const CardDiv = styled.div`
  position: relative;
`;

export default function PageHeaderWithLinkCard({
  header_text,
  button_text,
  link_path,
}: {
  header_text: string;
  button_text: string;
  link_path: string;
}) {
  return (
    <CardDiv className="p-3 bg-white shadow-sm rounded d-sm-flex justify-content-sm-between">
      <h3 className="primary-text fw-bold ms-3 text-center">{header_text}</h3>
      <div className="d-flex justify-content-center">
        <Link href={link_path}>
          <button className="btn btn-warning">
            <FontAwesomeIcon icon={faAdd}></FontAwesomeIcon> {button_text}
          </button>
        </Link>
      </div>
    </CardDiv>
  );
}
