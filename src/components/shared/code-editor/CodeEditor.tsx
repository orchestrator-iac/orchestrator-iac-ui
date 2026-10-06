import React, { useEffect } from "react";
import AceEditor from "react-ace";
import * as ace from "ace-builds";

import workerJsonUrl from "ace-builds/src-noconflict/worker-json?url";
import workerJavascriptUrl from "ace-builds/src-noconflict/worker-javascript?url";
import workerYamlUrl from "ace-builds/src-noconflict/worker-yaml?url";

import styles from "./CodeEditor.module.css";
import { Box, Typography, useMediaQuery } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { ThemeMode } from "../theme/ThemeContext";

ace.config.setModuleUrl("ace/mode/json_worker", workerJsonUrl);
ace.config.setModuleUrl("ace/mode/javascript_worker", workerJavascriptUrl);
ace.config.setModuleUrl("ace/mode/yaml_worker", workerYamlUrl);

const aceExtensionsReady = Promise.all([
  import("ace-builds/src-noconflict/mode-json"),
  import("ace-builds/src-noconflict/mode-text"),
  import("ace-builds/src-noconflict/mode-yaml"),
  import("ace-builds/src-noconflict/mode-javascript"),
  import("ace-builds/src-noconflict/mode-sh"),
  import("ace-builds/src-noconflict/theme-monokai"),
  import("ace-builds/src-noconflict/theme-github"),
  import("ace-builds/src-noconflict/ext-language_tools"),
  import("ace-builds/src-noconflict/ext-searchbox"),
  import("ace-builds/src-noconflict/ext-beautify"),
]);

export interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string; // e.g. "json", "yaml", "javascript"
  themeMode?: ThemeMode; // used to determine the theme
  height?: string;
  width?: string;
  readOnly?: boolean;
  placeholder?: string;
  completers?: any[];
  errorMessage?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language = "json",
  themeMode = "light",
  height = "calc(100vh - 350px)",
  width = "100%",
  readOnly = false,
  placeholder = "",
  completers = [],
  errorMessage = "",
}) => {
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");

  let effectiveMode = themeMode;
  if (themeMode === "system") {
    effectiveMode = prefersDark ? "dark" : "light";
  }

  const theme = effectiveMode === "dark" ? "monokai" : "github";
  const containerClass =
    effectiveMode === "dark" ? styles.darkTheme : styles.lightTheme;

  const [aceReady, setAceReady] = React.useState(false);

  useEffect(() => {
    let active = true;
    void aceExtensionsReady.then(() => {
      if (active) setAceReady(true);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!aceReady) return;

    const langTools = ace.require("ace/ext/language_tools");
    langTools.setCompleters([]);

    for (const completer of completers) {
      langTools.addCompleter(completer);
    }
  }, [aceReady, completers]);

  if (!aceReady) {
    return (
      <Typography variant="body2" color="text.secondary">
        Loading code editor…
      </Typography>
    );
  }

  return (
    <>
      <div className={`${styles.editorWrapper} ${containerClass}`}>
        <AceEditor
          mode={language}
          theme={theme}
          value={value}
          onChange={onChange}
          name="shared-code-editor"
          editorProps={{ $blockScrolling: true }}
          fontSize={18}
          showPrintMargin={false}
          showGutter={true}
          highlightActiveLine={true}
          setOptions={{
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            enableSnippets: true,
            showLineNumbers: true,
            tabSize: 2,
          }}
          readOnly={readOnly}
          height={height}
          width={width}
          placeholder={placeholder}
        />
      </div>
      {errorMessage && (
        <Box display="flex" alignItems="center" color="error.main" mt={1}>
          <ErrorOutlineIcon sx={{ mr: 1 }} />
          <Typography variant="body2">{errorMessage}</Typography>
        </Box>
      )}
    </>
  );
};

export default CodeEditor;
