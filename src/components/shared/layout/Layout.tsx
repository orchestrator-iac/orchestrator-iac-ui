import { Outlet } from "react-router-dom";

import styles from "./Layout.module.css";

const Layout = () => {
  return (
    <div className={styles.componentBody}>
      <Outlet />
    </div>
  );
};

export default Layout;
