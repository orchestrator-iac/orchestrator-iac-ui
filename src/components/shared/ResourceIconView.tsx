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

/** Returns `value` when it is a usable CSS dimension, otherwise `undefined`. */
const asCssDimension = (value: unknown): number | string | undefined =>
  typeof value === "number" || typeof value === "string" ? value : undefined;

/** The atlas sprite's pixel ratio, defaulting to 1 when unset or invalid. */
const getAtlasScale = (sprite: AtlasSprite | null): number => {
  if (sprite?.pixelRatio && sprite.pixelRatio > 0) {
    return sprite.pixelRatio;
  }
  return 1;
};

/** Prefers an explicit `sx` dimension, falling back to the sprite's own size. */
const getAtlasDimension = (
  sxValue: number | string | undefined,
  spriteSize: number | undefined,
  scale: number,
): number | string | undefined => {
  if (sxValue !== undefined) {
    return sxValue;
  }
  return spriteSize === undefined ? undefined : spriteSize / scale;
};

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

  const sxWidth = asCssDimension(sxObject.width);
  const sxHeight = asCssDimension(sxObject.height);
  const atlasSprite = isAtlasSprite(normalized.sprite) ? normalized.sprite : null;
  const atlasDisplayScale = getAtlasScale(atlasSprite);
  const atlasWidth = getAtlasDimension(sxWidth, atlasSprite?.width, atlasDisplayScale);
  const atlasHeight = getAtlasDimension(sxHeight, atlasSprite?.height, atlasDisplayScale);

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
          ...(sx as object),
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
          tabIndex={-1}
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
        style={{ width: sxWidth, height: sxHeight }}
        sx={{
          ...(sx as object),
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
      style={{ width: sxWidth, height: sxHeight }}
      sx={{
        ...(sx as object),
        flexShrink: 0,
      }}
    />
  );
};

export default ResourceIconView;
