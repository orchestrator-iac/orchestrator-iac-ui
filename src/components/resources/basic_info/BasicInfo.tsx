import { FormControl, Grid, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from "@mui/material";
import React from "react";

interface FormData {
  id: string;
  cloudProvider: string;
  resourceName: string;
  terraformCorePath: string;
  terraformTemplatePath: string;
}

interface BasicInfoProps {
  formData: FormData;
  formErrors: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement| HTMLTextAreaElement> | SelectChangeEvent<string>) => void;
}

const BasicInfo: React.FC<BasicInfoProps> = ({ formData, formErrors, handleChange }) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField
          label="ID"
          name="id"
          value={formData.id}
          onChange={handleChange}
          fullWidth
          error={!!formErrors.id}
          helperText={formErrors.id}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel id="cloud-provider-label">Cloud Provider</InputLabel>
          <Select
            labelId="cloud-provider-label"
            id="cloud-provider-select"
            value={formData.cloudProvider}
            label="Cloud Provider"
            name="cloudProvider"
            onChange={handleChange}
          >
            <MenuItem value={'aws'}>AWS</MenuItem>
            <MenuItem value={'azure'}>Azure</MenuItem>
            <MenuItem value={'gcp'}>GCP</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Resource Name"
          name="resourceName"
          value={formData.resourceName}
          onChange={handleChange}
          fullWidth
          error={!!formErrors.resourceName}
          helperText={formErrors.resourceName}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Terraform Core Path"
          name="terraformCorePath"
          value={formData.terraformCorePath}
          onChange={handleChange}
          fullWidth
          error={!!formErrors.terraformCorePath}
          helperText={formErrors.terraformCorePath}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Terraform Template Path"
          name="terraformTemplatePath"
          value={formData.terraformTemplatePath}
          onChange={handleChange}
          fullWidth
          error={!!formErrors.terraformTemplatePath}
          helperText={formErrors.terraformTemplatePath}
        />
      </Grid>
    </Grid>
  );
};

export default BasicInfo;
