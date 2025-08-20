// TerraformCore.tsx
import { Box, Tab, Tabs } from "@mui/material";
import React from "react";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

import CodeEditor from "../../shared/code-editor/CodeEditor";
import { useThemeContext } from "../../shared/theme/useThemeContext";

export type TerraformFileType = {
  main: string;
  variables: string;
  outputs: string;
};

export type TerraformFileKey = keyof TerraformFileType;

interface TerraformCoreProps {
  terraformFiles: TerraformFileType;
  onFileChange: (fileType: TerraformFileKey, content: string) => void;
  errors: Partial<Record<TerraformFileKey, string>>;
}

interface TerraformTabPanelProps {
  readonly index: number;
  readonly activeTabIndex: number;
  readonly fileContent: string;
  readonly onContentChange: (newContent: string) => void;
  readonly error?: string;
}

function TerraformTabPanel({
  index,
  activeTabIndex,
  fileContent,
  onContentChange,
  error,
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
        <Box sx={{ padding: "10px 0" }}>
          <CodeEditor
            value={fileContent}
            onChange={onContentChange}
            language="hcl"
            themeMode={mode}
            placeholder="Enter Terraform core code..."
            height="calc(100vh - 350px)"
          />
          {error && (
            <Box sx={{ mt: 2, color: "error.main", display: "flex", alignItems: "center" }}>
              <ErrorOutlineIcon sx={{ mr: 1 }} />
              <span>Please provide Terraform code.</span>
            </Box>
          )}
        </Box>
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

const TerraformCore: React.FC<TerraformCoreProps> = ({
  terraformFiles,
  onFileChange,
  errors,
}) => {
  const [activeTabIndex, setActiveTabIndex] = React.useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newIndex: number) => {
    setActiveTabIndex(newIndex);
  };

  const tabData: { label: string; key: TerraformFileKey }[] = [
    { label: "main.tf", key: "main" },
    { label: "variables.tf", key: "variables" },
    { label: "outputs.tf", key: "outputs" },
  ];

  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={activeTabIndex} onChange={handleTabChange}>
          {tabData.map(({ label, key }, index) => (
            <Tab
              key={key}
              label={label}
              {...a11yProps(index)}
              sx={{ color: errors[key] ? "error.main" : "inherit" }}
            />
          ))}
        </Tabs>
      </Box>

      {tabData.map(({ key }, index) => (
        <TerraformTabPanel
          key={key}
          activeTabIndex={activeTabIndex}
          index={index}
          fileContent={terraformFiles[key]}
          onContentChange={(newContent) => onFileChange(key, newContent)}
          error={errors[key]}
        />
      ))}
    </>
  );
};

export default TerraformCore;
