import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import * as ace from "ace-builds";

import { store } from "./store";
import App from "./App";
import { DnDProvider } from "./components/orchestrator/sidebar/DnDContext";

import workerJsonUrl from "ace-builds/src-noconflict/worker-json?url";
import workerJavascriptUrl from "ace-builds/src-noconflict/worker-javascript?url";
import workerYamlUrl from "ace-builds/src-noconflict/worker-yaml?url";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/mode-text";
import "ace-builds/src-noconflict/mode-yaml";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-sh";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/ext-searchbox";
import "ace-builds/src-noconflict/ext-beautify";
import "./index.css";

ace.config.setModuleUrl("ace/mode/json_worker", workerJsonUrl);
ace.config.setModuleUrl("ace/mode/javascript_worker", workerJavascriptUrl);
ace.config.setModuleUrl("ace/mode/yaml_worker", workerYamlUrl);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <DnDProvider>
      <Provider store={store}>
        <App />
      </Provider>
    </DnDProvider>
  </React.StrictMode>,
);
