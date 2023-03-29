import { useRouter } from "next/router";
import { ReactElement, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AuthState } from "../../redux/features/auth";
import { RootState } from "../../redux/store";

export default function RouteGuard({ children }: { children: ReactElement }) {
  const router = useRouter();
  const { user: currentUser } = useSelector<RootState, AuthState>(
    (state) => state.auth
  );
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // on initial load - run auth check
    authCheck(router.asPath);

    // on route change start - hide page content by setting authorized to false
    const hideContent = () => setAuthorized(false);
    router.events.on("routeChangeStart", hideContent);

    // on route change complete - run auth check
    router.events.on("routeChangeComplete", authCheck);

    // unsubscribe from events in useEffect return function
    return () => {
      router.events.off("routeChangeComplete", authCheck);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function authCheck(url: string) {
    // redirect to login page if accessing a private page and not logged in
    const publicPaths = ["/login"];
    const path = url.split("?")[0];
    if (!currentUser && !publicPaths.includes(path)) {
      setAuthorized(false);
      router.push({
        pathname: "/login",
      });
    } else {
      setAuthorized(true);
    }
  }

  return <>{authorized && children}</>;
}
