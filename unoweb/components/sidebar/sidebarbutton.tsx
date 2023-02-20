// Import the FontAwesomeIcon component
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// import the icons you need
import { faAlignLeft, faExchange } from "@fortawesome/free-solid-svg-icons";

import styled from "styled-components";
import { MouseEventHandler, useState } from "react";
import { useRouter } from "next/router";
import ChangeClassModal from "../utils/change_class_modal";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { AuthState } from "../../redux/features/auth";
import { ActiveClassState } from "../../redux/features/active_class";

const CloseIcon = styled(FontAwesomeIcon)`
  cursor: pointer;
`;

const page_headers = new Map<string, string>([
  ["contents", "Conteúdos"],
  ["click", "Click"],
  ["videos", "Vídeos"],
  ["progress", "Progresso"],
  ["messages", "Mensagens"],
  ["notes", "Notas"],
]);

export default function SideBarButton({
  handleSideBar,
}: {
  handleSideBar: MouseEventHandler;
}) {
  const router = useRouter();
  const [show_change_class_modal, setShowChangeClassModal] = useState(false);

  const { user: currentUser } = useSelector<RootState, AuthState>(
    (state) => state.auth
  );
  const { name: class_name } = useSelector<RootState, ActiveClassState>(
    (state) => state.active_class
  );

  return (
    <div className="d-flex align-items-center py-4 px-4">
      <CloseIcon
        icon={faAlignLeft}
        className="primary-text fs-4 me-3"
        id="menu-toggle"
        onClick={handleSideBar}
      ></CloseIcon>
      <h2 className="primary-text fs-2 m-0">
        {page_headers.get(router.pathname.split("/")[1])}&nbsp;
      </h2>
      {currentUser && (
        <>
          <div className="d-flex align-items-center ms-auto">
            <h4 className="primary-text m-0">{class_name === "" ? "Escolha a sua turma" : class_name}</h4>
            <CloseIcon
              icon={faExchange}
              className="primary-text fs-4 me-2 ms-3"
              onClick={() => setShowChangeClassModal(true)}
            ></CloseIcon>
          </div>
          <ChangeClassModal
            onHide={() => setShowChangeClassModal(false)}
            show={show_change_class_modal}
          />
        </>
      )}
    </div>
  );
}
