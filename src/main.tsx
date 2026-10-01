import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";

import { store } from "./store";
import App from "./App";
import { DnDProvider } from "./components/orchestrator/sidebar/DnDContext";

import "./index.css";
import "./components/shared/theme/design-tokens.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <DnDProvider>
      <Provider store={store}>
        <App />
      </Provider>
    </DnDProvider>
  </React.StrictMode>,
);
