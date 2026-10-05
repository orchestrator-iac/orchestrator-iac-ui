import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiService from "../services/apiService";
import {
  getResourceLookupKey,
  type ResourceBatchLookup,
  type ResourceBatchItem,
} from "../services/resourceLookup";
export type {
  ResourceBatchLookup,
  ResourceBatchItem,
} from "../services/resourceLookup";

export type ResourceLookup =
  | string
  | {
      id: string;
      cloudProvider?: string;
      configId?: string;
    };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object";

const parseBatchResponse = (response: unknown): unknown[] => {
  let payload = response;

  if (typeof payload === "string") {
    try {
      payload = JSON.parse(payload) as unknown;
    } catch {
      throw new Error("Resource batch response was not valid JSON");
    }
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  if (isRecord(payload) && Array.isArray(payload.configs)) {
    return payload.configs;
  }

  throw new Error("Resource batch response had an unexpected shape");
};

export const fetchResourceById = createAsyncThunk(
  "resource/fetchById",
  async (lookup: ResourceLookup, thunkApi) => {
    const id = typeof lookup === "string" ? lookup : lookup.id;
    const cloudProvider =
      typeof lookup === "string" ? undefined : lookup.cloudProvider;
    const requestedConfigId =
      typeof lookup === "string" ? undefined : lookup.configId;

    // Keep the exact config version when its document ID is known. Legacy
    // resource types such as "vpc" must use the resource_id list filter.
    const response = await apiService.get(
      requestedConfigId
        ? `/configs/${encodeURIComponent(requestedConfigId)}`
        : "/configs",
      {
        signal: thunkApi.signal,
        params: requestedConfigId
          ? undefined
          : {
              resource_id: id,
              ...(cloudProvider
                ? { cloud_provider: cloudProvider.toLowerCase() }
                : {}),
            },
      },
    );
    const data = Array.isArray(response) ? response[0] : response;
    if (!data || typeof data !== "object") {
      throw new Error(`Resource catalog entry not found for ${id}`);
    }
    const configId = String(
      (data as Record<string, unknown>).configId ??
        (data as Record<string, unknown>).id ??
        (data as Record<string, unknown>)._id ??
        "",
    ).trim();
    return { id, cloudProvider, configId: configId || undefined, data };
  },
);

/** Fetch several provider-aware resource catalog entries in one request. */
export const fetchResourcesByLookups = createAsyncThunk(
  "resource/fetchBatch",
  async (lookups: ResourceBatchLookup[], thunkApi) => {
    const normalizedLookups = Array.from(
      new Map(
        lookups
          .map(({ id, cloudProvider, configId }) => ({
            id: String(id).trim(),
            cloudProvider: cloudProvider?.trim().toLowerCase(),
            configId: configId ? String(configId).trim() : undefined,
          }))
          .filter(({ id }) => Boolean(id))
          .map((lookup) => [getResourceLookupKey(lookup), lookup]),
      ).values(),
    );

    if (!normalizedLookups.length) {
      return { items: [] as ResourceBatchItem[] };
    }

    let response: unknown;
    try {
      response = await apiService.post(
        "/configs/batch",
        {
          lookups: normalizedLookups.map(({ id, cloudProvider, configId }) => ({
            resourceId: id,
            ...(cloudProvider ? { cloudProvider } : {}),
            ...(configId ? { configId } : {}),
          })),
        },
        { signal: thunkApi.signal },
      );
      console.debug("Resource config batch resolved", {
        lookupCount: normalizedLookups.length,
      });
    } catch (error) {
      console.error("Resource config batch failed", {
        lookupCount: normalizedLookups.length,
        error,
      });
      throw error;
    }
    const configs = parseBatchResponse(response);

    return {
      items: configs
        .filter(
          (data): data is Record<string, any> =>
            isRecord(data) && Boolean(data.resourceId ?? data.resource_id),
        )
        .map((data: any) => {
          const id = String(data.resourceId ?? data.resource_id).trim();
          const configId = String(
            data.configId ?? data.id ?? data._id ?? "",
          ).trim();
          const responseProvider = String(
            data.cloudProvider ?? data.cloud_provider ?? "",
          )
            .trim()
            .toLowerCase();
          const matchingLookup =
            normalizedLookups.find(
              (lookup) => configId && lookup.configId === configId,
            ) ??
            normalizedLookups.find(
              (lookup) =>
                lookup.id === id &&
                (!responseProvider ||
                  lookup.cloudProvider === responseProvider),
            );

          return {
            id,
            configId: configId || undefined,
            // Keep the request's provider when an older catalog document omits
            // it. Without this fallback the batch is successful, but the UI
            // cannot match the response back to a provider-aware lookup.
            cloudProvider: responseProvider || matchingLookup?.cloudProvider,
            data,
          };
        }),
    };
  },
);

/** Fetch a resource configuration by its internal document ID. */
export const fetchResourceByDocumentId = createAsyncThunk(
  "resource/fetchByDocumentId",
  async (id: string) => {
    const data = await apiService.get(`/configs/${encodeURIComponent(id)}`);
    return { id, data };
  },
);

interface ResourceState {
  resources: Record<string, any>;
  loading: boolean;
  error: string | null;
}

const initialState: ResourceState = {
  resources: {},
  loading: false,
  error: null,
};

const resourceSlice = createSlice({
  name: "resource",
  initialState,
  reducers: {
    clearResource(state, action) {
      if (action.payload) {
        delete state.resources[action.payload];
      } else {
        state.resources = {};
      }
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchResourceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResourceById.fulfilled, (state, action) => {
        state.loading = false;
        state.resources[getResourceLookupKey(action.payload)] =
          action.payload.data;
      })
      .addCase(fetchResourcesByLookups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResourcesByLookups.fulfilled, (state, action) => {
        state.loading = false;
        for (const item of action.payload.items) {
          state.resources[getResourceLookupKey(item)] = item.data;
        }
      })
      .addCase(fetchResourcesByLookups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch resources";
      })
      .addCase(fetchResourceByDocumentId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResourceByDocumentId.fulfilled, (state, action) => {
        state.loading = false;
        state.resources[action.payload.id] = action.payload.data;
      })
      .addCase(fetchResourceByDocumentId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch resource";
      })
      .addCase(fetchResourceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch resource";
      });
  },
});

export const { clearResource } = resourceSlice.actions;
export default resourceSlice.reducer;
