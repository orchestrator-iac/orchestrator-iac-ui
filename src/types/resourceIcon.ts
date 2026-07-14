export interface ResourceSpriteRef {
  sheetUrl: string;
  key?: string;
  symbolId: string;
  x?: number;
  y?: number;
  viewBox?: string;
  width?: number;
  height?: number;
  sheetWidth?: number;
  sheetHeight?: number;
  pixelRatio?: number;
  kind?: string;
}

export interface ResourceIconSearchMetadata {
  name?: string;
  description?: string;
  tags?: string[];
  aliases?: string[];
}

export interface ResourceIconValue {
  id?: string;
  url?: string;
  sprite?: ResourceSpriteRef | null;
  search?: ResourceIconSearchMetadata | null;
}

export interface CatalogIconVariant {
  url?: string;
  iconKind?: string;
  sprite?: ResourceSpriteRef | null;
  search?: ResourceIconSearchMetadata | null;
}

export interface CatalogIconRecord {
  _id?: string;
  id?: string;
  name?: string;
  description?: string;
  type?: string;
  tags?: string[];
  aliases?: string[];
  url?: string | CatalogIconVariant[];
  iconKind?: string;
}

const normalizeSpriteRef = (
  candidate: unknown,
): ResourceSpriteRef | undefined => {
  if (!candidate || typeof candidate !== "object") {
    return undefined;
  }

  const sprite = candidate as Record<string, unknown>;
  if (
    typeof sprite.sheetUrl !== "string" ||
    !sprite.sheetUrl.trim() ||
    typeof sprite.symbolId !== "string" ||
    !sprite.symbolId.trim()
  ) {
    return undefined;
  }

  return {
    sheetUrl: sprite.sheetUrl,
    key: typeof sprite.key === "string" ? sprite.key : undefined,
    symbolId: typeof sprite.symbolId === "string" ? sprite.symbolId : "",
    x: typeof sprite.x === "number" ? sprite.x : undefined,
    y: typeof sprite.y === "number" ? sprite.y : undefined,
    viewBox: typeof sprite.viewBox === "string" ? sprite.viewBox : undefined,
    width: typeof sprite.width === "number" ? sprite.width : undefined,
    height: typeof sprite.height === "number" ? sprite.height : undefined,
    sheetWidth:
      typeof sprite.sheetWidth === "number" ? sprite.sheetWidth : undefined,
    sheetHeight:
      typeof sprite.sheetHeight === "number" ? sprite.sheetHeight : undefined,
    pixelRatio:
      typeof sprite.pixelRatio === "number" ? sprite.pixelRatio : undefined,
    kind: typeof sprite.kind === "string" ? sprite.kind : undefined,
  };
};

const normalizeSearchMetadata = (
  candidate: unknown,
): ResourceIconSearchMetadata | undefined => {
  if (!candidate || typeof candidate !== "object") {
    return undefined;
  }

  const search = candidate as Record<string, unknown>;
  return {
    name: typeof search.name === "string" ? search.name : undefined,
    description:
      typeof search.description === "string" ? search.description : undefined,
    tags: Array.isArray(search.tags)
      ? search.tags.filter((tag): tag is string => typeof tag === "string")
      : undefined,
    aliases: Array.isArray(search.aliases)
      ? search.aliases.filter(
          (alias): alias is string => typeof alias === "string",
        )
      : undefined,
  };
};

export const normalizeResourceIcon = (
  icon: unknown,
): ResourceIconValue | undefined => {
  if (!icon) {
    return undefined;
  }

  if (typeof icon === "string") {
    return { url: icon };
  }

  if (typeof icon !== "object") {
    return undefined;
  }

  const candidate = icon as Record<string, unknown>;
  const normalized: ResourceIconValue = {};

  if (typeof candidate.id === "string" && candidate.id.trim()) {
    normalized.id = candidate.id;
  }

  if (typeof candidate.url === "string" && candidate.url.trim()) {
    normalized.url = candidate.url;
  }

  normalized.sprite = normalizeSpriteRef(candidate.sprite);
  normalized.search = normalizeSearchMetadata(candidate.search);

  if (Array.isArray(candidate.url)) {
    const preferredVariant = candidate.url.find((entry) => {
      if (!entry || typeof entry !== "object") {
        return false;
      }
      const variant = entry as Record<string, unknown>;
      return Boolean(
        normalizeSpriteRef(variant.sprite) ||
          (typeof variant.url === "string" && variant.url.trim()),
      );
    }) as Record<string, unknown> | undefined;

    if (preferredVariant) {
      if (!normalized.url && typeof preferredVariant.url === "string") {
        normalized.url = preferredVariant.url;
      }
      if (!normalized.sprite) {
        normalized.sprite = normalizeSpriteRef(preferredVariant.sprite);
      }
      if (!normalized.search) {
        normalized.search = normalizeSearchMetadata(preferredVariant.search);
      }
    }
  }

  if (!normalized.id && !normalized.url && !normalized.sprite) {
    return undefined;
  }

  return normalized;
};

export const hasRenderableResourceIcon = (icon: unknown): boolean =>
  Boolean(normalizeResourceIcon(icon));

export const getCatalogIconVariants = (
  icon: CatalogIconRecord,
): CatalogIconVariant[] => {
  const fallbackSearch: ResourceIconSearchMetadata = {
    name: icon.name,
    description: icon.description,
    tags: Array.isArray(icon.tags) ? icon.tags : undefined,
    aliases: Array.isArray(icon.aliases) ? icon.aliases : undefined,
  };

  if (Array.isArray(icon.url)) {
    return icon.url.map((variant) => ({
      ...variant,
      search: variant.search ?? fallbackSearch,
    }));
  }

  if (typeof icon.url === "string") {
    return [
      {
        url: icon.url,
        iconKind: icon.iconKind ?? "unknown",
        search: fallbackSearch,
      },
    ];
  }

  return [];
};

export const buildResourceIconValue = (
  icon: CatalogIconRecord,
  variant: CatalogIconVariant,
  options?: {
    includeSprite?: boolean;
  },
): ResourceIconValue => ({
  id: String(icon._id ?? icon.id ?? ""),
  url: variant.url,
  sprite: options?.includeSprite === false ? null : variant.sprite ?? null,
  search: variant.search ?? {
    name: icon.name,
    description: icon.description,
    tags: icon.tags,
    aliases: icon.aliases,
  },
});
