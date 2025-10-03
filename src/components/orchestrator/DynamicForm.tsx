import React, { useEffect, useState } from "react";
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
  Autocomplete,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import parse from "html-react-parser";
import { useViewport } from "@xyflow/react";
import { Field, FieldGroup } from "../../types/node-info";
import { CodeEditorField } from "../shared/code-editor/CodeEditorField";
import { UserProfile } from "../../types/auth";
import { CloudConfig } from "../../types/clouds-info";
import { validCondition } from "../../utils/deps";
import { renderTemplate } from "@/utils/renderTemplate";
import ListObjectField from "./ListObjectField";

type Values = { [x: string]: any };

type Props = {
  config: FieldGroup[];
  values?: Values;

  nodeId: string;
  links?: Array<{
    bind: string;
    fromTypes: string[];
    cardinality?: string;
    edgeData?: any;
  }>;
  allNodes?: any[];
  allEdges?: any[];
  userInfo?: UserProfile;
  templateInfo?: CloudConfig;
  onLinkFieldChange?: (bind: string, newSourceId: string) => void;
};

const DynamicForm: React.FC<Props> = ({
  config,
  values,
  links,
  allNodes,
  userInfo,
  templateInfo,
  onLinkFieldChange,
}) => {
  const theme = useTheme();
  let zoom = 1;
  try {
    zoom = useViewport().zoom;
  } catch {
    zoom = 1;
  }

  const [formData, setFormData] = useState<Record<string, any>>({});
  useEffect(() => {
    if (!values) {
      setFormData({});
      return;
    }
    try {
      const rendered = renderTemplate(values, {
        userInfo: userInfo ?? {}, // <- ensure key exists
        templateInfo: templateInfo ?? {}, // <- ensure key exists
      });
      setFormData(rendered);
    } catch (e) {
      console.error("Template render failed", e);
      setFormData(values);
    }
  }, [values, userInfo, templateInfo]);

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const renderInfo = (info?: string | JSX.Element) => {
    if (!info) return null;
    return typeof info === "string" ? parse(info) : info;
  };

  // "from:nodes:resourceId=vpc" or "from:nodes:type=vpc" (generic)
  const resolveOptions = (
    options: any
  ): { value: string; label: string; disabled?: boolean }[] | undefined => {
    if (typeof options !== "string") return options;
    if (!options.startsWith("from:nodes:")) return undefined;

    const [, , filter] = options.split(":"); // e.g., "resourceId=vpc"
    const [k, v] = filter.split("=");

    const nodes = allNodes ?? [];
    const candidates = nodes.filter((n: any) => {
      const typeCode = n?.data?.__nodeType; // canonical domain type from resourceId
      if (k === "resourceId" || k === "type") return typeCode === v;
      return n?.data?.[k] === v;
    });

    return candidates.map((n: any, idx: number) => {
      const typeCode = n?.data?.__nodeType ?? "node"; // e.g., "vpc", "subnet", "bucket"
      const seq = String(idx + 1).padStart(4, "0"); // 0001, 0002, ...
      // Prefer a human name if present, otherwise header label, otherwise id
      const name =
        n?.data?.values?.name ??
        n?.data?.values?.[`${typeCode}_name`] ?? // supports vpc_name, subnet_name, etc.
        n?.data?.header?.label ??
        String(n.id);

      // Always append a short code for clarity & disambiguation
      const code = `${typeCode}-${seq}`;
      const label = `${name} (${code})`;

      return { value: String(n.id), label };
    });
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

    const linkRule = links?.find((r) => r.bind === name);
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
          />
        );

      case "radio":
        return (
          <FormControl fullWidth required={!!required}>
            <RadioGroup
              value={formData[name] ?? value ?? ""}
              onChange={(e) => handleChange(name, e.target.value)}
            >
              {(resolvedOptions ?? []).map((option: any) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio />}
                  label={
                    <Typography variant="body2">{option.label}</Typography>
                  }
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
                handleChange(name, newVal);
                if (linkRule && onLinkFieldChange) {
                  onLinkFieldChange(name, String(newVal || ""));
                }
              }}
              MenuProps={{
                disablePortal: false,
                PaperProps: {
                  style: {
                    transform: `scale(${zoom})`,
                    transformOrigin: "top left",
                  },
                },
              }}
            >
              {(resolvedOptions ?? []).map((option: any) => (
                <MenuItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  <Typography variant="body2">{option.label}</Typography>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case "select+text": {
        const opts = (resolvedOptions ?? []).map((o: any) => ({
          label: String(o.label),
          value: String(o.value),
          disabled: !!o.disabled,
        })) as Array<{ label: string; value: string; disabled?: boolean }>;

        const currentVal = String(formData[name] ?? value ?? "");
        const matched = opts.find((o) => o.value === currentVal) || null;

        return (
          <Autocomplete
            freeSolo
            fullWidth
            options={opts}
            value={matched ?? currentVal}
            getOptionLabel={(opt) =>
              typeof opt === "string" ? opt : opt?.label ?? ""
            }
            isOptionEqualToValue={(opt, val) =>
              typeof val === "string"
                ? opt.value === val
                : opt.value === val?.value
            }
            clearOnEscape
            onChange={(_e, newVal) => {
              if (newVal == null) {
                handleChange(name, "");
                if (onLinkFieldChange) onLinkFieldChange(name, "");
                return;
              }
              if (typeof newVal === "string") {
                handleChange(name, newVal);
                return;
              }
              const pickedVal = String(newVal.value ?? "");
              handleChange(name, pickedVal);
              if (onLinkFieldChange) onLinkFieldChange(name, pickedVal);
            }}
            onInputChange={(_e, newInput, reason) => {
              if (reason === "input") {
                const divergedFromOption =
                  !!matched &&
                  !opts.some((o) => o.value === String(newInput ?? ""));
                if (divergedFromOption && onLinkFieldChange) {
                  onLinkFieldChange(name, "");
                }
                handleChange(name, String(newInput ?? ""));
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={placeholder ?? "Select or type an ID"}
                required={!!required}
                helperText={error_text || hint}
              />
            )}
            renderOption={(props, option) => (
              <MenuItem
                {...props}
                key={option.value}
                disabled={option.disabled}
              >
                <Typography variant="body2">{option.label}</Typography>
              </MenuItem>
            )}
            disablePortal={false}
            slotProps={{
              popper: {
                modifiers: [
                  { name: "computeStyles", options: { adaptive: false } },
                ],
                style: { zIndex: 1500 },
              },
              paper: {
                sx: {
                  transform: `scale(${zoom})`,
                  transformOrigin: "top center",
                },
              },
            }}
          />
        );
      }

      case "checkbox": {
        const handleCheckboxChange = (
          fieldName: string,
          optionValue: string,
          checked: boolean
        ) => {
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
                        onChange={(e) =>
                          handleCheckboxChange(
                            name,
                            option.value,
                            e.target.checked
                          )
                        }
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {option.label}
                        </Typography>
                        {option.sub_label && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                          >
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
                label={
                  <Typography variant="body2">{placeholder || name}</Typography>
                }
              />
            )}
          </FormControl>
        );
      }

      case "switch": {
        const raw = formData[name] ?? value ?? false;
        const isEnabled = raw === true || raw === "true";
        return (
          <ToggleButtonGroup
            value={isEnabled ? "enabled" : "disabled"}
            exclusive
            onChange={(_e, val) => {
              if (val !== null) handleChange(name, val === "enabled");
            }}
            size="small"
            sx={{
              borderRadius: 2,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              "& .MuiToggleButton-root": {
                px: 2,
                py: 0.5,
                textTransform: "none",
                fontSize: "0.75rem",
                fontWeight: 500,
                minWidth: "auto",
              },
            }}
          >
            <ToggleButton
              value="enabled"
              sx={{
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "white",
                  "&:hover": { bgcolor: "primary.dark" },
                },
              }}
            >
              Enable
            </ToggleButton>
            <ToggleButton
              value="disabled"
              sx={{
                "&.Mui-selected": {
                  bgcolor: "grey.400",
                  color: "white",
                  "&:hover": { bgcolor: "grey.500" },
                },
              }}
            >
              Disable
            </ToggleButton>
          </ToggleButtonGroup>
        );
      }

      case "list<object>":
        return (
          <ListObjectField
            name={name}
            value={value}
            fieldCfg={fieldCfg}
            formData={formData}
            onChange={handleChange}
            resolveOptions={resolveOptions}
          />
        );

      case "number":
        return (
          <TextField
            fullWidth
            type="number"
            required={!!required}
            value={formData[name] ?? value ?? ""}
            placeholder={placeholder ?? ""}
            helperText={error_text || hint}
            slotProps={{
              htmlInput: {
                min: fieldCfg?.min,
                max: fieldCfg?.max,
                step: fieldCfg?.step ?? 1,
              },
            }}
            onChange={(e) => {
              const val = e.target.value;
              handleChange(name, val === "" ? "" : Number(val));
            }}
          />
        );

      case "list<key-value>":
        return (
          <>
            {fieldCfg && (
              <div>
                {Object.entries(formData[name] ?? value ?? {}).map(
                  ([key, val], index) => (
                    <Grid
                      container
                      spacing={2}
                      alignItems="center"
                      key={`${key}-${index}`}
                    >
                      <Grid size={fieldCfg.key.size}>
                        <TextField
                          label={fieldCfg.key.label}
                          required={fieldCfg.key.required}
                          value={key}
                          onChange={(e) => {
                            const updatedList = {
                              ...(formData[name] ?? {}),
                            } as Record<string, any>;
                            const oldKey = Object.keys(updatedList)[index];
                            delete updatedList[oldKey];
                            updatedList[e.target.value] = val;
                            handleChange(name, updatedList);
                          }}
                        />
                      </Grid>
                      <Grid size={fieldCfg.value.size}>
                        <TextField
                          label={fieldCfg.value.label}
                          value={val as any}
                          onChange={(e) => {
                            const updatedList = {
                              ...(formData[name] ?? {}),
                            } as Record<string, any>;
                            updatedList[key] = e.target.value;
                            handleChange(name, updatedList);
                          }}
                        />
                      </Grid>
                      <Grid size={fieldCfg.remove_button.size}>
                        <Tooltip title={fieldCfg.remove_button.label}>
                          <IconButton
                            onClick={() => {
                              const updatedList = {
                                ...(formData[name] ?? {}),
                              } as Record<string, any>;
                              const oldKey = Object.keys(updatedList)[index];
                              delete updatedList[oldKey];
                              handleChange(name, updatedList);
                            }}
                          >
                            <DeleteIcon sx={fieldCfg.remove_button.style} />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  )
                )}
                <Button
                  variant={fieldCfg.add_button.variant}
                  onClick={() => {
                    const updatedList = { ...(formData[name] ?? {}) } as Record<
                      string,
                      any
                    >;
                    updatedList[""] = "";
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
            variant="subtitle1"
            sx={{
              mb: 1,
              borderBottom: `1px solid ${theme.palette.background.paper}`,
              color: "primary.main",
              fontWeight: "bold",
            }}
          >
            {card.label}
            {card?.info && (
              <Tooltip
                title={
                  <Box sx={{ maxHeight: 200, overflowY: "auto", p: 1 }}>
                    {renderInfo(card.info)}
                  </Box>
                }
                arrow
                placement="top"
                slotProps={{
                  tooltip: {
                    sx: {
                      bgcolor: theme.palette.background.paper,
                      color:
                        theme.palette.textVariants?.text1 ??
                        theme.palette.text.primary,
                      "& .MuiTooltip-arrow": {
                        color: theme.palette.background.paper,
                      },
                    },
                  },
                }}
              >
                <Typography
                  component="strong"
                  variant="caption"
                  sx={{
                    fontWeight: "bold",
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
                  validCondition(field, {
                    ...(values ?? {}),
                    ...(formData ?? {}),
                  }) && (
                    <Grid size={field.size ?? 12} key={field.name}>
                      {field.label && (
                        <Typography
                          component="label"
                          variant="body2"
                          sx={{ display: "block", mb: 0.5 }}
                        >
                          {field.label}
                          {field?.info && (
                            <Tooltip
                              title={
                                <Box
                                  sx={{
                                    maxHeight: 200,
                                    overflowY: "auto",
                                    p: 1,
                                  }}
                                >
                                  {renderInfo(field.info)}
                                </Box>
                              }
                              arrow
                              placement="top"
                              slotProps={{
                                tooltip: {
                                  sx: {
                                    bgcolor: theme.palette.background.paper,
                                    color:
                                      theme.palette.textVariants?.text1 ??
                                      theme.palette.text.primary,
                                    "& .MuiTooltip-arrow": {
                                      color: theme.palette.background.paper,
                                    },
                                  },
                                },
                              }}
                            >
                              <Typography
                                component="strong"
                                variant="caption"
                                sx={{
                                  fontWeight: "bold",
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
