import React from "react";
import {
  Box,
  Chip,
  Divider,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { Handle } from "@xyflow/react";
import { useTheme } from "@mui/material/styles";

import { getFriendlyId, resolveValueByPath } from "./utils/nodePresentation";
import { OrchestratorNodeProps } from "./types";

const asDisplayString = (value: any): string => {
  if (value == null) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return "";
};

const ArchitectureNode: React.FC<OrchestratorNodeProps> = ({
  id,
  data,
  isConnectable,
}) => {
  const theme = useTheme();

  const friendlyId = React.useMemo(
    () => getFriendlyId(id, data?.__nodeType, data?.__helpers?.allNodes),
    [id, data?.__nodeType, data?.__helpers?.allNodes],
  );

  const iconSrc = React.useMemo(() => {
    return data?.header?.icon || "";
  }, [data?.header?.icon]);

  const architectureView = data?.architectureView;

  const primaryText = React.useMemo(() => {
    const configured = architectureView?.primaryText;
    if (configured && configured.trim().length > 0) {
      return configured;
    }
    const derived = architectureView?.primaryKey
      ? resolveValueByPath(data?.values, architectureView.primaryKey)
      : undefined;
    if (derived != null && derived !== "") {
      return asDisplayString(derived);
    }
    const fallback = data?.header?.label ?? "";
    return fallback;
  }, [
    architectureView?.primaryKey,
    architectureView?.primaryText,
    data?.header?.label,
    data?.values,
  ]);

  const secondaryText = React.useMemo(() => {
    const configured = architectureView?.secondaryText;
    if (configured && configured.trim().length > 0) {
      return configured;
    }
    const derived = architectureView?.secondaryKey
      ? resolveValueByPath(data?.values, architectureView.secondaryKey)
      : undefined;
    if (derived != null && derived !== "") {
      return asDisplayString(derived);
    }
    return data?.header?.sub_label ?? "";
  }, [
    architectureView?.secondaryKey,
    architectureView?.secondaryText,
    data?.header?.sub_label,
    data?.values,
  ]);

  const tagItems = React.useMemo(() => {
    if (!architectureView?.tags?.length) {
      return [] as Array<{ key: string; label: string; color?: string }>;
    }

    const seen = new Set<string>();

    return architectureView.tags
      .map<{ key: string; label: string; color?: string } | null>(
        (tag, idx) => {
          const raw = tag.valueKey
            ? resolveValueByPath(data?.values, tag.valueKey)
            : tag.value;
          const displayValue = asDisplayString(raw);
          if (!displayValue) {
            return null;
          }
          const tagLabel = tag.label
            ? `${tag.label}: ${displayValue}`
            : displayValue;
          const key = tag.valueKey ?? `${idx}-${displayValue}`;
          if (seen.has(key)) {
            return null;
          }
          seen.add(key);
          return { key, label: tagLabel, color: tag.color };
        },
      )
      .filter((chip): chip is { key: string; label: string; color?: string } =>
        Boolean(chip),
      );
  }, [architectureView?.tags, data?.values]);

  const fieldEntries = React.useMemo(() => {
    const entries = new Map<string, string>();

    architectureView?.fields?.forEach((field) => {
      const raw = field.valueKey
        ? resolveValueByPath(data?.values, field.valueKey)
        : field.value;
      const displayValue = asDisplayString(raw);
      if (!displayValue) {
        return;
      }
      entries.set(field.label, displayValue);
    });

    const resourceName =
      data?.values?.name ??
      data?.values?.resourceName ??
      data?.values?.resource_name;
    if (resourceName && !entries.has("Resource Name")) {
      entries.set("Resource Name", asDisplayString(resourceName));
    }

    if (data?.__nodeType && !entries.has("Resource Type")) {
      entries.set("Resource Type", data.__nodeType);
    }

    return Array.from(entries.entries()).map(([label, value]) => ({
      label,
      value,
    }));
  }, [architectureView?.fields, data?.values, data?.__nodeType]);

  return (
    <Paper
      elevation={1}
      sx={{
        px: 2,
        py: 1.75,
        minWidth: 260,
        maxWidth: 320,
        borderRadius: 2,
        backgroundColor: theme.palette.background.paper,
        boxShadow: `0 0 6px ${theme.palette.divider}`,
      }}
    >
      <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
        {iconSrc && (
          <Box
            component="img"
            src={iconSrc}
            alt={data?.header?.label || "Resource Icon"}
            sx={{
              width: 44,
              height: 44,
              borderRadius: "10px",
              objectFit: "contain",
              boxShadow: `0 0 3px ${theme.palette.secondary.main}`,
            }}
          />
        )}

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {primaryText}
          </Typography>
          {secondaryText && (
            <Typography
              variant="body2"
              sx={{
                color:
                  theme.palette.textVariants?.text4 ||
                  theme.palette.text.secondary,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {secondaryText}
            </Typography>
          )}
        </Box>

        {friendlyId && (
          <Tooltip title={friendlyId} arrow placement="top">
            <Chip
              size="small"
              label={friendlyId}
              sx={{
                color:
                  theme.palette.textVariants?.text4 ||
                  theme.palette.text.secondary,
                maxWidth: "92px",
                "& .MuiChip-label": {
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                },
              }}
            />
          </Tooltip>
        )}
      </Box>

      {tagItems.length > 0 && (
        <Stack direction="row" flexWrap="wrap" spacing={0.5} sx={{ mt: 1 }}>
          {tagItems.map((tag) => (
            <Chip
              key={tag.key}
              size="small"
              label={tag.label}
              color={(tag.color as any) || "default"}
              variant={tag.color ? "filled" : "outlined"}
              sx={{ fontSize: "0.7rem" }}
            />
          ))}
        </Stack>
      )}

      {architectureView?.description && (
        <Typography
          variant="body2"
          sx={{
            mt: 1.25,
            color:
              theme.palette.textVariants?.text3 || theme.palette.text.secondary,
          }}
        >
          {architectureView.description}
        </Typography>
      )}

      {fieldEntries.length > 0 && (
        <Box sx={{ mt: 1.5 }}>
          <Divider sx={{ mb: 1 }} />
          <Stack spacing={0.75}>
            {fieldEntries.map((field) => (
              <Box
                key={field.label}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color:
                      theme.palette.textVariants?.text4 ||
                      theme.palette.text.secondary,
                  }}
                >
                  {field.label}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color:
                      theme.palette.textVariants?.text1 ||
                      theme.palette.text.primary,
                  }}
                >
                  {field.value}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {(data?.handles ?? []).map((handle, idx) => (
        <Handle
          key={`${handle?.type}-${handle?.position}-${idx}`}
          type={handle?.type}
          position={handle?.position}
          style={{ width: 10, height: 15, borderRadius: "15%" }}
          isConnectable={Boolean(isConnectable)}
        />
      ))}
    </Paper>
  );
};

export default ArchitectureNode;
