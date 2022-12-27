import '../styles/globals.css'
import type { AppProps } from 'next/app'
import "bootstrap/dist/css/bootstrap.css";
import "@fortawesome/fontawesome-svg-core/styles.css"; // import Font Awesome CSS
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false; // Tell Font Awesome to skip adding the CSS automatically since it's being imported above
import styled from "styled-components";
import { useCallback, useRef } from 'react';
import SideBar from '../components/sidebar/sidebar';
import SideBarButton from '../components/sidebar/sidebarbutton';

const Wrapper = styled.div`
  overflow-x: hidden;
  background-image: linear-gradient(270deg, rgba(255,255,255,1) 0%, rgba(252,253,235,1) 100%);

  &.toggled > #sidebar-wrapper {
    margin-left: 0;
  }

  @media (min-width: 768px) {
    #sidebar-wrapper {
      margin-left: 0;
    }

    &.toggled > #sidebar-wrapper {
      margin-left: -15rem;
    }
  }
`;

const PageContentWrapper = styled.div`
  width: 100%;
`;

export default function App({ Component, pageProps }: AppProps) {
  const wrapper_div = useRef<HTMLDivElement>(null);

  const handleSideBarStatus = () => {
    if (wrapper_div.current) {
      wrapper_div.current.classList.toggle("toggled");
    }
  };

  return (
    <Wrapper className={`d-flex`} ref={wrapper_div}>
      <SideBar />
      <PageContentWrapper id="page-content-wrapper">
        <SideBarButton handleSideBar={useCallback(handleSideBarStatus, [])} />
        <Component {...pageProps} />
      </PageContentWrapper>
    </Wrapper>
  );
}
