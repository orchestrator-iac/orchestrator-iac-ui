import React from "react";
import {
  Card,
  TextField,
  MenuItem,
  Button,
  Tooltip,
  IconButton,
  Grid,
  Typography,
  Box,
  useTheme,
  Autocomplete,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useViewport } from "@xyflow/react";

type ListSelectTextFieldProps = {
  name: string;
  value: string[];
  formData: Record<string, any>;
  onChange: (name: string, value: any) => void;
  resolveOptions: (
    options: any,
    contextData?: Record<string, any>
  ) => { value: string; label: string; disabled?: boolean }[] | undefined;
  options?: any;
  placeholder?: string;
  hint?: string;
  error_text?: string;
  onLinkFieldChange?: (bind: string, newSourceId: string) => void;
  allowDuplicates?: boolean;
};

const ListSelectTextField: React.FC<ListSelectTextFieldProps> = ({
  name,
  value,
  formData,
  onChange,
  resolveOptions,
  options,
  placeholder,
  hint,
  error_text,
  onLinkFieldChange,
  allowDuplicates = false,
}) => {
  const theme = useTheme();
  let zoom = 1;
  try {
    zoom = useViewport().zoom;
  } catch {
    zoom = 1;
  }

  const currentList = (formData[name] ?? value ?? []) as string[];

  const handleListItemChange = (index: number, newValue: string) => {
    let actualValue = newValue;
    
    // Check for duplicates if allowDuplicates is false
    if (!allowDuplicates && newValue && currentList.includes(newValue)) {
      const existingIndex = currentList.indexOf(newValue);
      if (existingIndex !== index) {
        // Don't allow duplicate values - clear the value
        actualValue = "";
      }
    }
    
    const updatedList = [...currentList];
    updatedList[index] = actualValue;
    onChange(name, updatedList);
    
    // For list fields, use indexed field names to create separate edges for each item
    // This allows each list item to have its own independent edge
    if (onLinkFieldChange) {
      onLinkFieldChange(`${name}[${index}]`, actualValue);
    }
  };

  const handleAddItem = () => {
    onChange(name, [...currentList, ""]);
  };

  const handleRemoveItem = (index: number) => {
    const updatedList = currentList.filter((_, i) => i !== index);
    onChange(name, updatedList);
    
    // When removing an item, clear the field to remove all edges
    if (onLinkFieldChange) {
      onLinkFieldChange(name, "");
    }
  };

  const renderSelectTextField = (itemValue: string, itemIndex: number) => {
    const resolvedOptions = resolveOptions(options, formData);
    const opts = (resolvedOptions ?? []).map((o: any) => {
      const isAlreadySelected = !allowDuplicates && 
        currentList.some((item, idx) => idx !== itemIndex && item === String(o.value));
      
      return {
        label: String(o.label),
        value: String(o.value),
        disabled: !!o.disabled || isAlreadySelected,
      };
    }) as Array<{ label: string; value: string; disabled?: boolean }>;

    const currentVal = String(itemValue);
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
            handleListItemChange(itemIndex, "");
            return;
          }
          if (typeof newVal === "string") {
            handleListItemChange(itemIndex, newVal);
            return;
          }
          const pickedVal = String(newVal.value ?? "");
          handleListItemChange(itemIndex, pickedVal);
        }}
        onInputChange={(_e, newInput, reason) => {
          if (reason === "input") {
            const newValue = String(newInput ?? "");
            
            // Check if user diverged from dropdown option
            const opts = (resolvedOptions ?? []).map((o: any) => ({
              label: String(o.label),
              value: String(o.value),
              disabled: !!o.disabled,
            }));
            const previousVal = String(itemValue); // Use the current item value, not currentVal
            const matched = opts.find((o) => o.value === previousVal) || null;
            const divergedFromOption = !!matched && !opts.some((o) => o.value === newValue);
            
            if (divergedFromOption && onLinkFieldChange) {
              onLinkFieldChange(`${name}[${itemIndex}]`, "");
            }
          }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={placeholder ?? "Select or type an ID"}
            helperText={error_text || hint}
          />
        )}
        renderOption={(props, option) => {
          const isAlreadySelected = !allowDuplicates && 
            currentList.some((item, idx) => idx !== itemIndex && item === option.value);
          
          return (
            <MenuItem
              {...props}
              key={option.value}
              disabled={option.disabled}
            >
              <Typography 
                variant="body2"
                sx={{ 
                  opacity: option.disabled ? 0.5 : 1,
                  fontStyle: isAlreadySelected ? 'italic' : 'normal'
                }}
              >
                {option.label}
                {isAlreadySelected && ' (Already selected)'}
              </Typography>
            </MenuItem>
          );
        }}
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
  };

  return (
    <Box>
      {currentList.map((item, index) => (
        <Card
          key={`${name}-${index}-${item}`}
          variant="outlined"
          sx={{
            mb: 2,
            p: 2,
            bgcolor: theme.palette.action.hover,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid size={10}>
              {renderSelectTextField(item, index)}
            </Grid>
            <Grid size={2}>
              <Tooltip title="Remove">
                <IconButton
                  onClick={() => handleRemoveItem(index)}
                  size="small"
                  sx={{ color: "error.main" }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </Card>
      ))}
      
      <Button
        variant="outlined"
        onClick={handleAddItem}
        startIcon={<AddIcon />}
        sx={{ mt: 1 }}
      >
        Add Item
      </Button>
    </Box>
  );
};

export default ListSelectTextField;
