import Image from "next/image";
import { useRouter } from "next/router";

import styled from "styled-components";
import SideBarItem from "./sidebar_item";

const SideBarWrapper = styled.div`
  min-height: 100vh;
  margin-left: -15rem;
  -webkit-transition: margin 0.25s ease-out;
  -moz-transition: margin 0.25s ease-out;
  -o-transition: margin 0.25s ease-out;
  transition: margin 0.25s ease-out;

  .sidebar-heading {
    padding: 0.875rem 1.25rem;
    font-size: 1.2rem;
  }

  .list-group {
    width: 15rem;
  }
`;

const SideBarHeader = styled.div`
  background-image: linear-gradient(
    90deg,
    rgba(255, 255, 255, 1) 0%,
    rgba(252, 253, 235, 1) 100%
  );
`;

export default function SideBar() {
  const router = useRouter();
  const main_path = router.pathname.split("/")[1];

  return (
    <SideBarWrapper className={`bg-white`} id="sidebar-wrapper">
      <SideBarHeader
        className={`sidebar-heading text-center py-4 fs-4 fw-bold text-uppercase`}
      >
        <Image
          id="logo"
          src="/img/logo-no-background.png"
          alt={"uno logo"}
          height={35}
          width={110}
        />
      </SideBarHeader>
      <div className="list-group list-group-flush my-3">
        <SideBarItem item="home" active={main_path === ""} />
        <SideBarItem item="contents" active={main_path === "contents"} />
        <SideBarItem item="click" active={main_path === "click"} />
        <SideBarItem item="videos" active={main_path === "videos"} />
        <SideBarItem item="progress" active={main_path === "progress"} />
        <SideBarItem item="messages" active={main_path === "messages"} />
        <SideBarItem item="notes" active={main_path === "notes"} />
      </div>
    </SideBarWrapper>
  );
}
