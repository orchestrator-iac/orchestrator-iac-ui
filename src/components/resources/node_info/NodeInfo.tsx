import { useEffect, useState } from "react";

import { Box, Grid, Typography, useTheme } from "@mui/material";
import type { Ace } from "ace-builds";

import CodeEditor from "../../shared/code_editor/CodeEditor";
import { useThemeContext } from "../../shared/theme/useThemeContext";
import CustomNode from "../../orchestrator/CustomNode";
import { NodeInfoSchema } from "../../../types/node-info-schema";
import { NodeInfo as NodeInfoType } from "../../../types/node-info";

interface FormData {
  resourceId: string;
  cloudProvider: string;
  resourceName: string;
  terraformCorePath: string;
  terraformTemplatePath: string;
}

interface NodeInfoProps {
  formData: FormData;
  resourceNode: NodeInfoType | null;
  setResourceNode: (value: NodeInfoType | null) => void;
  onValidationChange: (isValid: boolean) => void;
}

const NodeInfo: React.FC<NodeInfoProps> = ({
  formData,
  resourceNode,
  setResourceNode,
  onValidationChange,
}) => {
  const theme = useTheme();
  const { mode } = useThemeContext();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [resourceNodeTemp, setResourceNodeTemp] = useState<string>(
    JSON.stringify(resourceNode, null, 2)
  );
  const default_info = {
    type: "customNode",
    component_name: formData.resourceId,
    data: {
      header: {
        icon: formData.resourceId,
        label: formData.resourceName,
        sub_label: formData.resourceName,
        info: `<><h2 style={{ borderBottom: "1px solid #eaeded" }}>${formData.resourceName}</h2><p>${formData.resourceName}</p><>`,
      },
      footer: {
        notes:
          "Note: Your Instances will launch in the {{default_info.region}} region.",
      },
      values: {
        use_ipam_pool: "false",
        enable_ipv6: "false",
        instance_tenancy: "default",
        tags: {},
      },
      fields: [],
      handles: [],
    },
  };

  useEffect(() => {
    if (resourceNodeTemp) {
      try {
        const parsed = JSON.parse(resourceNodeTemp);
        NodeInfoSchema.parse(parsed);
        setErrorMessage("");
        onValidationChange(true);
        setResourceNode(parsed);
      } catch (e: any) {
        console.error("Validation failed:", e);
        onValidationChange(false);
        setResourceNode(null);
        if (e.name === "ZodError") {
          setErrorMessage(
            e.errors
              ?.map((err: any) => `${err.path.join(".")}: ${err.message}`)
              .join("\n") || "Schema validation failed."
          );
        } else {
          setErrorMessage("Invalid JSON format. Please correct the syntax.");
        }
      }
    }
  }, [resourceNodeTemp]);

  const getSchemaSuggestions = (
    path: string[]
  ): { caption: string; value: string; meta: string }[] => {
    let current: any = default_info;
    for (const p of path) {
      if (current && typeof current === "object") {
        current = current[p];
      } else {
        return [];
      }
    }

    if (!current || typeof current !== "object") return [];

    return Object.keys(current).map((key) => {
      let valueToSuggest;
      if (typeof current[key] === "object" && current[key] !== null) {
        const spaces = 2 * (path.length + 2);
        valueToSuggest = JSON.stringify(current[key], null, spaces);
        valueToSuggest = valueToSuggest.replace(
          /\}$/,
          " ".repeat(spaces - 2) + "}"
        );
      } else {
        valueToSuggest = `"${current[key]}"`;
      }
      return {
        caption: key,
        value: `"${key}": ${valueToSuggest}`,
        meta: "field",
      };
    });
  };

  const customCompleter = {
    getCompletions(
      _editor: Ace.Editor,
      session: Ace.EditSession,
      pos: Ace.Point,
      _prefix: string,
      callback: (error: null, results: Ace.Completion[]) => void
    ) {
      const lines = session.getValue().split("\n");
      const indentSize = 2;

      const path = [];
      for (let i = pos.row - 1; i >= 0; i--) {
        const line = lines[i].trim();
        const regex = /^"([^"]+)":\s*{\s*$/;
        const match = regex.exec(line);

        if (match) {
          const indentLevel = lines[i].search(/\S|$/) / indentSize;
          path.unshift(match[1]);
          if (indentLevel === 0) break;
        }
      }

      const suggestions = getSchemaSuggestions(path);
      callback(null, suggestions);
    },
  };

  return (
    <Box sx={{ flexGrow: 1, padding: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <CodeEditor
            value={resourceNodeTemp}
            onChange={setResourceNodeTemp}
            language="json"
            themeMode={mode}
            completers={[customCompleter]}
            placeholder="Enter resource node details here..."
            errorMessage={errorMessage}
            height="calc(100vh - 180px)"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          {(() => {
            const isDarkMode = theme.palette.mode === "dark";
            const hasData = !!resourceNode?.data;
            let previewBgColor: string;

            if (hasData) {
              previewBgColor = "transparent";
            } else if (isDarkMode) {
              previewBgColor = theme.palette.grey[900];
            } else {
              previewBgColor = theme.palette.grey[100];
            }

            return (
              <Box
                sx={{
                  height: "calc(100vh - 180px)",
                  overflowY: "auto",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: previewBgColor,
                }}
              >
                {hasData ? (
                  <CustomNode data={resourceNode.data} isOrchestrator={false} />
                ) : (
                  <Box textAlign="center">
                    <Typography variant="body1" color="error" fontWeight="bold">
                      Invalid JSON or schema validation failed.
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Please correct the input to display the preview.
                    </Typography>
                  </Box>
                )}
              </Box>
            );
          })()}
        </Grid>
      </Grid>
    </Box>
  );
};

export default NodeInfo;
