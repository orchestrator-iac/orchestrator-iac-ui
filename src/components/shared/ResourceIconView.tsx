import React from "react";
import { Box, type SxProps, type Theme } from "@mui/material";

import { normalizeResourceIcon } from "@/types/resourceIcon";

interface ResourceIconViewProps {
  icon?: unknown;
  alt: string;
  className?: string;
  sx?: SxProps<Theme>;
}

const ResourceIconView: React.FC<ResourceIconViewProps> = ({
  icon,
  alt,
  className,
  sx,
}) => {
  const normalized = normalizeResourceIcon(icon);
  const atlasCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const atlasHostRef = React.useRef<HTMLDivElement | null>(null);
  if (!normalized) {
    return null;
  }

  const atlasSprite =
    normalized.sprite?.sheetUrl &&
    typeof normalized.sprite.x === "number" &&
    typeof normalized.sprite.y === "number" &&
    typeof normalized.sprite.width === "number" &&
    typeof normalized.sprite.height === "number" &&
    typeof normalized.sprite.sheetWidth === "number" &&
    typeof normalized.sprite.sheetHeight === "number"
      ? normalized.sprite
      : null;
  const atlasDisplayScale =
    atlasSprite && atlasSprite.pixelRatio && atlasSprite.pixelRatio > 0
      ? atlasSprite.pixelRatio
      : 1;

  React.useEffect(() => {
    if (!atlasSprite) {
      return;
    }

    const host = atlasHostRef.current;
    const canvas = atlasCanvasRef.current;
    if (!host || !canvas) {
      return;
    }

    const image = new Image();
    image.crossOrigin = "anonymous";

    const draw = () => {
      const currentHost = atlasHostRef.current;
      const currentCanvas = atlasCanvasRef.current;
      if (!currentHost || !currentCanvas || !image.complete) {
        return;
      }

      const rect = currentHost.getBoundingClientRect();
      const fallbackWidth = atlasSprite.width / atlasDisplayScale;
      const fallbackHeight = atlasSprite.height / atlasDisplayScale;
      const width = Math.max(1, Math.round(rect.width || fallbackWidth));
      const height = Math.max(1, Math.round(rect.height || fallbackHeight));
      const dpr = window.devicePixelRatio || 1;
      currentCanvas.width = Math.round(width * dpr);
      currentCanvas.height = Math.round(height * dpr);
      currentCanvas.style.width = `${width}px`;
      currentCanvas.style.height = `${height}px`;

      const context = currentCanvas.getContext("2d");
      if (!context) {
        return;
      }

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);
      context.imageSmoothingEnabled = true;
      context.drawImage(
        image,
        atlasSprite.x,
        atlasSprite.y,
        atlasSprite.width,
        atlasSprite.height,
        0,
        0,
        width,
        height,
      );
    };

    const resizeObserver = new ResizeObserver(() => draw());
    resizeObserver.observe(host);
    image.onload = () => draw();
    image.src = atlasSprite.sheetUrl;

    return () => {
      resizeObserver.disconnect();
    };
  }, [atlasSprite]);

  if (atlasSprite) {
    return (
      <Box
        role="img"
        aria-label={alt}
        className={className}
        ref={atlasHostRef}
        sx={{
          ...((sx as object) || {}),
          width: (sx as any)?.width ?? atlasSprite.width / atlasDisplayScale,
          height:
            (sx as any)?.height ?? atlasSprite.height / atlasDisplayScale,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <canvas
          ref={atlasCanvasRef}
          aria-hidden="true"
          style={{ display: "block", width: "100%", height: "100%" }}
        />
      </Box>
    );
  }

  if (normalized.sprite?.sheetUrl && normalized.sprite.symbolId) {
    return (
      <Box
        component="svg"
        role="img"
        aria-label={alt}
        className={className}
        viewBox={normalized.sprite.viewBox}
        sx={{
          ...((sx as object) || {}),
          flexShrink: 0,
        }}
      >
        <title>{alt}</title>
        <use
          href={`${normalized.sprite.sheetUrl}#${normalized.sprite.symbolId}`}
        />
      </Box>
    );
  }

  if (!normalized.url) {
    return null;
  }

  return (
    <Box
      component="img"
      src={normalized.url}
      alt={alt}
      className={className}
      sx={{
        ...((sx as object) || {}),
        flexShrink: 0,
      }}
    />
  );
};

export default ResourceIconView;
