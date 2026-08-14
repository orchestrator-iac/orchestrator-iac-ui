import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiService from "../services/apiService";

export const fetchResourceById = createAsyncThunk(
  "resource/fetchById",
  async (id: string) => {
    // `id` here is a resourceId (e.g. "vpc"), not the config document's
    // internal database id, so this must go through the `resource_id`
    // filter on the list endpoint rather than the by-id path lookup
    // (GET /configs/{id} looks up the internal id and 404s for a
    // resourceId like "vpc").
    const response = await apiService.get("/configs", {
      params: { resource_id: id },
    });
    const data = Array.isArray(response) ? response[0] : response;
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
        state.resources[action.payload.id] = action.payload.data;
      })
      .addCase(fetchResourceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch resource";
      });
  },
});

export const { clearResource } = resourceSlice.actions;
export default resourceSlice.reducer;
