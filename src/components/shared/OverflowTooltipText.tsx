import React from "react";
import { Box, Tooltip } from "@mui/material";
import type { BoxProps, TooltipProps } from "@mui/material";

const ellipsisTextSx: BoxProps["sx"] = {
  display: "block",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

interface OverflowTooltipTextProps {
  text?: string | null;
  className?: string;
  component?: React.ElementType;
  sx?: BoxProps["sx"];
  tooltipSlotProps?: TooltipProps["slotProps"];
  tooltipPlacement?: TooltipProps["placement"];
}

export default function OverflowTooltipText({
  text,
  className,
  component = "div",
  sx,
  tooltipSlotProps,
  tooltipPlacement = "top",
}: OverflowTooltipTextProps) {
  const textRef = React.useRef<HTMLElement | null>(null);
  const [isTruncated, setIsTruncated] = React.useState(false);

  React.useEffect(() => {
    const element = textRef.current;
    if (!element || !text) {
      setIsTruncated(false);
      return;
    }

    const syncTruncation = () => {
      const next =
        element.scrollWidth > element.clientWidth ||
        element.scrollHeight > element.clientHeight;
      setIsTruncated((current) => (current === next ? current : next));
    };

    const frameId = window.requestAnimationFrame(syncTruncation);
    syncTruncation();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", syncTruncation);
      return () => {
        window.cancelAnimationFrame(frameId);
        window.removeEventListener("resize", syncTruncation);
      };
    }

    const resizeObserver = new ResizeObserver(syncTruncation);
    resizeObserver.observe(element);

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
    };
  }, [text]);

  if (!text) {
    return null;
  }

  return (
    <Tooltip
      title={text}
      arrow
      placement={tooltipPlacement}
      disableHoverListener={!isTruncated}
      disableFocusListener={!isTruncated}
      disableTouchListener={!isTruncated}
      slotProps={tooltipSlotProps}
    >
      <Box
        ref={textRef}
        component={component}
        className={className}
        sx={
          sx
            ? [ellipsisTextSx, ...(Array.isArray(sx) ? sx : [sx])]
            : ellipsisTextSx
        }
      >
        {text}
      </Box>
    </Tooltip>
  );
}
