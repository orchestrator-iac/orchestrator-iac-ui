import { Box, Tab, Tabs } from "@mui/material";
import React from "react";
import CodeEditor from "../../shared/code_editor/CodeEditor";
import { useThemeContext } from "../../shared/theme/useThemeContext";

interface TerraformTabPanelProps {
  readonly index: number;
  readonly activeTabIndex: number;
  readonly fileContent: string;
  readonly onContentChange: (newContent: string) => void;
}

function TerraformTabPanel({
  index,
  activeTabIndex,
  fileContent,
  onContentChange,
}: TerraformTabPanelProps) {
  const { mode } = useThemeContext();

  return (
    <div
      role="tabpanel"
      hidden={activeTabIndex !== index}
      id={`terraform-tabpanel-${index}`}
      aria-labelledby={`terraform-tab-${index}`}
    >
      {activeTabIndex === index && (
        <CodeEditor
          value={fileContent}
          onChange={onContentChange}
          language="hcl"
          themeMode={mode}
          placeholder="Enter Terraform code..."
          height="calc(100vh - 350px)"
        />
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `terraform-tab-${index}`,
    "aria-controls": `terraform-tabpanel-${index}`,
  };
}

const TerraformEditorTabs: React.FC = () => {
  const [activeTabIndex, setActiveTabIndex] = React.useState(0);
  const [terraformFiles, setTerraformFiles] = React.useState({
    main: "",
    variables: "",
    outputs: "",
  });

  const handleTabChange = (_event: React.SyntheticEvent, newIndex: number) => {
    setActiveTabIndex(newIndex);
  };

  const handleFileContentChange = (fileType: keyof typeof terraformFiles) => (newContent: string) => {
    setTerraformFiles((prevFiles) => ({
      ...prevFiles,
      [fileType]: newContent,
    }));
  };

  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={activeTabIndex}
          onChange={handleTabChange}
          aria-label="Terraform file tabs"
        >
          <Tab label="main.tf" {...a11yProps(0)} />
          <Tab label="variables.tf" {...a11yProps(1)} />
          <Tab label="outputs.tf" {...a11yProps(2)} />
        </Tabs>
      </Box>

      <TerraformTabPanel
        activeTabIndex={activeTabIndex}
        index={0}
        fileContent={terraformFiles.main}
        onContentChange={handleFileContentChange("main")}
      />
      <TerraformTabPanel
        activeTabIndex={activeTabIndex}
        index={1}
        fileContent={terraformFiles.variables}
        onContentChange={handleFileContentChange("variables")}
      />
      <TerraformTabPanel
        activeTabIndex={activeTabIndex}
        index={2}
        fileContent={terraformFiles.outputs}
        onContentChange={handleFileContentChange("outputs")}
      />
    </>
  );
};

export default TerraformEditorTabs;
