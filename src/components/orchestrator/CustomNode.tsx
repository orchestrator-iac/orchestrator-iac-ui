import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DynamicForm from "./DynamicForm";
import { NodeData } from "../../types/node-info";

type CustomNodeProps = {
  data: NodeData;
};

const CustomNode: React.FC<CustomNodeProps> = ({ data }) => {
  const [iconSrc, setIconSrc] = useState<string | null>(null);

  useEffect(() => {
    if (data?.header?.icon) {
      import(`./../../assets/${data?.header?.icon}.svg`)
        .then((module) => setIconSrc(module.default))
        .catch((err) => console.error("Error loading image:", err));
    }
  }, [data?.header?.icon]);

  useEffect(() => {
    console.log(data);
  }, [data]);

  return (
    <Accordion
      sx={{
        boxShadow: "0 0 3px #c4c4c4",
        width: "400px",
      }}
      defaultExpanded
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          borderBottom: "1px solid #f4f4f4",
        }}
      >
        {iconSrc && (
          <img
            src={iconSrc}
            alt={data?.header?.label}
            style={{
              boxShadow: "0 0 3px #000",
              borderRadius: "16px",
              marginRight: "16px",
              height: "48px",
            }}
          />
        )}
        <div>
          <div style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
            {data?.header?.label}
            {data?.header?.info && (
              <Tooltip
                title={
                  <div
                    style={{
                      maxHeight: "200px",
                      overflowY: "auto",
                      padding: "10px",
                    }}
                  >
                    {data?.header?.info}
                  </div>
                }
                arrow
                placement="top"
                sx={{
                  "& .MuiTooltip-tooltip": {
                    backgroundColor: "#333",
                    color: "#fff",
                    fontSize: "1rem",
                    borderRadius: "8px",
                    maxHeight: "200px",
                    overflowY: "auto",
                  },
                  "& .MuiTooltip-arrow": {
                    color: "#333",
                  },
                }}
              >
                <strong
                  style={{
                    fontSize: ".8rem",
                    fontWeight: "bolder",
                    color: "#007BFF",
                    margin: "0 .8rem",
                    marginBottom: "3px",
                  }}
                >
                  info
                </strong>
              </Tooltip>
            )}
          </div>
          {data?.header?.sub_label && (
            <div
              style={{
                fontSize: "0.8rem",
                color: "#777",
              }}
            >
              {data?.header?.sub_label}
            </div>
          )}
        </div>
      </AccordionSummary>
      <AccordionDetails
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
