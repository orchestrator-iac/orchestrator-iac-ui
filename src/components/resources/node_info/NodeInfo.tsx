import CodeEditor from "../../shared/code_editor/CodeEditor";
import { useThemeContext } from "../../shared/theme/useThemeContext";

interface NodeInfoProps {
  resourceNode: string;
  setResourceNode: (value: string) => void;
}

const NodeInfo: React.FC<NodeInfoProps> = ({
  resourceNode,
  setResourceNode,
}) => {
  const { mode } = useThemeContext();

  const schema = {
    type: "string",
    component_name: "string",
    data: {
      header: {
        icon: "string",
        label: "string",
        sub_label: "string",
        info: "string",
      },
      footer: {
        notes: "string",
      },
      values: {
        use_ipam_pool: "string",
        enable_ipv6: "string",
        instance_tenancy: "string",
        tags: "object",
      },
      fields: [],
      handles: [],
    },
  };

  const getSuggestionsFromSchema = (
    path: string[]
  ): { caption: string; value: string; meta: string }[] => {
    let current: any = schema;
    for (const p of path) {
      if (current && typeof current === "object") {
        current = current[p];
      } else {
        return [];
      }
    }

    if (!current || typeof current !== "object") return [];

    return Object.keys(current).map((key) => ({
      caption: key,
      value: `"${key}": `,
      meta: "field",
    }));
  };

  const smartCompleter = {
    getCompletions: function (
      editor: any,
      session: any,
      pos: any,
      prefix: string,
      callback: Function
    ) {
      const lines = session.getValue().split("\n");
      const currentLine = lines[pos.row];
      const textBeforeCursor = currentLine.slice(0, pos.column);

      // crude way to guess the path (e.g. "data.values")
      const pathRegex = /"([a-zA-Z0-9_\.]+)"\s*:\s*{?\s*$/;
      const match = textBeforeCursor.match(pathRegex);

      let path: string[] = [];

      try {
        const jsonText = session.getValue();
        const linesUntilCursor = lines.slice(0, pos.row + 1);
        const stack: string[] = [];

        for (let line of linesUntilCursor) {
          const keyMatch = line.match(/"(\w+)"\s*:\s*{\s*$/);
          if (keyMatch) {
            stack.push(keyMatch[1]);
          }
          if (line.includes("}")) {
            stack.pop();
          }
        }

        path = stack;
      } catch (e) {
        console.warn("Path parsing failed:", e);
      }

      const suggestions = getSuggestionsFromSchema(path);

      callback(null, suggestions);
    },
  };

  return (
    <CodeEditor
      value={resourceNode}
      onChange={setResourceNode}
      language="json"
      themeMode={mode}
      completers={[smartCompleter]}
      placeholder="Enter resource node details here..."
    />
  );
};

export default NodeInfo;
