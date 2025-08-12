import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../services/apiService';

export const fetchResourceById = createAsyncThunk(
  'resource/fetchById',
  async (id: string) => {
    const response = await apiService.get(`/configs/${id}`);
    return response;
  }
);

interface ResourceState {
  resource: any;
  loading: boolean;
  error: string | null;
}

const initialState: ResourceState = {
  resource: null,
  loading: false,
  error: null,
};

const resourceSlice = createSlice({
  name: 'resource',
  initialState,
  reducers: {
    clearResource(state) {
      state.resource = null;
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
        state.resource = action.payload;
      })
      .addCase(fetchResourceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch resource';
      });
  },
});

export const { clearResource } = resourceSlice.actions;
export default resourceSlice.reducer;
