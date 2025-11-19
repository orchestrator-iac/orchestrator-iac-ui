import React, { useState, useCallback } from "react";
import {
  Grid,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  FormHelperText,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  CircularProgress,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  Tooltip,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Controller, useFormContext } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { fetchIcons, resetIcons } from "../../../store/iconsSlice";
import ModificationHistory from "../modification/ModificationHistoryTimeline";

const BasicInfo: React.FC = () => {
  const { control, formState, setValue, watch } = useFormContext();
  const modifiedHistory = watch("modifiedHistory");
  const { errors } = formState as any;

  const [showHistory, setShowHistory] = useState(false);

  // Popup state
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const dispatch = useDispatch<any>();
  const { icons, loading, page, hasMore } = useSelector(
    (state: any) => state.icons
  );

  // Open popup and load first page
  const handleOpen = () => {
    setOpen(true);
    dispatch(resetIcons());
    dispatch(fetchIcons({ page: 1, pageSize: 20 }));
  };

  const handleClose = () => setOpen(false);

  // Search icons
  const handleSearch = () => {
    dispatch(resetIcons());
    dispatch(fetchIcons({ query: searchQuery, page: 1, pageSize: 20 }));
  };

  // Infinite scroll handler
  const handleScroll = useCallback(
    (e: any) => {
      const { scrollTop, scrollHeight, clientHeight } = e.target;
      if (
        scrollHeight - scrollTop <= clientHeight + 50 &&
        !loading &&
        hasMore
      ) {
        dispatch(fetchIcons({ query: searchQuery, page, pageSize: 20 }));
      }
    },
    [dispatch, loading, hasMore, page, searchQuery]
  );

  const handleSelectIcon = (icon: any) => {
    setValue("resourceIcon", { id: icon._id, url: icon.url });
    setOpen(false);
  };

  return (
    <Box>
      <Grid container spacing={3} wrap="nowrap">
        <Grid
          sx={{
            transition: "flex-basis .35s ease, max-width .35s ease",
            flexBasis: { xs: "100%", md: showHistory ? "70%" : "100%" },
            maxWidth: { xs: "100%", md: showHistory ? "70%" : "100%" },
            minWidth: 0,
          }}
        >
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
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
                    error={!!errors?.resourceId}
                    helperText={errors?.resourceId?.message as string}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="resourceName"
                control={control}
                rules={{ required: "Name is required." }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Resource Name"
                    fullWidth
                    required
                    error={!!errors?.resourceName}
                    helperText={errors?.resourceName?.message as string}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth error={!!errors?.cloudProvider}>
                <InputLabel id="cloud-provider-label">
                  Cloud Provider *
                </InputLabel>
                <Controller
                  name="cloudProvider"
                  control={control}
                  rules={{ required: "Cloud provider is required." }}
                  render={({ field }) => (
                    <Select {...field} labelId="cloud-provider-label">
                      <MenuItem value={"aws"}>AWS</MenuItem>
                      <MenuItem value={"azure"}>Azure</MenuItem>
                      <MenuItem value={"gcp"}>GCP</MenuItem>
                    </Select>
                  )}
                />
                {typeof errors?.cloudProvider?.message === "string" && (
                  <FormHelperText>
                    {errors.cloudProvider.message}
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
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
                    error={!!errors?.resourceVersion}
                    helperText={errors?.resourceVersion?.message as string}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
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
                    error={!!errors?.terraformCorePath}
                    helperText={errors?.terraformCorePath?.message as string}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
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
                    error={!!errors?.terraformTemplatePath}
                    helperText={
                      errors?.terraformTemplatePath?.message as string
                    }
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 2 }}>
              <Controller
                name="resourceIcon"
                control={control}
                rules={{ required: "Icon is required." }}
                render={({ field }) => (
                  <>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Button
                        variant="outlined"
                        onClick={handleOpen}
                        color={errors?.resourceIcon ? "error" : "primary"} // ✅ fixed
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          px: 2,
                          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                          },
                        }}
                      >
                        {field.value?.url ? "Change Icon" : "Upload Icon"}
                      </Button>

                      {field.value?.url && (
                        <Box
                          component="img"
                          src={field.value.url}
                          alt="Selected Icon"
                          sx={{
                            width: 32,
                            height: 32,
                            objectFit: "contain",
                            borderRadius: 1,
                            border: "1px solid #ddd",
                            backgroundColor: "#fff",
                          }}
                        />
                      )}
                    </Box>

                    {errors?.resourceIcon && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ display: "block", mt: 0.5 }}
                      >
                        {errors.resourceIcon.message as string}
                      </Typography>
                    )}
                  </>
                )}
              />
            </Grid>

            <Grid size={12}>
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
                    error={!!errors?.resourceDescription}
                    helperText={errors?.resourceDescription?.message as string}
                    multiline
                    rows={4}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid
          sx={{
            transition:
              "flex-basis .35s ease, max-width .35s ease, opacity .25s ease",
            flexBasis: { xs: 0, md: showHistory ? "30%" : 0 },
            maxWidth: { xs: 0, md: showHistory ? "30%" : 0 },
            opacity: { xs: 0, md: showHistory ? 1 : 0 },
            overflow: "hidden",
            pointerEvents: showHistory ? "auto" : "none",
            minWidth: 0,
          }}
        >
          <Typography variant="h6" sx={{ ml: 1, mb: 1 }}>
            Modification History
          </Typography>
          <Card
            variant="outlined"
            sx={{ height: "100%", maxHeight: 300, overflowY: "auto", bgcolor: "inherit", border: "none" }}
          >
            <CardContent>
              <ModificationHistory history={modifiedHistory} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Grid size={12} sx={{ mt: 1, textAlign: "right" }}>
        <Button variant="text" onClick={() => setShowHistory((s) => !s)}>
          {showHistory
            ? "Hide modification history"
            : "View modification history"}
        </Button>
      </Grid>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>
          Select Icon
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          dividers
          sx={{ height: 400, overflowY: "auto" }}
          onScroll={handleScroll}
        >
          <TextField
            placeholder="Search icons..."
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />

          <Grid container spacing={2}>
            {icons.map((icon: any) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={icon.url}>
                <Card
                  sx={{
                    borderRadius: 2,
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3,
                    },
                  }}
                >
                  <CardActionArea onClick={() => handleSelectIcon(icon)}>
                    <CardMedia
                      component="img"
                      height="120"
                      image={icon.url}
                      alt={icon.name}
                    />
                    <CardContent>
                      <Tooltip title={icon.name}>
                        <Typography
                          variant="body2"
                          color="text.primary"
                          sx={{
                            textTransform: "capitalize",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {icon.name}
                        </Typography>
                      </Tooltip>

                      <Tooltip
                        title={[
                          icon.type?.toUpperCase(),
                          icon.cloudType?.toUpperCase(),
                        ]
                          .filter(Boolean)
                          .join(" | ")}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            fontSize: 10,
                            textTransform: "capitalize",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {[
                            icon.type?.toUpperCase(),
                            icon.cloudType?.toUpperCase(),
                          ]
                            .filter(Boolean)
                            .join(" | ")}
                        </Typography>
                      </Tooltip>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>

          {loading && (
            <Grid container justifyContent="center" sx={{ mt: 2 }}>
              <CircularProgress size={24} />
            </Grid>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default BasicInfo;
