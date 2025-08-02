// basic_info/BasicInfo.tsx
import React from "react";
import {
  Grid,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  FormHelperText,
} from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";

const BasicInfo: React.FC = () => {
  const { control, formState } = useFormContext(); // from RHF context
  const { errors } = formState;

  return (
    <Grid container spacing={2} sx={{padding: "0 150px"}}>
      <Grid item xs={12}>
        <Controller
          name="id"
          control={control}
          rules={{ required: "ID is required." }}
          render={({ field }) => (
            <TextField
              {...field}
              label="ID"
              required
              fullWidth
              error={!!errors.id}
              helperText={errors.id?.message as string}
            />
          )}
        />
      </Grid>

      <Grid item xs={12}>
        <Controller
          name="resourceName"
          control={control}
          rules={{ required: "Resource name is required." }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Resource Name"
              fullWidth
              required
              error={!!errors.resourceName}
              helperText={errors.resourceName?.message as string}
            />
          )}
        />
      </Grid>

      <Grid item xs={12}>
        <FormControl fullWidth error={!!errors.cloudProvider}>
          <InputLabel id="cloud-provider-label">Cloud Provider *</InputLabel>
          <Controller
            name="cloudProvider"
            control={control}
            rules={{ required: "Cloud provider is required." }}
            render={({ field }) => (
              <Select
                {...field}
                labelId="cloud-provider-label"
                label="Cloud Provider *"
              >
                <MenuItem value={"aws"}>AWS</MenuItem>
                <MenuItem value={"azure"}>Azure</MenuItem>
                <MenuItem value={"gcp"}>GCP</MenuItem>
              </Select>
            )}
          />
          {typeof errors.cloudProvider?.message === 'string' && (
            <FormHelperText>{errors.cloudProvider.message}</FormHelperText>
          )}
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <Controller
          name="terraformCorePath"
          control={control}
          rules={{ required: "Terraform core path is required." }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Terraform Core Path"
              fullWidth
              required
              error={!!errors.terraformCorePath}
              helperText={errors.terraformCorePath?.message as string}
            />
          )}
        />
      </Grid>

      <Grid item xs={12}>
        <Controller
          name="terraformTemplatePath"
          control={control}
          rules={{ required: "Terraform template path is required." }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Terraform Template Path"
              fullWidth
              required
              error={!!errors.terraformTemplatePath}
              helperText={errors.terraformTemplatePath?.message as string}
            />
          )}
        />
      </Grid>
    </Grid>
  );
};

export default BasicInfo;
