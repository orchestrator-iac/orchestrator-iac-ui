import React from "react";
import { Box, Tab, Tabs } from "@mui/material";
import CodeEditor from "../../shared/code_editor/CodeEditor";
import { useThemeContext } from "../../shared/theme/useThemeContext";

type TerraformFileType = {
  main: string;
  variables: string;
  outputs: string;
};

interface TerraformCoreProps {
  terraformFiles: TerraformFileType;
  onFileChange: (fileType: keyof TerraformFileType, content: string) => void;
}

const TerraformCore: React.FC<TerraformCoreProps> = ({
  terraformFiles,
  onFileChange,
}) => {
  const [activeTabIndex, setActiveTabIndex] = React.useState(0);
  const { mode } = useThemeContext();

  const handleTabChange = (_: React.SyntheticEvent, newIndex: number) => {
    setActiveTabIndex(newIndex);
  };

  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={activeTabIndex} onChange={handleTabChange}>
          <Tab label="main.tf" />
          <Tab label="variables.tf" />
          <Tab label="outputs.tf" />
        </Tabs>
      </Box>

      {["main", "variables", "outputs"].map((type, index) => (
        <div key={type} role="tabpanel" hidden={activeTabIndex !== index}>
          {activeTabIndex === index && (
            <Box sx={{ p: 3 }}>
              <CodeEditor
                value={terraformFiles[type as keyof typeof terraformFiles]}
                onChange={(content) =>
                  onFileChange(type as keyof typeof terraformFiles, content)
                }
                language="hcl"
                themeMode={mode}
                placeholder={`Enter ${type}.tf content...`}
                height="calc(100vh - 350px)"
              />
            </Box>
          )}
        </div>
      ))}
    </>
  );
};

export default TerraformCore;
