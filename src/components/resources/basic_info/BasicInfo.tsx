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
      <Grid item xs={12} md={6}>
        <Controller
          name="resourceId"
          control={control}
          rules={{ required: "Id is required." }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Id"
              required
              fullWidth
              error={!!errors.resourceId}
              helperText={errors.resourceId?.message as string}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name="resourceName"
          control={control}
          rules={{ required: "Name is required." }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Name"
              fullWidth
              required
              error={!!errors.resourceName}
              helperText={errors.resourceName?.message as string}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
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

      <Grid item xs={12} md={6}>
        <Controller
          name="resourceVersion"
          control={control}
          rules={{ required: "Version is required." }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Version"
              fullWidth
              required
              error={!!errors.resourceVersion}
              helperText={errors.resourceVersion?.message as string}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
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

      <Grid item xs={12} md={6}>
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

      <Grid item xs={12}>
        <Controller
          name="resourceDescription"
          control={control}
          rules={{ required: "Description is required." }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Description"
              fullWidth
              required
              error={!!errors.resourceDescription}
              helperText={errors.resourceDescription?.message as string}
              multiline
              rows={4}
            />
          )}
        />
      </Grid>
    </Grid>
  );
};

export default BasicInfo;
