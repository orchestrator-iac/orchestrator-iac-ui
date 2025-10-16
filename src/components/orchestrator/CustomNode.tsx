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
import { Handle, NodeProps } from "@xyflow/react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import parse from "html-react-parser";
import DynamicForm from "./DynamicForm";
import { NodeData } from "../../types/node-info";
import { UserProfile } from "../../types/auth";
import { CloudConfig } from "../../types/clouds-info";

const API_HOST_URL = import.meta.env.VITE_API_HOST_URL;

type CustomNodeProps = NodeProps & {
  data: NodeData & {
    __helpers?: {
      allNodes?: any[];
      allEdges?: any[];
      onLinkFieldChange?: (
        bind: string,
        newSourceId: string,
        context?: { objectSnapshot?: Record<string, any> }
      ) => void;
      onValuesChange?: (name: string, value: any) => void;
      onCloneNode?: (nodeId: string) => void;
      onDeleteNode?: (nodeId: string) => void;
    };
    links?: Array<{
      bind: string;
      fromTypes: string[];
      cardinality?: "1" | "many";
      edgeData?: any;
    }>;
    __nodeType?: string;
    resourceId?: string;
    userInfo?: UserProfile;
    templateInfo?: CloudConfig;
  };
  isOrchestrator?: boolean;
};

const CustomNode: React.FC<CustomNodeProps> = ({
  id,
  data,
  isOrchestrator = true,
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const renderInfo = (info?: string | JSX.Element) => {
    if (!info) return null;
    return typeof info === "string" ? parse(info) : info;
  };

  // Friendly ID chip like vpc-0001 based on __nodeType and index among same type
  const typeCode = data?.__nodeType ?? "";
  const indexWithinType = React.useMemo(() => {
    const all = data?.__helpers?.allNodes ?? [];
    if (!typeCode || !Array.isArray(all)) return null;
    const sameType = all.filter((n: any) => n.data?.__nodeType === typeCode);
    const pos = sameType.findIndex((n: any) => n.id === id);
    return pos >= 0 ? pos + 1 : null;
  }, [data?.__helpers?.allNodes, typeCode, id]);

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

  const friendlyId =
    typeCode && indexWithinType
      ? `${typeCode}-${String(indexWithinType).padStart(4, "0")}`
      : "";

  return (
    <Accordion
      sx={{
        boxShadow: `0 0 3px ${theme.palette.background.paper}`,
        width: "400px",
      }}
      defaultExpanded
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          borderBottom: `1px solid ${theme.palette.background.paper}`,
          alignItems: "center",
          gap: 1,
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

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title={friendlyId} arrow placement="top">
            <Chip
              size="small"
              label={friendlyId}
              sx={{
                ml: "auto",
                color: theme.palette.textVariants.text4,
                maxWidth: "80px",
                "& .MuiChip-label": {
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                },
              }}
              variant="filled"
            />
          </Tooltip>
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

        {isOrchestrator &&
          (data?.handles ?? []).map((handle, idx) => (
            <Handle
              key={`${handle?.type}-${handle?.position}-${idx}`}
              type={handle?.type}
              position={handle?.position}
              style={{ width: 10, height: 15, borderRadius: "15%" }}
              isConnectable
            />
          ))}
      </AccordionSummary>

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
