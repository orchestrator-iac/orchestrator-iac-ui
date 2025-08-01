import React, { useEffect, useState } from "react";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Paper,
  useTheme,
  SelectChangeEvent,
} from "@mui/material";
import BasicInfo from "./basic_info/BasicInfo";
import NodeInfo from "./node_info/NodeInfo";

const steps = [
  "Basic Info",
  "Node Info",
  "Terraform Core",
  "Terraform Template",
];

const Resources: React.FC = () => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    id: "",
    cloudProvider: "",
    resourceName: "",
    terraformCorePath: "",
    terraformTemplatePath: "",
  });

  useEffect(() => {
    document.body.setAttribute("data-theme", theme.palette.mode);
  }, [theme.palette.mode]);

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const [resourceNode, setResourceNode] = useState('{\n  "example": true\n}');

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <BasicInfo formData={formData} handleChange={handleChange} />;

      case 1:
        return (
          <NodeInfo
            resourceNode={resourceNode}
            setResourceNode={setResourceNode}
          ></NodeInfo>
        );

      case 2:
        return (
          <Typography color={theme.palette.text.primary}>
            Terraform Core details go here
          </Typography>
        );

      case 3:
        return (
          <Typography color={theme.palette.text.primary}>
            Terraform Template details go here
          </Typography>
        );

      default:
        return <Typography>Unknown Step</Typography>;
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        m: 4,
        p: 4,
        borderRadius: 2,
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
      }}
    >
      <Stepper
        activeStep={activeStep}
        alternativeLabel
        sx={{
          "& .MuiStepLabel-label": {
            color: theme.palette.text.secondary,
          },
          "& .MuiStepIcon-root.Mui-active": {
            color: theme.palette.primary.main,
          },
        }}
      >
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box mt={4}>{renderStepContent(activeStep)}</Box>

      <Box mt={4} display="flex" justifyContent="space-between">
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          sx={{ color: theme.palette.primary.main }}
        >
          Back
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleNext}
          disabled={activeStep === steps.length - 1}
          sx={{
            backgroundColor: theme.palette.primary.main,
            "&:hover": {
              backgroundColor: theme.palette.primary.dark,
            },
          }}
        >
          {activeStep === steps.length - 1 ? "Finish" : "Next"}
        </Button>
      </Box>
    </Paper>
  );
};

export default Resources;
