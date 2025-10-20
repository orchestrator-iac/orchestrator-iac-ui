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
} from "@mui/material";
import { Handle } from "@xyflow/react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import parse from "html-react-parser";
import DynamicForm from "./DynamicForm";
import { getFriendlyId } from "./utils/nodePresentation";
import { OrchestratorNodeProps } from "./types";

const API_HOST_URL = import.meta.env.VITE_API_HOST_URL;

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
    data?.isExpanded ?? true
  );

  // Update expanded state when data changes (e.g., when loading saved orchestrator)
  React.useEffect(() => {
    if (data?.isExpanded !== undefined) {
      setExpanded(data.isExpanded);
    }
  }, [data?.isExpanded]);

  const handleAccordionChange = (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded);
    // Save the expanded state back to node data via a special handler
    // We need to update node.data.isExpanded, not node.data.values.__isExpanded
    if (data?.__helpers?.onValuesChange) {
      // Store in values temporarily so it gets included in transforms
      data.__helpers.onValuesChange('__isExpanded', isExpanded);
    }
  };

  const renderInfo = (info?: string | JSX.Element) => {
    if (!info) return null;
    return typeof info === "string" ? parse(info) : info;
  };

  const friendlyId = React.useMemo(
    () => getFriendlyId(id, data?.__nodeType, data?.__helpers?.allNodes),
    [id, data?.__nodeType, data?.__helpers?.allNodes]
  );

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
        boxShadow: `0 0 3px ${theme.palette.background.paper}`,
        width: "400px",
      }}
      expanded={expanded}
      onChange={handleAccordionChange}
    >
      <Box sx={{ position: "relative" }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            borderBottom: `1px solid ${theme.palette.background.paper}`,
            alignItems: "center",
            gap: 1,
            pr: 7,
          }}
        >
        {data?.header?.icon && (
          <Box
            component="img"
            src={`${API_HOST_URL}${data?.header?.icon}`}
            alt={data?.header?.label || "Resource Icon"}
            sx={{
              width: 42,
              height: 42,
              borderRadius: "8px",
              mr: 1.5,
              objectFit: "contain",
              boxShadow: `0 0 2px ${theme.palette.secondary.main}`,
            }}
          />
        )}

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              fontSize: "1.05rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Box
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "120px",
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
            <Box
              sx={{
                fontSize: "0.8rem",
                color: theme.palette.textVariants.text4,
              }}
            >
              {data?.header?.sub_label}
            </Box>
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
        </AccordionSummary>

        <Box
          sx={{
            position: "absolute",
            top: "50%",
            right: 12,
            transform: "translateY(-50%)",
            display: "flex",
            alignItems: "center",
            gap: 1,
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
                  marginRight: 4,
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

          <Box onMouseDown={(event) => event.stopPropagation()}>
            <IconButton
              aria-label="node actions"
              onClick={(e) => {
                e.stopPropagation();
                handleMenuOpen(e);
              }}
              size="small"
              sx={{ opacity: 0.6, "&:hover": { opacity: 1 } }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>
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
              <DeleteOutlineIcon fontSize="small" style={{ marginRight: 8 }} />
              Delete
            </MenuItem>
          </Menu>
        </Box>
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
          allNodes={data?.__helpers?.allNodes}
          allEdges={data?.__helpers?.allEdges}
          templateInfo={data?.templateInfo}
          userInfo={data?.userInfo}
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

export default CustomNode;
