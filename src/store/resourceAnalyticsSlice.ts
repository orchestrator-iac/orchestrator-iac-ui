import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiService from "../services/apiService";

export const fetchTopResources = createAsyncThunk(
  "resourceAnalytics/fetchTopResources",
  async (_: void, { signal }) => {
    try {
      const response = await apiService.get(
        "/orchestrators/analytics/top-resources?size=200",
        { signal },
      );
      return response ?? [];
    } catch {
      // Best-effort enhancement: never let a failed/unauthorized analytics
      // call block the primary resources gallery from rendering.
      return [];
    }
  },
);

type Status = "idle" | "loading" | "succeeded" | "failed";

interface ResourceAnalyticsState {
  items: Array<{ resourceId: string; count: number }>;
  byId: Record<string, number>;
  status: Status;
}

const initialState: ResourceAnalyticsState = {
  items: [],
  byId: {},
  status: "idle",
};

const resourceAnalyticsSlice = createSlice({
  name: "resourceAnalytics",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTopResources.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTopResources.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
        state.byId = action.payload.reduce(
          (acc: Record<string, number>, item: { resourceId: string; count: number }) => {
            acc[item.resourceId] = item.count;
            return acc;
          },
          {},
        );
      })
      .addCase(fetchTopResources.rejected, (state, action) => {
        if (action.meta.aborted) return;
        state.status = "failed";
      });
  },
});

export default resourceAnalyticsSlice.reducer;
