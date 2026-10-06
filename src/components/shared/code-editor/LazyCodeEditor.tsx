import { lazy, Suspense } from "react";
import Typography from "@mui/material/Typography";
import type { CodeEditorProps } from "./CodeEditor";

const CodeEditor = lazy(() => import("./CodeEditor"));

const LazyCodeEditor: React.FC<CodeEditorProps> = (props) => (
  <Suspense
    fallback={
      <Typography variant="body2" color="text.secondary">
        Loading code editor…
      </Typography>
    }
  >
    <CodeEditor {...props} />
  </Suspense>
);

export default LazyCodeEditor;
