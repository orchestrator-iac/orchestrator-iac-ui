import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import '@xyflow/react/dist/style.css';

import "./App.css";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { fas } from "@fortawesome/free-solid-svg-icons";

import { createBrowserRouter, RouterProvider } from "react-router-dom";


import { ThemeProvider } from "./components/shared/theme/ThemeContext";
import Home from "./components/home/Home";
import Resources from "./components/resources/Resources";
import Orchestrator from "./components/orchestrator/Orchestrator";
import Header from "./components/shared/header/Header";

// This exports the whole icon packs for Brand and Solid.
library.add(fab, fas);

const router = createBrowserRouter([
  {
    path: "/resources/:resource_id",
    element: <Resources />,
  },
  {
    path: "/orchestrator/:template_id",
    element: <Orchestrator />,
  },
  {
    path: "/home",
    element: <Home />,
  },
  {
    path: "/",
    element: <Home />,
  },
]);

const App = () => {
  return (
    <ThemeProvider>
      <Header />
      <div className="component-body">
        <RouterProvider router={router} />
      </div>
    </ThemeProvider>
  );
};

export default App;
