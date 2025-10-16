import React from "react";
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
import { validCondition } from "../../utils/deps";

type ListObjectFieldProps = {
  name: string;
  value: any[];
  fieldCfg: any;
  formData: Record<string, any>;
  onChange: (name: string, value: any) => void;
  resolveOptions: (
    options: any,
    contextData?: Record<string, any>
  ) => { value: string; label: string; disabled?: boolean }[] | undefined;
  onLinkFieldChange?: (
    bind: string,
    newSourceId: string,
    context?: { objectSnapshot?: Record<string, any> }
  ) => void;
};

const ListObjectField: React.FC<ListObjectFieldProps> = ({
  name,
  value,
  fieldCfg,
  formData,
  onChange,
  resolveOptions,
  onLinkFieldChange,
}) => {
  const theme = useTheme();
  let zoom = 1;
  try {
    zoom = useViewport().zoom;
  } catch {
    zoom = 1;
  }

  const currentList = (formData[name] ?? value ?? []) as any[];

  const renderInfo = (info?: string | JSX.Element) => {
    if (!info) return null;
    return typeof info === "string" ? parse(info) : info;
  };

  const handleListItemChange = (
    index: number,
    fieldName: string,
    fieldValue: any
  ) => {
    const updatedList = [...currentList];
    if (!updatedList[index]) {
      updatedList[index] = {};
    }
    updatedList[index] = { ...updatedList[index], [fieldName]: fieldValue };
    onChange(name, updatedList);
  };

  const handleAddItem = () => {
    const newItem: Record<string, any> = {};
    // Initialize with default values from schema
    if (fieldCfg?.schema) {
      for (const schemaField of fieldCfg.schema) {
        if (schemaField.value !== undefined) {
          newItem[schemaField.name] = schemaField.value;
        }
      }
    }
    onChange(name, [...currentList, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    const updatedList = currentList.filter((_, i) => i !== index);
    onChange(name, updatedList);
  };

  const renderObjectField = (
    schemaField: any,
    itemData: any,
    itemIndex: number
  ) => {
    const fieldValue = itemData?.[schemaField.name] ?? schemaField.value ?? "";

    switch (schemaField.type) {
      case "text":
        return (
          <TextField
            fullWidth
            required={!!schemaField.required}
            value={fieldValue}
            placeholder={schemaField.placeholder ?? ""}
            helperText={schemaField.error_text || schemaField.hint}
            onChange={(e) =>
              handleListItemChange(itemIndex, schemaField.name, e.target.value)
            }
          />
        );

      case "number":
        return (
          <TextField
            fullWidth
            type="number"
            required={!!schemaField.required}
            value={fieldValue}
            placeholder={schemaField.placeholder ?? ""}
            helperText={schemaField.error_text || schemaField.hint}
            slotProps={{
              htmlInput: {
                min: schemaField.config?.min,
                max: schemaField.config?.max,
                step: schemaField.config?.step ?? 1,
              },
            }}
            onChange={(e) => {
              const val = e.target.value;
              handleListItemChange(
                itemIndex,
                schemaField.name,
                val === "" ? "" : Number(val)
              );
            }}
          />
        );

      case "select": {
        const resolvedSchemaOptions = resolveOptions(
          schemaField.options,
          itemData
        );
        return (
          <FormControl fullWidth required={!!schemaField.required}>
            <Select
              className="nodrag"
              value={fieldValue}
              onChange={(e) => {
                const newVal = e.target.value as string;
                handleListItemChange(itemIndex, schemaField.name, newVal);
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
              {(resolvedSchemaOptions ?? []).map((option: any) => (
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
      }

      case "select+text": {
        const resolvedSchemaOptions = resolveOptions(
          schemaField.options,
          itemData
        );
        const opts = (resolvedSchemaOptions ?? []).map((o: any) => ({
          label: String(o.label),
          value: String(o.value),
          disabled: !!o.disabled,
        })) as Array<{ label: string; value: string; disabled?: boolean }>;

        const currentVal = String(fieldValue);
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
                const snapshot = {
                  ...currentList[itemIndex],
                  [schemaField.name]: "",
                };
                handleListItemChange(itemIndex, schemaField.name, "");
                onLinkFieldChange?.(
                  `${name}[${itemIndex}].${schemaField.name}`,
                  "",
                  { objectSnapshot: snapshot }
                );
                return;
              }
              if (typeof newVal === "string") {
                handleListItemChange(itemIndex, schemaField.name, newVal);
                return;
              }
              const pickedVal = String(newVal.value ?? "");
              const snapshot = {
                ...currentList[itemIndex],
                [schemaField.name]: pickedVal,
              };
              handleListItemChange(itemIndex, schemaField.name, pickedVal);
              onLinkFieldChange?.(
                `${name}[${itemIndex}].${schemaField.name}`,
                pickedVal,
                { objectSnapshot: snapshot }
              );
            }}
            onInputChange={(_e, newInput, reason) => {
              if (reason === "input") {
                const divergedFromOption =
                  !!matched &&
                  !opts.some((o) => o.value === String(newInput ?? ""));
                if (divergedFromOption && onLinkFieldChange) {
                  const snapshot = {
                    ...currentList[itemIndex],
                    [schemaField.name]: "",
                  };
                  onLinkFieldChange(
                    `${name}[${itemIndex}].${schemaField.name}`,
                    "",
                    { objectSnapshot: snapshot }
                  );
                }
                handleListItemChange(
                  itemIndex,
                  schemaField.name,
                  String(newInput ?? "")
                );
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={schemaField.placeholder ?? "Select or type an ID"}
                required={!!schemaField.required}
                helperText={schemaField.error_text || schemaField.hint}
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

      case "radio": {
        const resolvedSchemaOptions = resolveOptions(
          schemaField.options,
          itemData
        );
        return (
          <FormControl fullWidth required={!!schemaField.required}>
            <RadioGroup
              value={fieldValue}
              onChange={(e) =>
                handleListItemChange(
                  itemIndex,
                  schemaField.name,
                  e.target.value
                )
              }
            >
              {(resolvedSchemaOptions ?? []).map((option: any) => (
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
      }

      case "checkbox": {
        const resolvedSchemaOptions = resolveOptions(
          schemaField.options,
          itemData
        );
        const opts = (resolvedSchemaOptions ?? schemaField.options) as
          | any[]
          | undefined;

        if (opts && opts.length > 0) {
          const currentValues: string[] = fieldValue ?? [];
          return (
            <FormControl fullWidth required={!!schemaField.required}>
              {opts.map((option) => (
                <FormControlLabel
                  key={option.value}
                  control={
                    <Checkbox
                      checked={currentValues.includes(option.value)}
                      onChange={(e) => {
                        const updatedValues = e.target.checked
                          ? [...currentValues, option.value]
                          : currentValues.filter((v) => v !== option.value);
                        handleListItemChange(
                          itemIndex,
                          schemaField.name,
                          updatedValues
                        );
                      }}
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
              ))}
            </FormControl>
          );
        } else {
          return (
            <FormControlLabel
              control={
                <Checkbox
                  checked={fieldValue ?? false}
                  onChange={(e) =>
                    handleListItemChange(
                      itemIndex,
                      schemaField.name,
                      e.target.checked
                    )
                  }
                />
              }
              label={
                <Typography variant="body2">
                  {schemaField.placeholder || schemaField.name}
                </Typography>
              }
            />
          );
        }
      }

      case "switch": {
        const isEnabled = fieldValue === true || fieldValue === "true";
        return (
          <ToggleButtonGroup
            value={isEnabled ? "enabled" : "disabled"}
            exclusive
            onChange={(_e, val) => {
              if (val !== null)
                handleListItemChange(
                  itemIndex,
                  schemaField.name,
                  val === "enabled"
                );
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

      default:
        return null;
    }
  };

  return (
    <Box>
      {currentList.map((item, index) => (
        <Card
          key={`${name}-item-${index}`}
          variant="outlined"
          sx={{
            mb: 2,
            p: 2,
            bgcolor: theme.palette.action.hover,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography
              variant="subtitle2"
              color="primary.main"
              fontWeight="bold"
            >
              Item #{index + 1}
            </Typography>
            <Tooltip title={fieldCfg?.remove_button?.label || "Remove"}>
              <IconButton
                onClick={() => handleRemoveItem(index)}
                size="small"
                sx={{ color: "error.main" }}
              >
                <DeleteIcon sx={fieldCfg?.remove_button?.style} />
              </IconButton>
            </Tooltip>
          </Box>

          <Grid container spacing={2}>
            {fieldCfg?.schema?.map((schemaField: any) => {
              // Check field dependencies first
              if (!validCondition(schemaField, item)) {
                return null;
              }

              return (
                <Grid size={schemaField.size ?? 12} key={schemaField.name}>
                  {schemaField.label && (
                    <Typography
                      component="label"
                      variant="body2"
                      sx={{ display: "block", mb: 0.5 }}
                    >
                      {schemaField.label}
                      {schemaField?.info && (
                        <Tooltip
                          title={
                            <Box
                              sx={{ maxHeight: 200, overflowY: "auto", p: 1 }}
                            >
                              {renderInfo(schemaField.info)}
                            </Box>
                          }
                          arrow
                          placement="top"
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
                  {renderObjectField(schemaField, item, index)}
                </Grid>
              );
            })}
          </Grid>
        </Card>
      ))}

      <Button
        variant={fieldCfg?.add_button?.variant || "outlined"}
        onClick={handleAddItem}
        startIcon={<AddIcon />}
        sx={{ mt: 1 }}
      >
        {fieldCfg?.add_button?.label || "Add Item"}
      </Button>
    </Box>
  );
};

export default ListObjectField;
