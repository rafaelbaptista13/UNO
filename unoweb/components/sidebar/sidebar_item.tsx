// Import the FontAwesomeIcon component
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// import the icons you need
import {
  faHouse,
  faBook,
  faCircleQuestion,
  faClapperboard,
  faUsers,
  faMessage,
  faNoteSticky,
  faCircleInfo,
  faSignIn,
  faSignOut,
} from "@fortawesome/free-solid-svg-icons";

import styled from "styled-components";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import Link from "next/link";

const ListItem = styled(Link)`
  border: none;
  padding: 20px 30px;
  font-size: 18px;
  color: var(--second-text-color);
  text-decoration: none;
  position: relative;
  font-weight: bold;

  &.active {
    background-color: transparent;
    color: var(--main-text-color);
  }

  &:first-child {
    border-top-left-radius: inherit;
    border-top-right-radius: inherit;
  }
`;

const pages = new Map<string, { icon: IconProp; text: string; path: string }>([
  [
    "home",
    {
      icon: faHouse,
      text: "Página inicial",
      path: "/",
    },
  ],
  [
    "contents",
    {
      icon: faBook,
      text: "Conteúdos",
      path: "/contents",
    },
  ],
  [
    "click",
    {
      icon: faCircleQuestion,
      text: "Click",
      path: "/click",
    },
  ],
  [
    "videos",
    {
      icon: faClapperboard,
      text: "Vídeos",
      path: "/videos",
    },
  ],
  [
    "progress",
    {
      icon: faUsers,
      text: "Progresso",
      path: "/progress",
    },
  ],
  [
    "messages",
    {
      icon: faMessage,
      text: "Mensagens",
      path: "/messages",
    },
  ],
  [
    "notes",
    {
      icon: faNoteSticky,
      text: "Notas",
      path: "/notes",
    },
  ],
  [
    "login",
    {
      icon: faSignIn,
      text: "Iniciar sessão",
      path: "/login",
    },
  ],
  [
    "logout",
    {
      icon: faSignOut,
      text: "Sair",
      path: "/logout",
    },
  ]
]);

export default function SideBarItem({
  item,
  active,
}: {
  item: string;
  active: boolean;
}) {
  let icon = pages.get(item)?.icon;
  if (icon === undefined) {
    icon = faCircleInfo;
  }
  let path = pages.get(item)?.path;
  if (path === undefined) {
    path = "/error";
  }

  return (
    <ListItem
      href={path}
      className={
        active
          ? "list-group list-group-item-action bg-transparent second-text flex-row align-items-center active"
          : "list-group list-group-item-action bg-transparent second-text flex-row align-items-center"
      }
    >
      <FontAwesomeIcon icon={icon} className="me-2 " />
      {pages.get(item)?.text}
    </ListItem>
  );
}
