import React, { useEffect } from "react";
import AceEditor from "react-ace";
import * as ace from "ace-builds";
import styles from "./CodeEditor.module.css";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string; // e.g. "json", "yaml", "javascript"
  themeMode?: "light" | "dark"; // used to determine the theme
  height?: string;
  width?: string;
  readOnly?: boolean;
  placeholder?: string;
  completers?: any[]; // custom completers for autocompletion
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
}) => {
  const theme = themeMode === "dark" ? "monokai" : "github";
  const containerClass =
    themeMode === "dark"
      ? styles.darkTheme
      : styles.lightTheme;
  
  useEffect(() => {
    const langTools = ace.require("ace/ext/language_tools");
    langTools.setCompleters([]);

    for (const completer of completers) {
      langTools.addCompleter(completer);
    }
  }, [completers])

  // useEffect(() => {
  //   const customCompleter = {
  //     getCompletions: function (editor, session, pos, prefix, callback) {
  //       const wordList = [
  //         { caption: "vpc_name", value: "vpc_name", meta: "field" },
  //         { caption: "cidr", value: "cidr", meta: "field" },
  //         { caption: "tags", value: "tags", meta: "section" }
  //       ];
  //       callback(null, wordList.map((w) => ({
  //         caption: w.caption,
  //         value: w.value,
  //         meta: w.meta,
  //       })));
  //     },
  //   };
  //   ace.require("ace/ext/language_tools").addCompleter(customCompleter);
  // }, ["vpc_name", "cidr", "instance_tenancy"]);

  return (
    <div className={`${styles.editorWrapper} ${containerClass}`}>
      <AceEditor
        mode={language}
        theme={theme}
        value={value}
        onChange={onChange}
        name="shared-code-editor"
        editorProps={{ $blockScrolling: true }}
        fontSize={14}
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
  );
};

export default CodeEditor;
