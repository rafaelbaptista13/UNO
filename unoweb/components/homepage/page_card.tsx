import styled from "styled-components";

// Import the FontAwesomeIcon component
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// import the icons you need
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

import { createRef, useEffect } from "react";
import Link from "next/link";

const CardDiv = styled.div`
  position: relative;
`;

const CardLink = styled(Link)`
  position: absolute;
  bottom: 25px;
  right: 25px;
  opacity: 20%;

  .rounded-full {
    border-radius: 100%;
  }
`;

export default function PageCard({
  header,
  text,
  path,
}: {
  header: string;
  text: string;
  path: string;
}) {
  const card = createRef<HTMLDivElement>();
  const card_icon = createRef<HTMLAnchorElement>();

  useEffect(() => {
    // Mouse over event
    if (card.current) {
      card.current.addEventListener("mouseenter", function () {
        if (card_icon.current) card_icon.current.style.opacity = "100%";
      });
      card.current.addEventListener("mouseleave", function () {
        if (card_icon.current) card_icon.current.style.opacity = "20%";
      });
    }
  }, [card, card_icon]);

  return (
    <CardDiv className="p-3 bg-white shadow-sm rounded" ref={card}>
      <h4 className="fs-2">{header}</h4>
      <p className="fs-6">{text}</p>
      <CardLink href={path} ref={card_icon}>
        <FontAwesomeIcon
          icon={faArrowRight}
          className="fs-5 primary-text rounded-full secondary-bg p-3"
        ></FontAwesomeIcon>
      </CardLink>
    </CardDiv>
  );
}
