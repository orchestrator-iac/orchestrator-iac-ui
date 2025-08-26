import { useEffect, useState } from "react";
import { useThemeContext } from "../theme/useThemeContext";
import Grid from "@mui/material/Grid";
import CodeEditor from "./CodeEditor";

const toEditorValue = (val: any) => {
  if (val === null || val === undefined) return ""; // empty editor
  if (typeof val === "string") return val; // plain string
  try {
    return JSON.stringify(val, null, 2); // pretty JSON
  } catch {
    return String(val);
  }
};

export const CodeEditorField: React.FC<{
  value: any;
  placeholder?: string;
  errorMessage?: string;
  height?: string;
  required?: boolean;
}> = ({ value, placeholder, errorMessage, height, required }) => {
  const { mode } = useThemeContext();
  const [tempErrorMessage, setTempErrorMessage] = useState<string>("");
  const [resourceNodeTemp, setResourceNodeTemp] = useState<string>(
    toEditorValue(value)
  );

  useEffect(() => {
    console.log(resourceNodeTemp);
  }, [resourceNodeTemp]);

  useEffect(() => {
    if (required && resourceNodeTemp) {
      try {
        JSON.parse(resourceNodeTemp);
        setTempErrorMessage("");
      } catch (e: any) {
        console.error("Validation failed:", e);
        setTempErrorMessage(errorMessage ?? "Invalid JSON provided");
      }
    }
  }, [resourceNodeTemp]);

  return (
    <Grid size={12}>
      <CodeEditor
        value={resourceNodeTemp}
        onChange={setResourceNodeTemp}
        language="json"
        themeMode={mode}
        placeholder={placeholder}
        errorMessage={tempErrorMessage}
        height={height ?? "calc(50vh)"}
      />
    </Grid>
  );
};
