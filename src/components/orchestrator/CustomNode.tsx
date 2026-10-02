import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  useTheme,
  Box,
  Typography,
  Chip,
  IconButton,
  alpha,
} from "@mui/material";
import { Handle } from "@xyflow/react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import parse from "html-react-parser";
import OverflowTooltipText from "../shared/OverflowTooltipText";
import ResourceIconView from "../shared/ResourceIconView";
import DynamicForm from "./DynamicForm";
import { getFriendlyId } from "./utils/nodePresentation";
import {
  areOrchestratorNodePropsEqual,
  OrchestratorNodeProps,
} from "./types";
import { DriftStatus } from "../../types/orchestrator";

const CUSTOM_NODE_ICON_SIZE = 56;

/** Border treatment for the drift status attached by Tier 1 state reconciliation. */
const getDriftBorder = (status: DriftStatus | undefined, fallback: string): string => {
  switch (status) {
    case "drifted":
      return "0 0 0 2px #ed6c02";
    case "unable_to_compare":
      return "0 0 0 2px #0288d1";
    case "not_applied":
      return "0 0 0 2px #9e9e9e";
    default:
      return `0 0 3px ${fallback}`;
  }
};

const getDriftBadge = (
  status: DriftStatus | undefined,
): { label: string; color: "warning" | "info" | "default" } | null => {
  switch (status) {
    case "drifted":
      return { label: "Drifted", color: "warning" };
    case "not_applied":
      return { label: "Not applied", color: "default" };
    case "unable_to_compare":
      return { label: "Unable to compare", color: "info" };
    default:
      return null;
  }
};

