import { Outlet, useLocation } from "react-router-dom";
import Header from "../header/Header";

import styles from "./Layout.module.css";

const Layout = () => {
  const location = useLocation();
  const noHeaderRoutes = ["/login", "/register", "/register-success", "/confirm"];
  const hideHeader = noHeaderRoutes.includes(location.pathname);

  return (
    <>
      {!hideHeader && <Header />}
      <div className={styles.componentBody}>
        <Outlet />
      </div>
    </>
  );
};

export default Layout;
