export interface ResourceBatchLookup {
  id: string;
  cloudProvider?: string;
  configId?: string;
}

export interface ResourceBatchItem extends ResourceBatchLookup {
  data: Record<string, any>;
}

export const getResourceLookupKey = (lookup: ResourceBatchLookup): string =>
  lookup.configId?.trim()
    ? `config:${lookup.configId.trim()}`
    : `resource:${lookup.id.trim()}|${lookup.cloudProvider?.trim().toLowerCase() ?? ""}`;

export const primaryResourceLookups = (
  candidates: ResourceBatchLookup[][],
): ResourceBatchLookup[] =>
  Array.from(
    new Map(
      candidates
        .filter((list) => list.length)
        .map(([first]) => [getResourceLookupKey(first), first]),
    ).values(),
  );

/** Match IDs first. A missing ID may resolve to a replacement via the API's
 * legacy fallback, but ambiguous versions must use an explicit fallback read. */
export const indexResourceBatch = (
  lookups: ResourceBatchLookup[],
  items: ResourceBatchItem[],
): Map<string, ResourceBatchItem> => {
  const result = new Map<string, ResourceBatchItem>();
  const byConfigId = new Map(
    items.filter((item) => item.configId).map((item) => [item.configId, item]),
  );
  const byResource = new Map<string, ResourceBatchItem[]>();
  for (const item of items) {
    const keys = new Set([
      getResourceLookupKey({ id: item.id, cloudProvider: item.cloudProvider }),
      getResourceLookupKey({ id: item.id }),
    ]);
    for (const key of keys)
      byResource.set(key, [...(byResource.get(key) ?? []), item]);
  }
  for (const lookup of lookups) {
    const exact = lookup.configId
      ? byConfigId.get(lookup.configId.trim())
      : undefined;
    const matches = exact
      ? [exact]
      : (byResource.get(
          getResourceLookupKey({ ...lookup, configId: undefined }),
        ) ?? []);
    if (matches.length === 1)
      result.set(getResourceLookupKey(lookup), matches[0]);
  }
  return result;
};
