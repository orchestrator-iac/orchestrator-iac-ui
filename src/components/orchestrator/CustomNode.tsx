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
import { Handle } from "@xyflow/react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import parse from "html-react-parser";
import DynamicForm from "./DynamicForm";
import { NodeData } from "../../types/node-info";

const API_HOST_URL = import.meta.env.VITE_API_HOST_URL;

type CustomNodeProps = {
  data: NodeData;
  isOrchestrator?: boolean;
};

const CustomNode: React.FC<CustomNodeProps> = ({
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
            alt="Selected Icon"
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
          data?.handles?.length > 0 &&
          data?.handles?.map((handle) => (
            <Handle
              key={handle?.type}
              type={handle?.type}
              position={handle?.position}
              style={{
                width: 10,
                height: 15,
                borderRadius: "15%",
              }}
              isConnectable={true}
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
        <DynamicForm config={data?.fields} values={data?.values}></DynamicForm>
      </AccordionDetails>
    </Accordion>
  );
};

export default CustomNode;
