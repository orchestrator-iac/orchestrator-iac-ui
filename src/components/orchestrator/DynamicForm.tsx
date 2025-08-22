import React, { useEffect, useMemo, useState } from "react";
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
  Checkbox,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import parse from "html-react-parser";
import { Field, FieldGroup } from "../../types/node-info";
import { CodeEditorField } from "../shared/code-editor/CodeEditorField";

/** Props extended to be graph-aware */
type Values = { [x: string]: any };

type Props = {
  config: FieldGroup[];
  values?: Values;

  /** graph-aware additions (provided by CustomNode → Orchestrator) */
  nodeId: string;
  links?: Array<{ bind: string; fromTypes: string[]; cardinality?: string; edgeData?: any }>;
  allNodes?: any[]; // React Flow nodes
  allEdges?: any[]; // React Flow edges
  onLinkFieldChange?: (bind: string, newSourceId: string) => void;
};

const DynamicForm: React.FC<Props> = ({
  config,
  values,
  nodeId,
  links,
  allNodes,
  allEdges,
  onLinkFieldChange,
}) => {
  const theme = useTheme();

  /** local state to keep inputs controlled */
  const [formData, setFormData] = useState<Record<string, any>>({});

  /** initialize/refresh local form state whenever `values` prop changes */
  useEffect(() => {
    setFormData((prev) => ({ ...values, ...prev }));
  }, [values]);

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /** keep your existing conditional rendering semantics */
  const validCondition = (field: Field, vals: Values = {}) => {
    if (field?.depends_on) {
      const conditionMet = new Function("values", `return ${field.depends_on};`)(vals);
      if (!conditionMet) return false;
    }
    return true;
  };

  const renderInfo = (info?: string | JSX.Element) => {
    if (!info) return null;
    return typeof info === "string" ? parse(info) : info;
  };

  /** turn "from:nodes:type=vpc" into option list from the current graph */
  const resolveOptions = (
    options: any
  ): { value: string; label: string; disabled?: boolean }[] | undefined => {
    if (typeof options !== "string") return options;

    if (!options.startsWith("from:nodes:")) return undefined;
    const [, , filter] = options.split(":"); // e.g., "type=vpc"
    const [k, v] = filter.split("=");

    const nodes = allNodes ?? [];
    return nodes
      .filter((n: any) =>
        k === "type"
          ? // prefer preserved domain type (data.__nodeType) when present
            (n.data && n.data.__nodeType ? n.data.__nodeType === v : n.type === v)
          : n?.data?.[k] === v
      )
      .map((n: any) => ({
        value: n.id,
        label:
          n?.data?.values?.vpc_name ??
          n?.data?.values?.name ??
          n?.data?.header?.label ??
          n.id,
      }));
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
      config: fieldCfg,
    } = field;

    /** find if this field is bound to a link rule (e.g., vpc_id) */
    const linkRule = links?.find((r) => r.bind === name);

    /** dynamic options if options is a rule string */
    const resolvedOptions = resolveOptions(options);

    switch (type) {
      case "text":
        return (
          <TextField
            fullWidth
            required={!!required}
            value={formData[name] ?? value ?? ""}
            placeholder={placeholder ?? ""}
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
              {(resolvedOptions ?? options ?? []).map((option: any) => (
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
              className="nodrag"
              value={formData[name] ?? value ?? ""}
              onChange={(e) => {
                const newVal = e.target.value as string;

                // update form state
                handleChange(name, newVal);

                // if this select is a link bind, tell canvas to (re)wire edge
                if (linkRule && onLinkFieldChange) {
                  onLinkFieldChange(name, String(newVal || ""));
                }
              }}
            >
              {(resolvedOptions ?? options ?? []).map((option: any) => (
                <MenuItem key={option.value} value={option.value} disabled={option.disabled}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case "checkbox": {
        const handleCheckboxChange = (fieldName: string, optionValue: string, checked: boolean) => {
          const currentValues: string[] = formData[fieldName] ?? value ?? [];
          let updatedValues = [...currentValues];

          if (checked) {
            if (!updatedValues.includes(optionValue)) {
              updatedValues.push(optionValue);
            }
          } else {
            updatedValues = updatedValues.filter((v) => v !== optionValue);
          }

          handleChange(fieldName, updatedValues);
        };

        const opts = (resolvedOptions ?? options) as any[] | undefined;

        return (
          <FormControl fullWidth required={!!required}>
            {opts && opts.length > 0 ? (
              opts.map((option) => {
                const currentValues: string[] = formData[name] ?? value ?? [];
                return (
                  <FormControlLabel
                    key={option.value}
                    control={
                      <Checkbox
                        checked={currentValues.includes(option.value)}
                        onChange={(e) => handleCheckboxChange(name, option.value, e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {option.label}
                        </Typography>
                        {option.sub_label && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {option.sub_label}
                          </Typography>
                        )}
                      </Box>
                    }
                    disabled={option.disabled}
                  />
                );
              })
            ) : (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData[name] ?? value ?? false}
                    onChange={(e) => handleChange(name, e.target.checked)}
                  />
                }
                label={placeholder || name}
              />
            )}
          </FormControl>
        );
      }

      case "list<key-value>":
        return (
          <>
            {fieldCfg && (
              <div>
                {Object.entries(formData[name] ?? value ?? {}).map(([key, val], index) => (
                  <Grid container spacing={2} alignItems="center" key={`${key}-${index}`}>
                    <Grid item xs={fieldCfg.key.size}>
                      <TextField
                        label={fieldCfg.key.label}
                        required={fieldCfg.key.required}
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
                    <Grid item xs={fieldCfg.value.size}>
                      <TextField
                        label={fieldCfg.value.label}
                        value={val}
                        onChange={(e) => {
                          const updatedList = { ...(formData[name] ?? {}) };
                          (updatedList as any)[key] = e.target.value;
                          handleChange(name, updatedList);
                        }}
                      />
                    </Grid>
                    <Grid item xs={fieldCfg.remove_button.size}>
                      <Tooltip title={fieldCfg.remove_button.label}>
                        <IconButton
                          onClick={() => {
                            const updatedList = { ...(formData[name] ?? {}) };
                            const oldKey = Object.keys(updatedList)[index];
                            delete (updatedList as any)[oldKey];
                            handleChange(name, updatedList);
                          }}
                        >
                          <DeleteIcon sx={fieldCfg.remove_button.style} />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                  </Grid>
                ))}
                <Button
                  variant={fieldCfg.add_button.variant}
                  onClick={() => {
                    const updatedList = { ...(formData[name] ?? {}) };
                    (updatedList as any)[""] = "";
                    handleChange(name, updatedList);
                  }}
                >
                  <AddIcon /> {fieldCfg.add_button.label}
                </Button>
              </div>
            )}
          </>
        );

      case "code-editor":
        return (
          <CodeEditorField
            value={formData[name] ?? value}
            placeholder={placeholder}
            errorMessage={error_text}
            required={required}
          />
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
                  <Box sx={{ maxHeight: "200px", overflowY: "auto", padding: "10px" }}>
                    {renderInfo(card.info)}
                  </Box>
                }
                arrow
                placement="top"
                componentsProps={{
                  tooltip: {
                    sx: {
                      bgcolor: theme.palette.background.paper,
                      color: theme.palette.textVariants.text1,
                      "& .MuiTooltip-arrow": {
                        color: theme.palette.background.paper,
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
                  validCondition(field, { ...(values ?? {}), ...(formData ?? {}) }) && (
                    <Grid item xs={field.size ?? 12} key={field.name}>
                      {field.label && (
                        <Typography component="label" sx={{ display: "block", mb: 1 }}>
                          {field.label}
                          {field?.info && (
                            <Tooltip
                              title={
                                <Box sx={{ maxHeight: "200px", overflowY: "auto", padding: "10px" }}>
                                  {renderInfo(field.info)}
                                </Box>
                              }
                              arrow
                              placement="top"
                              componentsProps={{
                                tooltip: {
                                  sx: {
                                    bgcolor: theme.palette.background.paper,
                                    color: theme.palette.textVariants.text1,
                                    "& .MuiTooltip-arrow": {
                                      color: theme.palette.background.paper,
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
