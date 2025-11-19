// TerraformTemplateTabs.tsx
import { Box, Tab, Tabs, Typography } from "@mui/material";
import React from "react";
import CodeEditor from "../../shared/code-editor/CodeEditor";
import { useThemeContext } from "../../shared/theme/useThemeContext";

export interface TerraformTemplateData {
  module: string;
  variables: string;
  outputs: string;
  tfvars: string;
}

interface TerraformTemplateProps {
  value: TerraformTemplateData;
  onChange: (fileType: keyof TerraformTemplateData, newContent: string) => void;
  showErrors?: boolean;
}

const tabNames: { label: string; key: keyof TerraformTemplateData }[] = [
  { label: "module.tf", key: "module" },
  { label: "variables.tf", key: "variables" },
  { label: "outputs.tf", key: "outputs" },
  { label: "terraform.tfvars", key: "tfvars" },
];

const TerraformTemplate: React.FC<TerraformTemplateProps> = ({
  value,
  onChange,
  showErrors = false,
}) => {
  const [activeTab, setActiveTab] = React.useState(0);
  const { mode } = useThemeContext();

  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newIndex) => setActiveTab(newIndex)}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              transition: 'all 0.3s ease',
              '&:hover': {
                color: 'primary.main',
                opacity: 1,
              },
            },
            '& .Mui-selected': {
              fontWeight: 600,
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
          }}
        >
          {tabNames.map((tab, index) => (
            <Tab
              key={tab.key}
              label={
                <>
                  {tab.label}
                  {showErrors && !value[tab.key]?.trim() && (
                    <Typography
                      color="error"
                      component="span"
                      ml={1}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                      }}
                    >
                      *
                    </Typography>
                  )}
                </>
              }
              id={`template-tab-${index}`}
              aria-controls={`template-tabpanel-${index}`}
              sx={{
                position: 'relative',
                color: (showErrors && !value[tab.key]?.trim()) ? 'error.main' : 'inherit',
              }}
            />
          ))}
        </Tabs>
      </Box>

      {tabNames.map((tab, index) => (
        <div
          key={tab.key}
          role="tabpanel"
          hidden={activeTab !== index}
          id={`template-tabpanel-${index}`}
          aria-labelledby={`template-tab-${index}`}
        >
          {activeTab === index && (
            <Box sx={{ padding: "10px 0" }}>
              <CodeEditor
                value={value[tab.key]}
                onChange={(newContent) => onChange(tab.key, newContent)}
                language="hcl"
                themeMode={mode}
                placeholder={`Enter ${tab.label} content...`}
                height="calc(100vh - 350px)"
              />
            </Box>
          )}
        </div>
      ))}
    </>
  );
};

export default TerraformTemplate;
