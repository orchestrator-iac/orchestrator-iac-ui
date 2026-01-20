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
  Snackbar,
  Alert,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { fetchResourceById } from "../../store/resourceSlice";
import { useForm, FormProvider } from "react-hook-form";

import BasicInfo from "./basic_info/BasicInfo";
import NodeInfo from "./node_info/NodeInfo";
import { NodeInfo as NodeInfoType } from "../../types/node-info";
import TerraformCore, {
  TerraformFileKey,
  TerraformFileType,
} from "./terraform_core/TerraformCore";
import TerraformTemplate, {
  TerraformTemplateData,
} from "./terraform_template/TerraformTemplate";
import apiService from "../../services/apiService";
import { useAuth } from "../../context/AuthContext";
import ModificationPopup from "./modification/ModificationPopup";

const steps = [
  "Basic Info",
  "Node Info",
  "Terraform Core",
  "Terraform Template",
];

const Resources: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();

  const { resource_id } = useParams();
  const dispatch = useDispatch<AppDispatch>();

  const resourceData = useSelector((state: RootState) =>
    resource_id ? state.resource.resources[resource_id] : null,
  );
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [resourceNode, setResourceNode] = useState<NodeInfoType | null>(null);
  const [resourceNodeValid, setResourceNodeValid] = useState(true);
  const [terraformFiles, setTerraformFiles] = useState<TerraformFileType>({
    main: "",
    variables: "",
    outputs: "",
  });
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
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const methods = useForm({
    defaultValues: {
      resourceId: "",
      cloudProvider: "",
      resourceName: "",
      resourceVersion: "",
      resourceDescription: "",
      terraformCorePath: "",
      terraformTemplatePath: "",
      resourceIcon: {
        id: "",
        url: "",
      },
      modifiedHistory: [],
    },
    mode: "onTouched",
  });

  const { trigger } = methods;

  // theme switch sync
  useEffect(() => {
    document.body.dataset.theme = theme.palette.mode;
    // Restore body scroll for Resources page
    document.body.style.overflow = "auto";
  }, [theme.palette.mode]);

  useEffect(() => {
    if (resource_id && resource_id !== "new") {
      dispatch(fetchResourceById(resource_id));
    }
  }, [resource_id, dispatch]);

  // set form + local state when resourceData is loaded
  useEffect(() => {
    if (resourceData) {
      methods.reset({
        resourceId: resourceData.resourceId || "",
        cloudProvider: resourceData.cloudProvider || "",
        resourceName: resourceData.resourceName || "",
        resourceVersion: resourceData.resourceVersion || "",
        resourceDescription: resourceData.resourceDescription || "",
        resourceIcon: resourceData.resourceIcon || {
          id: "",
          url: "",
        },
        terraformCorePath: resourceData.terraformCorePath || "",
        terraformTemplatePath: resourceData.terraformTemplatePath || "",
        modifiedHistory: resourceData.modifiedHistory || [],
      });

      setTerraformFiles(
        resourceData.terraformCore || {
          main: "",
          variables: "",
          outputs: "",
        },
      );

      setTemplateFiles(
        resourceData.terraformTemplate || {
          module: "",
          variables: "",
          outputs: "",
          tfvars: "",
        },
      );

      setResourceNode(resourceData.resourceNode || null);
    }
  }, [resourceData, methods]);

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const validateTemplateFiles = () => {
    const allFilled = Object.values(templateFiles).every(
      (content) => content.trim() !== "",
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
          setOpen(true);
        } else {
          showSnackbar(
            "Please fill all template files before submitting.",
            "error",
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

  const onSubmit = async () => {
    const prevHistory = resourceData?.modifiedHistory ?? [];
    const fullData = {
      ...methods.getValues(),
      resourceNode,
      terraformCore: terraformFiles,
      terraformTemplate: templateFiles,
      publishedBy: resource_id === "new" ? user?._id : null,
      publishedAt: resource_id === "new" ? new Date().toISOString() : null,
      modifiedHistory: [
        ...prevHistory,
        {
          modifiedBy: user?._id,
          modifiedAt: new Date().toISOString(),
          changeDescription: description,
        },
      ],
    };
    console.log("Final payload", fullData);

    try {
      const method = resource_id !== "new" ? "put" : "post";
      const url =
        resource_id !== "new" ? `/configs/${resource_id}` : "/configs";

      const response = await apiService[method](url, fullData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Response from API:", response);
      showSnackbar("Configuration saved successfully!", "success");
      navigate("/home");
    } catch (error: any) {
      console.error("Submission error:", error);
      if (error?.response?.status === 409) {
        showSnackbar(
          "Config with this resourceId and version already exists.",
          "error",
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
        <Box
          sx={{
            maxWidth: "1400px",
            margin: "0 auto",
            px: { xs: 2, sm: 3, md: 4 },
            py: 4,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4, md: 5 },
              borderRadius: 3,
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary,
              border: "1px solid",
              borderColor:
                theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.08)"
                  : "rgba(0, 0, 0, 0.06)",
              boxShadow:
                theme.palette.mode === "dark"
                  ? "0 4px 20px rgba(0, 0, 0, 0.3)"
                  : "0 4px 20px rgba(0, 0, 0, 0.08)",
            }}
          >
            <Stepper
              activeStep={activeStep}
              alternativeLabel
              sx={{
                mb: 4,
                "& .MuiStepLabel-label": {
                  fontWeight: 500,
                  fontSize: "0.95rem",
                },
                "& .MuiStepLabel-label.Mui-active": {
                  fontWeight: 600,
                  color: theme.palette.mode === "dark" ? "#7dd3d3" : "#1a5757",
                },
                "& .MuiStepLabel-label.Mui-completed": {
                  fontWeight: 500,
                },
                "& .MuiStepIcon-root": {
                  fontSize: "2rem",
                },
                "& .MuiStepIcon-root.Mui-active": {
                  color: theme.palette.mode === "dark" ? "#4bbebe" : "#1a5757",
                },
                "& .MuiStepIcon-root.Mui-completed": {
                  color: theme.palette.mode === "dark" ? "#4bbebe" : "#3da9a9",
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

            <Box
              mt={4}
              pt={3}
              display="flex"
              justifyContent="space-between"
              borderTop="1px solid"
              borderColor={
                theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.08)"
                  : "rgba(0, 0, 0, 0.06)"
              }
            >
              <Button
                disabled={activeStep === 0}
                onClick={onBack}
                sx={{
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: "0.95rem",
                  "&:hover": {
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(0, 0, 0, 0.04)",
                  },
                }}
              >
                Back
              </Button>

              <Button
                variant="contained"
                onClick={onNext}
                sx={{
                  px: 4,
                  py: 1,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  backgroundColor:
                    theme.palette.mode === "dark" ? "#4bbebe" : "#1a5757",
                  boxShadow:
                    theme.palette.mode === "dark"
                      ? "0 4px 12px rgba(75, 190, 190, 0.3)"
                      : "0 4px 12px rgba(26, 87, 87, 0.2)",
                  "&:hover": {
                    backgroundColor:
                      theme.palette.mode === "dark" ? "#7dd3d3" : "#205a5a",
                    boxShadow:
                      theme.palette.mode === "dark"
                        ? "0 6px 16px rgba(75, 190, 190, 0.4)"
                        : "0 6px 16px rgba(26, 87, 87, 0.3)",
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                {activeStep === steps.length - 1 ? "Finish" : "Next"}
              </Button>
            </Box>
          </Paper>
        </Box>
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
      <ModificationPopup
        open={open}
        setOpen={setOpen}
        description={description}
        setDescription={setDescription}
        onSubmit={onSubmit}
      />
    </FormProvider>
  );
};

export default Resources;
