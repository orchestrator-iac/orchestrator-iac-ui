import React from "react";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Stack,
  Switch,
  Typography,
  useTheme,
} from "@mui/material";
import { PolicyScanSettings } from "../../../types/orchestrator";
import {
  POLICY_CATEGORY_KEYS,
  policyCategoryDescription,
  policyCategoryLabel,
} from "../../../utils/policyCategories";

interface PolicyScanSettingsDialogProps {
  open: boolean;
  policyScan: PolicyScanSettings;
  onChange: (value: PolicyScanSettings) => void;
  onClose: () => void;
}

export const PolicyScanSettingsDialog: React.FC<
  PolicyScanSettingsDialogProps
> = ({ open, policyScan, onChange, onClose }) => {
  const theme = useTheme();
  const selectedCategories =
    policyScan.categories && policyScan.categories.length > 0
      ? policyScan.categories
      : POLICY_CATEGORY_KEYS;

  const handleCategoryToggle = (category: string) => {
    const next = new Set(selectedCategories);
    if (next.has(category)) {
      next.delete(category);
    } else {
      next.add(category);
    }
    // All categories selected is represented as "categories: undefined"
    // (matches the backend's "falsy = all" convention), not an explicit list.
    const categories =
      next.size === POLICY_CATEGORY_KEYS.length ? undefined : Array.from(next);
    onChange({ ...policyScan, categories });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack spacing={1}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 700,
              color: theme.palette.primary.main,
              textTransform: "uppercase",
            }}
          >
            Policy scan settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Advisory security and compliance checks that run during generate.
            They never block export.
          </Typography>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Stack spacing={2}>
          <Box
            sx={{
              border: 1,
              borderColor: "divider",
              borderRadius: 2,
              px: 2,
              py: 1.5,
              bgcolor: "action.hover",
            }}
          >
            <FormControlLabel
              sx={{ m: 0, alignItems: "flex-start" }}
              control={
                <Switch
                  checked={policyScan.enabled}
                  onChange={(_, checked) =>
                    onChange({ ...policyScan, enabled: checked })
                  }
                />
              }
              label={
                <Stack spacing={0.5} sx={{ pt: 0.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Run policy scan on generate
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Review checks for encryption, public exposure, tagging, and
                    naming before you export.
                  </Typography>
                </Stack>
              }
            />
          </Box>

          <Box>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{
                letterSpacing: 1,
                color: theme.palette.primary.main,
              }}
            >
              Categories
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Choose the advisory checks you want to include. Leaving all
              categories selected keeps the default broad scan.
            </Typography>
            <FormGroup sx={{ gap: 1, opacity: policyScan.enabled ? 1 : 0.55 }}>
              {POLICY_CATEGORY_KEYS.map((category) => (
                <Box
                  key={category}
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 2,
                    px: 1.5,
                    py: 1.25,
                    bgcolor: selectedCategories.includes(category)
                      ? "action.selected"
                      : "background.paper",
                  }}
                >
                  <FormControlLabel
                    sx={{ m: 0, alignItems: "flex-start" }}
                    control={
                      <Checkbox
                        size="small"
                        checked={selectedCategories.includes(category)}
                        disabled={!policyScan.enabled}
                        onChange={() => handleCategoryToggle(category)}
                        sx={{ mt: -0.25 }}
                      />
                    }
                    label={
                      <Stack spacing={0.25} sx={{ pt: 0.25 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 600,
                            textTransform: "uppercase",
                            color: theme.palette.primary.main,
                          }}
                        >
                          {policyCategoryLabel(category)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {policyCategoryDescription(category)}
                        </Typography>
                      </Stack>
                    }
                  />
                </Box>
              ))}
            </FormGroup>
          </Box>
        </Stack>
        <DialogActions sx={{ pr: 0 }}>
          <Button onClick={onClose} variant="contained">
            Done
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

export default PolicyScanSettingsDialog;
