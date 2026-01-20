import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiService from "../services/apiService";

export const fetchResourceById = createAsyncThunk(
  "resource/fetchById",
  async (id: string, { getState }) => {
    const state: any = getState();

    if (state.resource.resources[id]) {
      return { id, data: state.resource.resources[id], cached: true };
    }

    const response = await apiService.get(`/configs/${id}`);
    return { id, data: response, cached: false };
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

        // Only overwrite if it's from API (not cached)
        if (!action.payload.cached) {
          state.resources[action.payload.id] = action.payload.data;
        }
      })
      .addCase(fetchResourceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch resource";
      });
  },
});

export const { clearResource } = resourceSlice.actions;
export default resourceSlice.reducer;
