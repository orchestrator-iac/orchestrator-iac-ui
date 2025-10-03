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
  fieldCfg: any;
  formData: Record<string, any>;
  onChange: (name: string, value: any) => void;
  resolveOptions: (
    options: any
  ) => { value: string; label: string; disabled?: boolean }[] | undefined;
  placeholder?: string;
  hint?: string;
  error_text?: string;
};

const ListSelectTextField: React.FC<ListSelectTextFieldProps> = ({
  name,
  value,
  fieldCfg,
  formData,
  onChange,
  resolveOptions,
  placeholder,
  hint,
  error_text,
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
    const updatedList = [...currentList];
    updatedList[index] = newValue;
    onChange(name, updatedList);
  };

  const handleAddItem = () => {
    onChange(name, [...currentList, ""]);
  };

  const handleRemoveItem = (index: number) => {
    const updatedList = currentList.filter((_, i) => i !== index);
    onChange(name, updatedList);
  };

  const renderSelectTextField = (itemValue: string, itemIndex: number) => {
    const resolvedOptions = resolveOptions(fieldCfg?.options);
    const opts = (resolvedOptions ?? []).map((o: any) => ({
      label: String(o.label),
      value: String(o.value),
      disabled: !!o.disabled,
    })) as Array<{ label: string; value: string; disabled?: boolean }>;

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
            handleListItemChange(itemIndex, String(newInput ?? ""));
          }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={placeholder ?? "Select or type an ID"}
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
  };

  return (
    <Box>
      {currentList.map((item, index) => (
        <Card
          key={index}
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
