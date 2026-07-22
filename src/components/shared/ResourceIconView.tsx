import React from "react";
import { Box, type SxProps, type Theme } from "@mui/material";

import {
  normalizeResourceIcon,
  type ResourceSpriteRef,
} from "@/types/resourceIcon";

interface ResourceIconViewProps {
  icon?: unknown;
  alt: string;
  className?: string;
  sx?: SxProps<Theme>;
}

type AtlasSprite = ResourceSpriteRef & {
  x: number;
  y: number;
  width: number;
  height: number;
  sheetWidth: number;
  sheetHeight: number;
};

const isAtlasSprite = (
  sprite: ResourceSpriteRef | null | undefined,
): sprite is AtlasSprite =>
  Boolean(
    sprite?.sheetUrl &&
      typeof sprite.x === "number" &&
      typeof sprite.y === "number" &&
      typeof sprite.width === "number" &&
      typeof sprite.height === "number" &&
      typeof sprite.sheetWidth === "number" &&
      typeof sprite.sheetHeight === "number",
  );

const ResourceIconView: React.FC<ResourceIconViewProps> = ({
  icon,
  alt,
  className,
  sx,
}) => {
  const normalized = normalizeResourceIcon(icon);
  const atlasCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const atlasHostRef = React.useRef<HTMLDivElement | null>(null);
  const sxObject =
    sx && typeof sx === "object" && !Array.isArray(sx)
      ? (sx as Record<string, unknown>)
      : {};
  if (!normalized) {
    return null;
  }

  const atlasSprite = isAtlasSprite(normalized.sprite) ? normalized.sprite : null;
  const atlasDisplayScale =
    atlasSprite && atlasSprite.pixelRatio && atlasSprite.pixelRatio > 0
      ? atlasSprite.pixelRatio
      : 1;
  const atlasWidth =
    typeof sxObject.width === "number" || typeof sxObject.width === "string"
      ? sxObject.width
      : atlasSprite
        ? atlasSprite.width / atlasDisplayScale
        : undefined;
  const atlasHeight =
    typeof sxObject.height === "number" || typeof sxObject.height === "string"
      ? sxObject.height
      : atlasSprite
        ? atlasSprite.height / atlasDisplayScale
        : undefined;

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
      const inset = Math.max(2, Math.round(Math.min(width, height) * 0.12));
      const drawWidth = Math.max(1, width - inset * 2);
      const drawHeight = Math.max(1, height - inset * 2);
      currentCanvas.width = width;
      currentCanvas.height = height;
      currentCanvas.style.width = `${width}px`;
      currentCanvas.style.height = `${height}px`;

      const context = currentCanvas.getContext("2d");
      if (!context) {
        return;
      }

      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, width, height);
      context.imageSmoothingEnabled = true;
      context.drawImage(
        image,
        atlasSprite.x,
        atlasSprite.y,
        atlasSprite.width,
        atlasSprite.height,
        inset,
        inset,
        drawWidth,
        drawHeight,
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
        style={{ width: atlasWidth, height: atlasHeight }}
        sx={{
          ...((sx as object) || {}),
          width: atlasWidth,
          height: atlasHeight,
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
        style={{
          width: typeof sxObject.width === "number" || typeof sxObject.width === "string" ? sxObject.width : undefined,
          height:
            typeof sxObject.height === "number" || typeof sxObject.height === "string"
              ? sxObject.height
              : undefined,
        }}
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
      style={{
        width: typeof sxObject.width === "number" || typeof sxObject.width === "string" ? sxObject.width : undefined,
        height:
          typeof sxObject.height === "number" || typeof sxObject.height === "string"
            ? sxObject.height
            : undefined,
      }}
      sx={{
        ...((sx as object) || {}),
        flexShrink: 0,
      }}
    />
  );
};

export default ResourceIconView;
