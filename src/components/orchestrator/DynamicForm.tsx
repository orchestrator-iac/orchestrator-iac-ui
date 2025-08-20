import React, { useState } from "react";
import {
  Card,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  Button,
  FormControl,
  Tooltip,
  IconButton,
  Grid,
  Typography,
  Box,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import parse from "html-react-parser";
import { Field, FieldGroup } from "../../types/node-info";
import CodeEditor from "../shared/code_editor/CodeEditor";
import { useThemeContext } from "../shared/theme/useThemeContext";

type Values = {
  [x: string]: any;
};

type Props = {
  config: FieldGroup[];
  values?: Values;
};

const DynamicForm: React.FC<Props> = ({ config, values }) => {
  const theme = useTheme();
  const { mode } = useThemeContext();
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validCondition = (field: Field, values: Values = {}): boolean => {
    if (field?.depends_on) {
      const conditionMet = new Function(
        "values",
        `return ${field.depends_on};`
      )(values);
      if (!conditionMet) return false;
    }
    return true;
  };

  const renderInfo = (info?: string | JSX.Element) => {
    if (!info) return null;
    return typeof info === "string" ? parse(info) : info;
  };

  const renderField = (field: Field) => {
    const {
      name,
      type,
      required,
      value,
      options,
      placeholder,
      hint,
      error_text,
      config,
    } = field;

    switch (type) {
      case "text":
        return (
          <TextField
            fullWidth
            required={!!required}
            value={formData[name] ?? value ?? ""}
            placeholder={placeholder}
            helperText={error_text || hint}
            onChange={(e) => handleChange(name, e.target.value)}
          />
        );

      case "radio":
        return (
          <FormControl fullWidth required={!!required}>
            <RadioGroup
              value={formData[name] ?? value ?? ""}
              onChange={(e) => handleChange(name, e.target.value)}
            >
              {options?.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio />}
                  label={option.label}
                  disabled={option.disabled}
                />
              ))}
            </RadioGroup>
          </FormControl>
        );

      case "select":
        return (
          <FormControl fullWidth required={!!required}>
            <Select
              value={formData[name] ?? value ?? ""}
              onChange={(e) => handleChange(name, e.target.value)}
            >
              {options?.map((option) => (
                <MenuItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case "list<key-value>":
        return (
          <>
            {config && (
              <div>
                {Object.entries(formData[name] ?? value ?? {}).map(
                  ([key, val], index) => (
                    <Grid
                      container
                      spacing={2}
                      alignItems="center"
                      key={`${key}-${index}`}
                    >
                      <Grid item xs={config.key.size}>
                        <TextField
                          label={config.key.label}
                          required={config.key.required}
                          value={key}
                          onChange={(e) => {
                            const updatedList = { ...(formData[name] ?? {}) };
                            const oldKey = Object.keys(updatedList)[index];
                            delete updatedList[oldKey];
                            updatedList[e.target.value] = val;
                            handleChange(name, updatedList);
                          }}
                        />
                      </Grid>
                      <Grid item xs={config.value.size}>
                        <TextField
                          label={config.value.label}
                          value={val}
                          onChange={(e) => {
                            const updatedList = { ...(formData[name] ?? {}) };
                            updatedList[key] = e.target.value;
                            handleChange(name, updatedList);
                          }}
                        />
                      </Grid>
                      <Grid item xs={config.remove_button.size}>
                        <Tooltip title={config.remove_button.label}>
                          <IconButton
                            onClick={() => {
                              const updatedList = { ...(formData[name] ?? {}) };
                              const oldKey = Object.keys(updatedList)[index];
                              delete updatedList[oldKey];
                              handleChange(name, updatedList);
                            }}
                          >
                            <DeleteIcon sx={config.remove_button.style} />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  )
                )}
                <Button
                  variant={config.add_button.variant}
                  onClick={() => {
                    const updatedList = { ...(formData[name] ?? {}) };
                    updatedList[""] = "";
                    handleChange(name, updatedList);
                  }}
                >
                  <AddIcon /> {config.add_button.label}
                </Button>
              </div>
            )}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      {config.map((card, index) => (
        <Card key={`${card.type}-${card.label}-${index}`} sx={{ mb: 2, p: 2 }}>
          <Typography
            variant="h6"
            sx={{
              mb: 1,
              borderBottom: `1px solid ${theme.palette.background.paper}`,
            }}
          >
            {card.label}
            {card?.info && (
              <Tooltip
                title={
                  <Box
                    sx={{
                      maxHeight: "200px",
                      overflowY: "auto",
                      padding: "10px",
                    }}
                  >
                    {renderInfo(card.info)}
                  </Box>
                }
                arrow
                placement="top"
                componentsProps={{
                  tooltip: {
                    sx: {
                      bgcolor: theme.palette.background.paper, // Set your desired background color here
                      color: theme.palette.textVariants.text1, // Optional: Change text color for contrast
                      "& .MuiTooltip-arrow": {
                        color: theme.palette.background.paper, // Optional: Match arrow color to background
                      },
                    },
                  },
                }}
              >
                <Typography
                  component="strong"
                  sx={{
                    fontSize: "0.8rem",
                    fontWeight: "bolder",
                    color: "primary.main",
                    mx: "0.8rem",
                    mb: "3px",
                    cursor: "pointer",
                  }}
                >
                  info
                </Typography>
              </Tooltip>
            )}
          </Typography>

          <Grid container spacing={2}>
            {card?.fields &&
              card?.fields?.length > 0 &&
              card.fields.map(
                (field) =>
                  validCondition(field, values) && (
                    <Grid item xs={field.size ?? 12} key={field.name}>
                      {field.label && (
                        <Typography
                          component="label"
                          sx={{ display: "block", mb: 1 }}
                        >
                          {field.label}
                          {field?.info && (
                            <Tooltip
                              title={
                                <Box
                                  sx={{
                                    maxHeight: "200px",
                                    overflowY: "auto",
                                    padding: "10px",
                                  }}
                                >
                                  {renderInfo(field.info)}
                                </Box>
                              }
                              arrow
                              placement="top"
                              componentsProps={{
                                tooltip: {
                                  sx: {
                                    bgcolor: theme.palette.background.paper, // Set your desired background color here
                                    color: theme.palette.textVariants.text1, // Optional: Change text color for contrast
                                    "& .MuiTooltip-arrow": {
                                      color: theme.palette.background.paper, // Optional: Match arrow color to background
                                    },
                                  },
                                },
                              }}
                            >
                              <Typography
                                component="strong"
                                sx={{
                                  fontSize: "0.8rem",
                                  fontWeight: "bolder",
                                  color: "primary.main",
                                  mx: "0.8rem",
                                  mb: "3px",
                                  cursor: "pointer",
                                }}
                              >
                                info
                              </Typography>
                            </Tooltip>
                          )}
                        </Typography>
                      )}
                      {renderField(field)}
                    </Grid>
                  )
              )}
          </Grid>
        </Card>
      ))}
    </Box>
  );
};

export default DynamicForm;
