import React, { useEffect } from "react";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Paper,
  useTheme,
} from "@mui/material";
import BasicInfo from "./basic_info/BasicInfo";
import NodeInfo from "./node_info/NodeInfo";
import { NodeInfo as NodeInfoType } from "../../types/node-info";
import { useForm, FormProvider } from "react-hook-form";
import TerraformCore from "./terraform_core/TerraformCore";

const steps = [
  "Basic Info",
  "Node Info",
  "Terraform Core",
  "Terraform Template",
];

const Resources: React.FC = () => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = React.useState(0);
  const [resourceNode, setResourceNode] = React.useState<NodeInfoType | null>(
    null
  );
  const [resourceNodeValid, setResourceNodeValid] = React.useState(true);

  const methods = useForm({
    defaultValues: {
      id: "",
      cloudProvider: "",
      resourceName: "",
      terraformCorePath: "",
      terraformTemplatePath: "",
    },
    mode: "onTouched",
  });

  const { handleSubmit, trigger } = methods;

  const [terraformFiles, setTerraformFiles] = React.useState({
    main: "",
    variables: "",
    outputs: "",
  });

  useEffect(() => {
    document.body.setAttribute("data-theme", theme.palette.mode);
  }, [theme.palette.mode]);

  const handleTerraformFileChange = (
    fileType: keyof typeof terraformFiles,
    content: string
  ) => {
    setTerraformFiles((prev) => ({ ...prev, [fileType]: content }));
  };

  const validateTerraformFiles = () => {
    const { main, variables, outputs } = terraformFiles;
    return (
      main.trim().length > 0 &&
      variables.trim().length > 0 &&
      outputs.trim().length > 0
    );
  };

  const onNext = async () => {
    switch (activeStep) {
      case 0: {
        const valid = await trigger();
        if (valid) setActiveStep((prev) => prev + 1);
        break;
      }
      case 1: {
        if (resourceNodeValid) setActiveStep((prev) => prev + 1);
        break;
      }
      case 2: {
        if (validateTerraformFiles()) {
          setActiveStep((prev) => prev + 1);
        }
        break;
      }
      default: {
        setActiveStep((prev) => prev + 1);
        break;
      }
    }
  };

  const onBack = () => setActiveStep((prev) => prev - 1);

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <BasicInfo />;
      case 1:
        return (
          <NodeInfo
            formData={methods.getValues()}
            resourceNode={resourceNode}
            setResourceNode={setResourceNode}
            onValidationChange={setResourceNodeValid}
          />
        );
      case 2:
        return (
          <TerraformCore
            terraformFiles={terraformFiles}
            onFileChange={handleTerraformFileChange}
          />
        );
      case 3:
        return <Typography>Terraform Template details go here</Typography>;
      default:
        return <Typography>Unknown Step</Typography>;
    }
  };

  const onSubmit = (data: any) => {
    console.log("Final form data:", data);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
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
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box mt={4}>{renderStepContent(activeStep)}</Box>

          <Box mt={4} display="flex" justifyContent="space-between">
            <Button disabled={activeStep === 0} onClick={onBack}>
              Back
            </Button>

            {activeStep === steps.length - 1 ? (
              <Button variant="contained" type="submit">
                Finish
              </Button>
            ) : (
              <Button variant="contained" onClick={onNext}>
                Next
              </Button>
            )}
          </Box>
        </Paper>
      </form>
    </FormProvider>
  );
};

export default Resources;