const CustomNode: React.FC<OrchestratorNodeProps> = ({
  id,
  data,
  isOrchestrator = true,
  isConnectable,
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Controlled accordion state - defaults to expanded, but can be saved/restored
  const [expanded, setExpanded] = React.useState<boolean>(
    data?.isExpanded ?? true,
  );

  // Update expanded state when data changes (e.g., when loading saved orchestrator)
  React.useEffect(() => {
    if (data?.isExpanded !== undefined) {
      setExpanded(data.isExpanded);
    }
  }, [data?.isExpanded]);

  const handleAccordionChange = (
    _event: React.SyntheticEvent,
    isExpanded: boolean,
  ) => {
    setExpanded(isExpanded);
    // Save the expanded state back to node data via a special handler
    // We need to update node.data.isExpanded, not node.data.values.__isExpanded
    if (data?.__helpers?.onValuesChange) {
      // Store in values temporarily so it gets included in transforms
      data.__helpers.onValuesChange("__isExpanded", isExpanded);
    }
  };

  const renderInfo = (info?: string | JSX.Element) => {
    if (!info) return null;
    return typeof info === "string" ? parse(info) : info;
  };

  const friendlyId = React.useMemo(
    () =>
      (data as any)?.friendlyId ??
      getFriendlyId(id, data?.__nodeType, data?.__helpers?.getAllNodes?.()),
    [id, data, data?.__nodeType, data?.__helpers?.getAllNodes],
  );

  const driftStatus = data?.__driftStatus;
  const driftBorder = getDriftBorder(driftStatus, theme.palette.background.paper);
  const driftBadge = getDriftBadge(driftStatus);

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleDuplicate = () => {
    handleMenuClose();
    data?.__helpers?.onCloneNode?.(id);
  };
  const handleDelete = () => {
    handleMenuClose();
    data?.__helpers?.onDeleteNode?.(id);
  };

  return (
    <Accordion
      sx={{
        boxShadow: driftBorder,
        width: "400px",
        borderRadius: 1.5,
        overflow: "hidden",
        backgroundColor: "background.paper",
        "&::before": {
          display: "none",
        },
      }}
      expanded={expanded}
      onChange={handleAccordionChange}
    >
      <Box sx={{ position: "relative" }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            minHeight: 64,
            px: 2,
            py: 0.375,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.75)}`,
            alignItems: "center",
            gap: 1.5,
            "& .MuiAccordionSummary-content": {
              alignItems: "center",
              gap: 1.5,
              margin: 0,
              minWidth: 0,
            },
            "&.Mui-expanded": {
              minHeight: 64,
            },
            "& .MuiAccordionSummary-expandIconWrapper": {
              ml: 0.25,
              color: theme.palette.textVariants.text3,
            },
          }}
        >
          {data?.header?.icon && (
            <Box
              sx={{
                width: CUSTOM_NODE_ICON_SIZE,
                height: CUSTOM_NODE_ICON_SIZE,
                mr: 1.5,
                flexShrink: 0,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 1.25,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.22)}`,
              }}
            >
              <ResourceIconView
                icon={data?.header?.icon}
                alt={data?.header?.label || "Resource Icon"}
                sx={{
                  width: "100%",
                  height: "100%",
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </Box>
          )}

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                fontSize: "1.08rem",
                fontWeight: 750,
                lineHeight: 1.2,
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                minWidth: 0,
              }}
            >
              <Box
                sx={{
                  minWidth: 0,
                  flex: "1 1 auto",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {data?.header?.label}
              </Box>
              {data?.header?.info && (
                <Tooltip
                  title={
                    <Box sx={{ maxHeight: 200, overflowY: "auto", p: 1 }}>
                      {renderInfo(data?.header?.info)}
                    </Box>
                  }
                  arrow
                  placement="top"
                  slotProps={{
                    tooltip: {
                      sx: {
                        bgcolor: theme.palette.background.paper,
                        color: theme.palette.textVariants.text1,
                        "& .MuiTooltip-arrow": {
                          color: theme.palette.background.paper,
                        },
                      },
                    },
                  }}
                >
                  <Typography
                    component="strong"
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      color: "primary.main",
                      cursor: "pointer",
                    }}
                  >
                    info
                  </Typography>
                </Tooltip>
              )}
            </Box>

            {data?.header?.sub_label && (
              <OverflowTooltipText
                text={data?.header?.sub_label}
                sx={{
                  fontSize: "0.8rem",
                  color: theme.palette.textVariants.text4,
                }}
                tooltipSlotProps={{
                  tooltip: {
                    sx: {
                      bgcolor: theme.palette.background.paper,
                      color: theme.palette.textVariants.text1,
                      "& .MuiTooltip-arrow": {
                        color: theme.palette.background.paper,
                      },
                    },
                  },
                }}
              />
            )}
          </Box>
          {isOrchestrator &&
            (data?.handles ?? []).map((handle, idx) => (
              <Handle
                key={`${handle?.type}-${handle?.position}-${idx}`}
                type={handle?.type}
                position={handle?.position}
                style={{ width: 10, height: 15, borderRadius: "15%" }}
                isConnectable={Boolean(isConnectable)}
              />
            ))}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              flexShrink: 0,
              ml: 0.5,
            }}
          >
            {friendlyId && (
              <Tooltip title={friendlyId} arrow placement="top">
                <Chip
                  size="small"
                  label={friendlyId}
                  onMouseDown={(event) => event.stopPropagation()}
                  onClick={(event) => event.stopPropagation()}
                  sx={{
                    color: theme.palette.textVariants.text4,
                    maxWidth: "96px",
                    backgroundColor: alpha(theme.palette.text.primary, 0.08),
                    border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
                    "& .MuiChip-label": {
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    },
                  }}
                  variant="filled"
                />
              </Tooltip>
            )}

            {driftBadge && (
              <Chip
                size="small"
                label={driftBadge.label}
                color={driftBadge.color}
                onMouseDown={(event) => event.stopPropagation()}
                onClick={(event) => event.stopPropagation()}
                sx={{ height: 22, fontSize: "0.68rem", fontWeight: 700 }}
              />
            )}

            <IconButton
              size="small"
              aria-label="Node actions"
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event: React.MouseEvent<HTMLElement>) => {
                event.stopPropagation();
                handleMenuOpen(event);
              }}
              sx={{
                width: 32,
                height: 32,
                color: theme.palette.textVariants.text3,
                "&:hover": {
                  color: theme.palette.text.primary,
                  backgroundColor: alpha(theme.palette.action.active, 0.1),
                },
                "&:focus-visible": {
                  outline: `2px solid ${theme.palette.primary.main}`,
                  outlineOffset: 2,
                },
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={(e) => {
                (e as any)?.stopPropagation?.();
                handleMenuClose();
              }}
              onClick={(e) => (e as any).stopPropagation()}
              elevation={3}
            >
              <MenuItem onClick={handleDuplicate}>
                <ContentCopyIcon fontSize="small" style={{ marginRight: 8 }} />
                Duplicate
              </MenuItem>
              <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
                <DeleteOutlineIcon
                  fontSize="small"
                  style={{ marginRight: 8 }}
                />
                Delete
              </MenuItem>
            </Menu>
          </Box>
        </AccordionSummary>
      </Box>

      <AccordionDetails
        className="nowheel"
        sx={{ maxHeight: "min(calc(100vh - 300px), 400px)", overflowY: "auto" }}
      >
        <DynamicForm
          /* form schema + current values */
          config={data?.fields ?? []}
          values={data?.values ?? {}}
          /* graph-aware props for dynamic options + link sync */
          nodeId={id}
          links={data?.links}
          getAllNodes={data?.__helpers?.getAllNodes}
          templateInfo={data?.templateInfo}
          userInfo={data?.userInfo}
          validationErrors={data?.__validationErrors}
          onLinkFieldChange={(bind, newSourceId, context) =>
            data?.__helpers?.onLinkFieldChange?.(bind, newSourceId, context)
          }
          onValuesChange={(name, value) =>
            data?.__helpers?.onValuesChange?.(name, value)
          }
        />
      </AccordionDetails>
    </Accordion>
  );
};

export default React.memo(CustomNode, areOrchestratorNodePropsEqual);
