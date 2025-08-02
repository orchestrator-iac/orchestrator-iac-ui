import React, { useEffect } from "react";
import AceEditor from "react-ace";
import * as ace from "ace-builds";
import styles from "./CodeEditor.module.css";
import { Box, Typography } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string; // e.g. "json", "yaml", "javascript"
  themeMode?: "light" | "dark"; // used to determine the theme
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
  const theme = themeMode === "dark" ? "monokai" : "github";
  const containerClass =
    themeMode === "dark" ? styles.darkTheme : styles.lightTheme;

  useEffect(() => {
    const langTools = ace.require("ace/ext/language_tools");
    langTools.setCompleters([]);

    for (const completer of completers) {
      langTools.addCompleter(completer);
    }
  }, [completers]);

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
