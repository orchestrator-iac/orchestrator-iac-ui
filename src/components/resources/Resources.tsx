// Resources.tsx
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
  Snackbar,
  Alert,
} from "@mui/material";
import BasicInfo from "./basic_info/BasicInfo";
import NodeInfo from "./node_info/NodeInfo";
import { NodeInfo as NodeInfoType } from "../../types/node-info";
import { useForm, FormProvider } from "react-hook-form";
import TerraformCore, {
  TerraformFileKey,
  TerraformFileType,
} from "./terraform_core/TerraformCore";
import TerraformTemplate, {
  TerraformTemplateData,
} from "./terraform_template/TerraformTemplate";
import apiService from "../../services/apiService";

const steps = [
  "Basic Info",
  "Node Info",
  "Terraform Core",
  "Terraform Template",
];

const Resources: React.FC = () => {
  const theme = useTheme();
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const [activeStep, setActiveStep] = React.useState(0);
  const [resourceNode, setResourceNode] = React.useState<NodeInfoType | null>(
    null
  );
  const [resourceNodeValid, setResourceNodeValid] = React.useState(true);
  const [terraformFiles, setTerraformFiles] = React.useState<TerraformFileType>(
    {
      main: "",
      variables: "",
      outputs: "",
    }
  );
  const [terraformErrors, setTerraformErrors] = React.useState<
    Partial<Record<TerraformFileKey, string>>
  >({});
  const [templateFiles, setTemplateFiles] =
    React.useState<TerraformTemplateData>({
      module: "",
      variables: "",
      outputs: "",
      tfvars: "",
    });
  const [templateValid, setTemplateValid] = React.useState(true);
  const methods = useForm({
    defaultValues: {
      resourceId: "",
      cloudProvider: "",
      resourceName: "",
      resourceVersion: "",
      resourceDescription: "",
      terraformCorePath: "",
      terraformTemplatePath: "",
    },
    mode: "onTouched",
  });

  const { trigger } = methods;

  useEffect(() => {
    document.body.setAttribute("data-theme", theme.palette.mode);
  }, [theme.palette.mode]);

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const validateTemplateFiles = () => {
    const allFilled = Object.values(templateFiles).every(
      (content) => content.trim() !== ""
    );
    setTemplateValid(allFilled);
    return allFilled;
  };

  const onNext = async () => {
    switch (activeStep) {
      case 0: {
        const valid = await trigger();
        if (valid) {
          setActiveStep((prev) => prev + 1);
        } else {
          showSnackbar("Please fill all required fields.", "error");
        }
        break;
      }
      case 1: {
        if (resourceNodeValid) {
          setActiveStep((prev) => prev + 1);
        } else {
          showSnackbar("Please fix the node info validation errors.", "error");
        }
        break;
      }
      case 2: {
        const errors: Partial<Record<TerraformFileKey, string>> = {};
        (Object.keys(terraformFiles) as TerraformFileKey[]).forEach((key) => {
          if (!terraformFiles[key].trim()) {
            errors[key] = `${key}.tf is required`;
          }
        });

        setTerraformErrors(errors);
        if (Object.keys(errors).length === 0) {
          setActiveStep((prev) => prev + 1);
        } else {
          showSnackbar("Please fill all Terraform core files.", "error");
        }
        break;
      }
      case 3: {
        const valid = validateTemplateFiles();
        if (valid) {
          onSubmit(methods.getValues());
        } else {
          showSnackbar(
            "Please fill all template files before submitting.",
            "error"
          );
        }
        break;
      }
      default:
        showSnackbar("Invalid configuration. Please fix it.", "error");
        break;
    }
  };

  const onBack = () => setActiveStep((prev) => prev - 1);

  const handleFileChange = (fileType: TerraformFileKey, content: string) => {
    setTerraformFiles((prev) => ({ ...prev, [fileType]: content }));
    setTerraformErrors((prev) => ({ ...prev, [fileType]: undefined }));
  };

  const onSubmit = async (data: any) => {
    const fullData = {
      ...data,
      resourceNode,
      terraformCore: terraformFiles,
      terraformTemplate: templateFiles,
    };
    console.log("Final payload", fullData);

    try {
      const response = await apiService.post("/configs", fullData, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Response from API:", response);
      console.log("Success!");
      showSnackbar("Configuration saved successfully!", "success");
    } catch (error: any) {
      console.error("Submission error:", error);
      if (error?.response?.status === 409) {
        showSnackbar(
          "Config with this resourceId and version already exists.",
          "error"
        );
      } else {
        showSnackbar("Failed to save configuration.", "error");
      }
    }
  };

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
            onFileChange={handleFileChange}
            errors={terraformErrors}
          />
        );
      case 3:
        return (
          <TerraformTemplate
            value={templateFiles}
            onChange={(file, content) =>
              setTemplateFiles((prev) => ({ ...prev, [file]: content }))
            }
            showErrors={!templateValid}
          />
        );
      default:
        return <Typography>Unknown Step</Typography>;
    }
  };

  return (
    <FormProvider {...methods}>
      <form>
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

          <Box mt={1} display="flex" justifyContent="space-between">
            <Button disabled={activeStep === 0} onClick={onBack}>
              Back
            </Button>

            <Button variant="contained" onClick={onNext}>
              {activeStep === steps.length - 1 ? "Finish" : "Next"}
            </Button>
          </Box>
        </Paper>
      </form>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </FormProvider>
  );
};

export default Resources;
