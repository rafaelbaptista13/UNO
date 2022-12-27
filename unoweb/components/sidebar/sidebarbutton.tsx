// Import the FontAwesomeIcon component
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// import the icons you need
import { faAlignLeft } from "@fortawesome/free-solid-svg-icons";

import styled from "styled-components";
import { MouseEventHandler } from "react";
import { useRouter } from "next/router";

const CloseIcon = styled(FontAwesomeIcon)`
  cursor: pointer;
`;

const page_headers = new Map<string, string>([
  ["/contents", "Conteúdos"],
  ["/click", "Click"],
  ["/videos", "Vídeos"],
  ["/progress", "Progresso"],
  ["/messages", "Mensagens"],
  ["/notes", "Notas"],
]);

export default function SideBarButton({
  handleSideBar,
}: {
  handleSideBar: MouseEventHandler;
}) {
  const router = useRouter();

  return (
    <div className="d-flex align-items-center py-4 px-4">
      <CloseIcon
        icon={faAlignLeft}
        className="primary-text fs-4 me-3"
        id="menu-toggle"
        onClick={handleSideBar}
      ></CloseIcon>
      <h2 className="fs-2 m-0">{page_headers.get(router.pathname)}&nbsp;</h2>
    </div>
  );
}
