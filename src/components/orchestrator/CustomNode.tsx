import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  useTheme,
  Box,
  Typography,
} from "@mui/material";
import { Handle, NodeProps } from "@xyflow/react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import parse from "html-react-parser";
import DynamicForm from "./DynamicForm";
import { NodeData } from "../../types/node-info";

const API_HOST_URL = import.meta.env.VITE_API_HOST_URL;

type CustomNodeProps = NodeProps & {
  data: NodeData & {
    /** Helpers injected by Orchestrator (used by DynamicForm for graph-aware selects & edge sync) */
    __helpers?: {
      allNodes?: any[];
      allEdges?: any[];
      onLinkFieldChange?: (args: {
        nodeId: string;
        bind: string;
        newSourceId: string;
      }) => void;
    };
    /** Optional schema-driven link rules */
    links?: Array<{
      bind: string;
      fromTypes: string[];
      cardinality?: string;
      edgeData?: any;
    }>;
    /** Preserved domain type (set by Orchestrator); not used here directly but available if needed */
    __nodeType?: string;
  };
  isOrchestrator?: boolean;
};

const CustomNode: React.FC<CustomNodeProps> = ({
  id,
  data,
  isOrchestrator = true,
}) => {
  const theme = useTheme();

  const renderInfo = (info?: string | JSX.Element) => {
    if (!info) return null;
    return typeof info === "string" ? parse(info) : info;
  };

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
        }}
      >
        {data?.header?.icon && (
          <Box
            component="img"
            src={`${API_HOST_URL}${data?.header?.icon}`}
            alt={data?.header?.label || "Resource Icon"}
            sx={{
              width: 50,
              height: 50,
              borderRadius: "8px",
              mr: 2,
              objectFit: "contain",
              boxShadow: `0 0 2px ${theme.palette.secondary.main}`,
            }}
          />
        )}
        <Box>
          <Box style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
            {data?.header?.label}
            {data?.header?.info && (
              <Tooltip
                title={
                  <Box
                    style={{
                      maxHeight: "200px",
                      overflowY: "auto",
                      padding: "10px",
                    }}
                  >
                    {renderInfo(data?.header?.info)}
                  </Box>
                }
                arrow
                placement="top"
                componentsProps={{
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
                    fontSize: "0.8rem",
                    fontWeight: "bolder",
                    color: "primary.main",
                    mx: "0.8rem",
                    mb: "3px",
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
              style={{
                fontSize: "0.8rem",
                color: "#777",
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
              isConnectable
            />
          ))}
      </AccordionSummary>

      <AccordionDetails
        className="nowheel"
        sx={{
          maxHeight: "calc(100vh - 300px)",
          overflowY: "auto",
        }}
      >
        <DynamicForm
          config={data?.fields ?? []}
          values={data?.values ?? {}}
          nodeId={id}
          links={data?.links}
          allNodes={data?.__helpers?.allNodes}
          allEdges={data?.__helpers?.allEdges}
          onLinkFieldChange={(bind, newSourceId) =>
            data?.__helpers?.onLinkFieldChange?.({ nodeId: id, bind, newSourceId })
          }
        />
      </AccordionDetails>
    </Accordion>
  );
};

export default CustomNode;
