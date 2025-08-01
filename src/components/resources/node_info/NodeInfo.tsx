import { useEffect, useState } from "react";
import CodeEditor from "../../shared/code_editor/CodeEditor";
import { useThemeContext } from "../../shared/theme/useThemeContext";

interface FormData {
  id: string;
  cloudProvider: string;
  resourceName: string;
  terraformCorePath: string;
  terraformTemplatePath: string;
}

interface NodeInfoProps {
  formData: FormData;
  resourceNode: string;
  setResourceNode: (value: string) => void;
}

const NodeInfo: React.FC<NodeInfoProps> = ({
  formData,
  resourceNode,
  setResourceNode,
}) => {
  const { mode } = useThemeContext();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const default_info = {
    type: "customNode",
    component_name: formData.id,
    data: {
      header: {
        icon: formData.id,
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
    if (resourceNode) {
      try {
        JSON.parse(resourceNode);
        setErrorMessage("");
      } catch (e) {
        console.error("Failed to parse resourceNode JSON:", e);
        setErrorMessage("Invalid JSON format. Please correct the syntax.");
      }
    }
  }, [resourceNode]);

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
        ); // Add indentation for closing brace
      } else {
        valueToSuggest = `"${current[key]}"`; // Otherwise, keep it as a string literal
      }
      console.log("key", key, "valueToSuggest", valueToSuggest);
      return {
        caption: key,
        value: `"${key}": ${valueToSuggest}`,
        meta: "field",
      };
    });
  };

  const customCompleter = {
    getCompletions(editor, session, pos, prefix, callback) {
      const lines = session.getValue().split("\n");
      const indentSize = 2;

      const path = [];
      for (let i = pos.row - 1; i >= 0; i--) {
        const line = lines[i].trim();
        const match = line.match(/^"([^"]+)":\s*{\s*$/);

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
    <CodeEditor
      value={resourceNode}
      onChange={setResourceNode}
      language="json"
      themeMode={mode}
      completers={[customCompleter]}
      placeholder="Enter resource node details here..."
      errorMessage={errorMessage}
    />
  );
};

export default NodeInfo;
