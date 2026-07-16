import apiService from "./apiService";
import {
  buildResourceIconValue,
  getCatalogIconVariants,
  normalizeResourceIcon,
  type CatalogIconRecord,
  type ResourceIconValue,
} from "@/types/resourceIcon";

export interface ResourceIconLookupTarget {
  _id: string;
  cloudProvider?: string;
  resourceId?: string;
  resourceName?: string;
  resourceIcon?: ResourceIconValue;
}

const KNOWN_INCORRECT_ICON_URLS = [
  "/icons/aws/customer_enablement/activate.svg",
  "/icons/aws/customer_enablement/aws_activate.svg",
];

const iconResolutionCache = new Map<string, Promise<ResourceIconValue | null>>();

const normalizeToken = (value: string): string =>
  value
    .toLowerCase()
    .replace(/^(aws|azure|gcp|google)[_-]/, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const buildIconQueries = (target: ResourceIconLookupTarget): string[] => {
  const rawResourceId = target.resourceId?.trim() ?? "";
  const normalizedResourceId = rawResourceId
    .replace(/^(aws|azure|gcp|google)[_-]/i, "")
    .replace(/[_-]+/g, " ")
    .trim();
  const resourceName = target.resourceName?.trim() ?? "";

  return [rawResourceId, normalizedResourceId, resourceName].filter(
    (value, index, values): value is string =>
      Boolean(value) && values.indexOf(value) === index,
  );
};

const isPreferredIconVariant = (icon: CatalogIconRecord): boolean =>
  getCatalogIconVariants(icon).some(
    (variant) => variant.iconKind === "resource" || variant.iconKind === "service",
  );

const scoreCatalogIcon = (
  icon: CatalogIconRecord,
  normalizedQuery: string,
): number => {
  const candidates = [
    icon.name,
    icon.description,
    ...(icon.tags ?? []),
    ...(icon.aliases ?? []),
    icon.type,
  ]
    .filter((value): value is string => typeof value === "string" && value.trim())
    .map(normalizeToken);

  if (candidates.some((value) => value === normalizedQuery)) {
    return 4;
  }

  if (candidates.some((value) => value.includes(normalizedQuery))) {
    return 3;
  }

  if (normalizedQuery.includes(" ") && candidates.some((value) => normalizedQuery.includes(value))) {
    return 2;
  }

  return 1;
};

const pickBestCatalogIcon = (
  icons: CatalogIconRecord[],
  query: string,
): CatalogIconRecord | null => {
  if (icons.length === 0) {
    return null;
  }

  const normalizedQuery = normalizeToken(query);
  const ranked = [...icons].sort((left, right) => {
    const scoreDiff =
      scoreCatalogIcon(right, normalizedQuery) -
      scoreCatalogIcon(left, normalizedQuery);
    if (scoreDiff !== 0) {
      return scoreDiff;
    }

    if (isPreferredIconVariant(left) !== isPreferredIconVariant(right)) {
      return isPreferredIconVariant(right) ? 1 : -1;
    }

    return 0;
  });

  return ranked[0] ?? null;
};

const buildSearchEndpoint = (query: string, cloudProvider?: string): string => {
  const params = new URLSearchParams({
    query,
    exact_search: "false",
    page: "1",
    page_size: "8",
  });

  if (cloudProvider) {
    params.set("cloud_type", cloudProvider);
  }

  return `/icons/search?${params.toString()}`;
};

export const shouldResolveResourceIcon = (
  icon: ResourceIconValue | undefined,
): boolean => {
  const normalized = normalizeResourceIcon(icon);
  if (!normalized) {
    return false;
  }

  const iconUrl = normalized.url?.toLowerCase() ?? "";
  const spriteKey = normalized.sprite?.key?.toLowerCase() ?? "";
  const spriteSymbolId = normalized.sprite?.symbolId?.toLowerCase() ?? "";
  const spriteName = normalized.search?.name?.toLowerCase() ?? "";

  return (
    KNOWN_INCORRECT_ICON_URLS.some((segment) => iconUrl.includes(segment)) ||
    spriteKey.includes("activate-customer-enablement") ||
    spriteSymbolId.includes("activate-customer-enablement") ||
    spriteName === "activate"
  );
};

export const resolveResourceIcon = async (
  target: ResourceIconLookupTarget,
): Promise<ResourceIconValue | null> => {
  const cacheKey = [
    target.cloudProvider ?? "",
    target.resourceId ?? "",
    target.resourceName ?? "",
  ].join("|");

  const cached = iconResolutionCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const promise = (async () => {
    const queries = buildIconQueries(target);
    for (const query of queries) {
      const response = await apiService.get(buildSearchEndpoint(query, target.cloudProvider));
      const icons = Array.isArray(response?.value)
        ? (response.value as CatalogIconRecord[])
        : Array.isArray(response)
          ? (response as CatalogIconRecord[])
          : [];
      const match = pickBestCatalogIcon(icons, query);
      if (!match) {
        continue;
      }

      const preferredVariant =
        getCatalogIconVariants(match).find(
          (variant) =>
            variant.iconKind === "resource" || variant.iconKind === "service",
        ) ?? getCatalogIconVariants(match)[0];

      if (preferredVariant) {
        return buildResourceIconValue(match, preferredVariant, {
          includeSprite: true,
        });
      }
    }

    return null;
  })().catch(() => null);

  iconResolutionCache.set(cacheKey, promise);
  return promise;
};
