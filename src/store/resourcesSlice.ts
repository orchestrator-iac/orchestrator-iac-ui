import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiService from "../services/apiService";

export const fetchResources = createAsyncThunk(
  "resources/fetchResources",
  async (_: void, { signal }) => {
    const response = await apiService.get(
      "/configs?fields=_id,cloudProvider,resourceName,resourceVersion,resourceDescription,publishedBy,publishedAt,resourceIcon,resourceId",
      { signal },
    );
    return response ?? [];
  },
);

type Status = "idle" | "loading" | "succeeded" | "failed";

interface ResourcesState {
  data: any[];
  status: Status;
}

const initialState: ResourcesState = {
  data: [],
  status: "idle",
};

const resourcesSlice = createSlice({
  name: "resources",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchResources.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchResources.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchResources.rejected, (state, action) => {
        // Ignore cancellations from AbortController (e.g. StrictMode's
        // mount/cleanup/remount, or component unmount) — only a real
        // failure should flip status to "failed".
        if (action.meta.aborted) return;
        state.status = "failed";
      });
  },
});

export default resourcesSlice.reducer;
