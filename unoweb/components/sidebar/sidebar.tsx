import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import styled from "styled-components";
import {
  setActiveClass,
} from "../../redux/features/active_class";
import { AuthState, logout } from "../../redux/features/auth";
import { AppDispatch, RootState } from "../../redux/store";
import SideBarItem from "./sidebar_item";
import getBasePath from "../utils/basePath";

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
  const dispatch = useDispatch<AppDispatch>();
  const basePath = getBasePath();

  const { user: currentUser } = useSelector<RootState, AuthState>(
    (state) => state.auth
  );

  const logout_callback = useCallback(() => {
    dispatch(logout());
    dispatch(
      setActiveClass({
        id: -1,
        name: "",
      })
    );
    router.push("/login");
  }, [dispatch, router]);

  return (
    <SideBarWrapper className={`bg-white`} id="sidebar-wrapper">
      <SideBarHeader
        className={`sidebar-heading text-center py-4 fs-4 fw-bold text-uppercase`}
      >
        <Image
          id="logo"
          src={ basePath + "/img/logo-no-background.png"}
          alt={"uno logo"}
          height={35}
          width={110}
        />
      </SideBarHeader>

      {currentUser && (
        <div className="list-group list-group-flush my-3">
          <SideBarItem item="home" active={main_path === ""} />
          <SideBarItem item="contents" active={main_path === "contents"} />
          <SideBarItem item="click" active={main_path === "click"} />
          <SideBarItem item="videos" active={main_path === "videos"} />
          <SideBarItem item="progress" active={main_path === "progress"} />
          <SideBarItem item="messages" active={main_path === "messages"} />
          <SideBarItem item="notes" active={main_path === "notes"} />
          <SideBarItem item="classes" active={main_path === "classes"} />
          <SideBarItem
            item="logout"
            active={main_path === "logout"}
            action_callback={logout_callback}
          />
        </div>
      )}
      {!currentUser && (
        <div className="list-group list-group-flush my-3">
          <SideBarItem item="login" active={main_path === "login"} />
        </div>
      )}
    </SideBarWrapper>
  );
}
