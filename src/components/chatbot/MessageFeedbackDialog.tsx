import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { alpha, useTheme } from "@mui/material/styles";
import type {
  ChatMessageFeedback,
  ChatMessageFeedbackRequest,
  MessageFeedbackSentiment,
} from "@/types/chat";

const POSITIVE_REASONS = [
  "Solved my task",
  "Followed my instructions",
  "Good code / output quality",
  "Fast and efficient",
  "Useful autonomy",
  "Other",
] as const;

const NEGATIVE_REASONS = [
  "Incorrect or incomplete",
  "Didn't follow my instructions",
  "Off track / wrong scope",
  "Lost context",
  "Slow or buggy",
  "Safety or legal concern",
  "Other",
] as const;

interface MessageFeedbackDialogProps {
  open: boolean;
  sentiment: MessageFeedbackSentiment;
  existingFeedback?: ChatMessageFeedback;
  onClose: () => void;
  onSubmit: (feedback: ChatMessageFeedbackRequest) => Promise<void>;
}

const MessageFeedbackDialog: React.FC<MessageFeedbackDialogProps> = ({
  open,
  sentiment,
  existingFeedback,
  onClose,
  onSubmit,
}) => {
  const theme = useTheme();
  const dark = theme.palette.mode === "dark";
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reasonOptions = useMemo(
    () => (sentiment === "positive" ? POSITIVE_REASONS : NEGATIVE_REASONS),
    [sentiment],
  );

  useEffect(() => {
    if (!open) return;

    if (existingFeedback?.sentiment === sentiment) {
      setSelectedReasons(existingFeedback.reasons);
      setDetails(existingFeedback.details ?? "");
    } else {
      setSelectedReasons([]);
      setDetails("");
    }
    setIsSubmitting(false);
    setError(null);
  }, [existingFeedback, open, sentiment]);

  const title =
    sentiment === "positive" ? "Share positive feedback" : "Share feedback";
  const subtitle =
    sentiment === "positive"
      ? "What worked well in this Maestro response?"
      : "What should Maestro improve in this response?";

  const handleToggleReason = (reason: string) => {
    setSelectedReasons((current) =>
      current.includes(reason)
        ? current.filter((item) => item !== reason)
        : [...current, reason],
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const trimmedDetails = details.trim();
      await onSubmit({
        sentiment,
        reasons: selectedReasons,
        ...(trimmedDetails ? { details: trimmedDetails } : {}),
      });
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "Failed to save feedback.",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ pr: 6 }}>
        {title}
        <IconButton
          aria-label="Close feedback dialog"
          onClick={onClose}
          disabled={isSubmitting}
          sx={{ position: "absolute", top: 10, right: 10 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" mb={2}>
          {subtitle}
        </Typography>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" mb={2}>
          {reasonOptions.map((reason) => {
            const selected = selectedReasons.includes(reason);
            return (
              <Chip
                key={reason}
                label={`+ ${reason}`}
                onClick={() => handleToggleReason(reason)}
                variant={selected ? "filled" : "outlined"}
                color={selected ? "primary" : "default"}
                disabled={isSubmitting}
                sx={{
                  borderRadius: 999,
                  bgcolor: selected
                    ? undefined
                    : alpha(theme.palette.text.primary, dark ? 0.08 : 0.03),
                }}
              />
            );
          })}
        </Stack>
        <TextField
          fullWidth
          multiline
          minRows={5}
          maxRows={8}
          label="Share details (optional)"
          placeholder="Tell us what worked well or what Maestro missed."
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          disabled={isSubmitting}
        />
        <Box mt={2}>
          <Typography variant="caption" color="text.secondary">
            Your feedback can be used to improve Maestro.
          </Typography>
        </Box>
        {error && (
          <Box mt={1.5}>
            <Typography variant="caption" color="error">
              {error}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MessageFeedbackDialog;
