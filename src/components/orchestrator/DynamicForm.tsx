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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

// Types
type Option = { value: string; label: string; disabled?: boolean };
type Field = {
  name: string;
  label: string;
  sub_label?: string;
  type: string;
  required?: boolean | string;
  value: any;
  placeholder?: string;
  options?: Option[];
  hint?: string;
  error_text?: string;
  size?: number;
  depends_on?: string;
  config?: any; // For custom configurations like `list<key-value>`
};

type CardConfig = {
  type: string;
  label: string;
  sub_label?: string;
  fields: Field[];
};

type Values = {
  [x: string]: any;
}

type Props = {
  config: CardConfig[],
  values?: Values
};

const DynamicForm: React.FC<Props> = ({ config, values }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const renderField = (field: Field, values: Values = {}) => {
    const { name, label, type, required, value, options, placeholder, hint, error_text, depends_on, config } = field;

    if (depends_on) {
      const conditionMet = new Function('values', `return ${depends_on};`)(values);
      if (!conditionMet) return null;
    }

    switch (type) {
      case "text":
        return (
          <>
            {field.label && <label style={{ display: "block", marginBottom: "8px" }}>{field.label}</label>}
            <TextField
              fullWidth
              required={!!required}
              value={formData[name] || value || ""}
              placeholder={placeholder}
              helperText={hint || error_text}
              onChange={(e) => handleChange(name, e.target.value)}
            />
          </>

        );

      case "radio":
        return (
          <>
            {field.label && <label style={{ display: "block", marginBottom: "8px" }}>{field.label}</label>}
            <FormControl fullWidth required={!!required}>
              <RadioGroup
                value={formData[name] || value || ""}
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
          </>

        );

      case "select":
        return (
          <>
            {field.label && <label style={{ display: "block", marginBottom: "8px" }}>{field.label}</label>}
            <FormControl fullWidth required={!!required}>
              <Select
                value={formData[name] || value || ""}
                onChange={(e) => handleChange(name, e.target.value)}
              >
                {options?.map((option) => (
                  <MenuItem key={option.value} value={option.value} disabled={option.disabled}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        );

      case "list<key-value>":
        return (
          <div>
            {field.label && <label style={{ display: "block", marginBottom: "8px" }}>{field.label}</label>}
            {(formData[name] || Object.entries(value || {})).map(([key, val]: [string, string], index: number) => (
              <Grid container spacing={2} alignItems="center" key={index}>
                <Grid item xs={config.key.size}>
                  <TextField
                    label={config.key.label}
                    required={config.key.required}
                    value={key}
                    onChange={(e) => {
                      const updatedList = { ...(formData[name] || {}) };
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
                      const updatedList = { ...(formData[name] || {}) };
                      updatedList[key] = e.target.value;
                      handleChange(name, updatedList);
                    }}
                  />
                </Grid>
                <Grid item xs={config.remove_button.size}>
                  <Tooltip title={config.remove_button.label}>
                    <IconButton
                      onClick={() => {
                        const updatedList = { ...(formData[name] || {}) };
                        const oldKey = Object.keys(updatedList)[index];
                        delete updatedList[oldKey];
                        handleChange(name, updatedList);
                      }}
                    >
                      <DeleteIcon style={config.remove_button.style} />
                    </IconButton>
                  </Tooltip>
                </Grid>
              </Grid>
            ))}
            <Button
              variant={config.add_button.variant}
              onClick={() => {
                const updatedList = { ...(formData[name] || {}) };
                updatedList[""] = "";
                handleChange(name, updatedList);
              }}
            >
              <AddIcon /> {config.add_button.label}
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      {config.map((card, index) => (
        <Card key={index} style={{ marginBottom: "16px", padding: "16px" }}>
          <h3 style={{
            margin: "0 0 10px",
            borderBottom: "1px solid #f4f4f4"
          }}>{card.label}</h3>
          <Grid container spacing={2}>
            {card.fields.map((field) => (
              <Grid item xs={field.size || 12} key={field.name}>
                {renderField(field, values)}
              </Grid>
            ))}
          </Grid>
        </Card>
      ))}
    </div>
  );
};

export default DynamicForm;

// import React from "react";
// import { Grid, TextField, RadioGroup, FormControlLabel, Radio, Select, MenuItem, InputLabel, FormControl, Card } from "@mui/material";

// interface Field {
//   name: string;
//   label: string;
//   type: string;
//   value?: any;
//   required?: boolean | string;
//   size?: number;
//   placeholder?: string;
//   options?: { value: string; label: string; disabled?: boolean }[];
// }

// interface CardConfig {
//   label: string;
//   fields: Field[];
// }

// interface DynamicFormProps {
//   config: CardConfig[];
// }

// const DynamicForm: React.FC<DynamicFormProps> = ({ config }) => {
//   return (
//     <div>
//       {config.map((card, cardIndex) => (
//         <Card key={cardIndex} style={{ marginBottom: "16px", padding: "16px" }}>
//           <h3 style={{
//             margin: "0 0 10px",
//             borderBottom: "1px solid #f4f4f4"
//           }}>{card.label}</h3>
//           <Grid container spacing={2}>
//             {card.fields.map((field, fieldIndex) => (
//               <Grid item xs={field.size || 12} key={fieldIndex}>
//                 {/* External Label */}
//                 {field.label && <label style={{ display: "block", marginBottom: "8px" }}>{field.label}</label>}

//                 {/* Render based on field type */}
//                 {field.type === "text" && (
//                   <TextField
//                     fullWidth
//                     variant="outlined"
//                     placeholder={field.placeholder}
//                     value={field.value}
//                     required={Boolean(field.required)}
//                   />
//                 )}

//                 {field.type === "radio" && field.options && (
//                   <RadioGroup row>
//                     {field.options.map((option, optionIndex) => (
//                       <FormControlLabel
//                         key={optionIndex}
//                         value={option.value}
//                         control={<Radio />}
//                         label={option.label}
//                         disabled={option.disabled}
//                       />
//                     ))}
//                   </RadioGroup>
//                 )}

//                 {field.type === "select" && field.options && (
//                   <FormControl fullWidth>
//                     <Select
//                       value={field.value || ""}
//                       displayEmpty
//                       inputProps={{ "aria-label": "Select an option" }}
//                     >
//                       {field.options.map((option, optionIndex) => (
//                         <MenuItem key={optionIndex} value={option.value} disabled={option.disabled}>
//                           {option.label}
//                         </MenuItem>
//                       ))}
//                     </Select>
//                   </FormControl>
//                 )}
//               </Grid>
//             ))}
//           </Grid>
//         </Card>
//       ))}
//     </div>
//   );
// };

// export default DynamicForm;

