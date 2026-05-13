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
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { Controller, useFormContext } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { fetchIcons, resetIcons } from "../../../store/iconsSlice";
import ModificationHistory from "../modification/ModificationHistoryTimeline";

/** Normalize url field: always returns [{url, iconKind}] */
function getVariants(icon: any): { url: string; iconKind: string }[] {
  if (Array.isArray(icon.url)) return icon.url;
  if (typeof icon.url === "string") return [{ url: icon.url, iconKind: icon.iconKind ?? "unknown" }];
  return [];
}

/** Card with optional carousel for icons that have multiple URL variants */
const IconCard: React.FC<{ icon: any; onSelect: (url: string) => void }> = ({ icon, onSelect }) => {
  const variants = getVariants(icon);
  const [idx, setIdx] = useState(0);
  const current = variants[idx] ?? { url: "", iconKind: "" };
  const multi = variants.length > 1;

  const prev = (e: any) => { e.stopPropagation(); setIdx((i: number) => (i - 1 + variants.length) % variants.length); };
  const next = (e: any) => { e.stopPropagation(); setIdx((i: number) => (i + 1) % variants.length); };

  return (
    <Card
      sx={{
        borderRadius: 2,
        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "&:hover": { transform: "translateY(-4px)", boxShadow: 3 },
      }}
    >
      <CardActionArea onClick={() => onSelect(current.url)}>
        {/* Image area with prev/next arrows */}
        <Box sx={{ position: "relative" }}>
          <CardMedia
            component="img"
            height="120"
            image={current.url}
            alt={icon.name}
          />
          {multi && (
            <>
              <IconButton
                component="span"
                role="button"
                tabIndex={0}
                size="small"
                onClick={(e) => { e.stopPropagation(); prev(e); }}
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    prev(e as any);
                  }
                }}
                sx={{
                  position: "absolute", left: 2, top: "50%",
                  transform: "translateY(-50%)",
                  bgcolor: "rgba(255,255,255,0.75)",
                  p: 0.25,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.95)" },
                }}
                aria-label="previous-variant"
              >
                <ArrowBackIosNewIcon sx={{ fontSize: 12 }} />
              </IconButton>
              <IconButton
                component="span"
                role="button"
                tabIndex={0}
                size="small"
                onClick={(e) => { e.stopPropagation(); next(e); }}
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    next(e as any);
                  }
                }}
                sx={{
                  position: "absolute", right: 2, top: "50%",
                  transform: "translateY(-50%)",
                  bgcolor: "rgba(255,255,255,0.75)",
                  p: 0.25,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.95)" },
                }}
                aria-label="next-variant"
              >
                <ArrowForwardIosIcon sx={{ fontSize: 12 }} />
              </IconButton>
              {/* Dot indicators */}
              <Box sx={{ position: "absolute", bottom: 4, width: "100%", display: "flex", justifyContent: "center", gap: 0.5 }}>
                {variants.map((v, i) => (
                  <Box
                    key={v.url}
                    sx={{
                      width: 5, height: 5, borderRadius: "50%",
                      bgcolor: i === idx ? "primary.main" : "grey.400",
                    }}
                  />
                ))}
              </Box>
            </>
          )}
        </Box>

        <CardContent sx={{ pb: "8px !important" }}>
          <Tooltip title={icon.name}>
            <Typography
              variant="body2"
              color="text.primary"
              sx={{ textTransform: "capitalize", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
            >
              {icon.name}
            </Typography>
          </Tooltip>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5, flexWrap: "wrap" }}>
            {icon.type && (
              <Tooltip title={icon.type.toUpperCase()}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: 10, textTransform: "capitalize", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flexShrink: 1 }}
                >
                  {icon.type.toUpperCase()}
                </Typography>
              </Tooltip>
            )}
            {multi && current.iconKind && current.iconKind !== "unknown" && (
              <Chip
                label={current.iconKind}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontSize: 9, height: 16, flexShrink: 0 }}
              />
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

const BasicInfo: React.FC = () => {
  const { control, formState, setValue, watch } = useFormContext();
  const modifiedHistory = watch("modifiedHistory");
  const formCloudProvider = watch("cloudProvider");
  const { errors } = formState as any;

  const [showHistory, setShowHistory] = useState(false);

  // Popup state
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const dispatch = useDispatch<any>();
  const { icons, loading, page, hasMore, error } = useSelector(
    (state: any) => state.icons,
  );

  // Open popup and load first page
  const handleOpen = () => {
    setSearchQuery("");
    setOpen(true);
    dispatch(resetIcons());
    if (formCloudProvider) {
      dispatch(fetchIcons({ page: 1, pageSize: 20, cloudType: formCloudProvider }));
    }
  };

  const handleClose = () => setOpen(false);

  // Search icons
  const handleSearch = () => {
    dispatch(resetIcons());
    dispatch(fetchIcons({ query: searchQuery, page: 1, pageSize: 20, cloudType: formCloudProvider || undefined }));
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
        dispatch(fetchIcons({ query: searchQuery, page, pageSize: 20, cloudType: formCloudProvider || undefined }));
      }
    },
    [dispatch, loading, hasMore, page, searchQuery, formCloudProvider],
  );

  const handleSelectIcon = (icon: any, url: string) => {
    setValue("resourceIcon", { id: icon._id, url });
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
                      "& .MuiOutlinedInput-root": {
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
                      "& .MuiOutlinedInput-root": {
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
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 9 }}>
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
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
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
                          textTransform: "none",
                          px: 2,
                          transition:
                            "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                          "&:hover": {
                            transform: "translateY(-2px)",
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
                      "& .MuiOutlinedInput-root": {
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
            sx={{
              height: "100%",
              maxHeight: 300,
              overflowY: "auto",
              bgcolor: "inherit",
              border: "none",
            }}
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
            disabled={!formCloudProvider}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />

          {error && (
            <Typography color="error" variant="body2" sx={{ mb: 1 }}>
              {error}
            </Typography>
          )}

          {formCloudProvider ? (
            <>
              <Grid container spacing={2}>
                {icons.map((icon: any) => (
                  <Grid size={{ xs: 12, sm: 6, md: 3 }} key={icon._id ?? icon.url}>
                    <IconCard icon={icon} onSelect={(url) => handleSelectIcon(icon, url)} />
                  </Grid>
                ))}
              </Grid>

              {loading && (
                <Grid container justifyContent="center" sx={{ mt: 2 }}>
                  <CircularProgress size={24} />
                </Grid>
              )}

              {!loading && !error && icons.length === 0 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: "center", mt: 4 }}
                >
                  No icons found for this provider.
                </Typography>
              )}
            </>
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", mt: 4 }}
            >
              Please select a Cloud Provider in the form first.
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default BasicInfo;
