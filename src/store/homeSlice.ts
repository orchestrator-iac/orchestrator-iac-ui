import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../services/apiService';

export const fetchCustomWrappers = createAsyncThunk(
  'home/fetchCustomWrappers',
  async () => {
    const response = await apiService.get('/wrapper/custom');
    return response?.data ?? [];
  }
);

export const fetchAllWrappers = createAsyncThunk(
  'home/fetchAllWrappers',
  async () => {
    const response = await apiService.get('/wrapper/all');
    return response?.data ?? [];
  }
);

export const fetchResources = createAsyncThunk(
  'home/fetchResources',
  async () => {
    const response = await apiService.get(
      '/configs?fields=_id,cloudProvider,resourceName,resourceVersion,resourceDescription,publishedBy,publishedAt,resourceIcon,resourceId'
    );
    return response ?? [];
  }
);

type Status = 'idle' | 'loading' | 'succeeded' | 'failed';

interface HomeState {
  customWrappers: any[];
  allWrappers: any[];
  resources: any[];
  customWrappersStatus: Status;
  allWrappersStatus: Status;
  resourcesStatus: Status;
}

const initialState: HomeState = {
  customWrappers: [],
  allWrappers: [],
  resources: [],
  customWrappersStatus: 'idle',
  allWrappersStatus: 'idle',
  resourcesStatus: 'idle',
};

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ---- Custom Wrappers ----
      .addCase(fetchCustomWrappers.pending, (state) => {
        state.customWrappersStatus = 'loading';
      })
      .addCase(fetchCustomWrappers.fulfilled, (state, action) => {
        state.customWrappersStatus = 'succeeded';
        state.customWrappers = action.payload;
      })
      .addCase(fetchCustomWrappers.rejected, (state) => {
        state.customWrappersStatus = 'failed';
      })

      // ---- All Wrappers ----
      .addCase(fetchAllWrappers.pending, (state) => {
        state.allWrappersStatus = 'loading';
      })
      .addCase(fetchAllWrappers.fulfilled, (state, action) => {
        state.allWrappersStatus = 'succeeded';
        state.allWrappers = action.payload;
      })
      .addCase(fetchAllWrappers.rejected, (state) => {
        state.allWrappersStatus = 'failed';
      })

      // ---- Resources ----
      .addCase(fetchResources.pending, (state) => {
        state.resourcesStatus = 'loading';
      })
      .addCase(fetchResources.fulfilled, (state, action) => {
        state.resourcesStatus = 'succeeded';
        state.resources = action.payload;
      })
      .addCase(fetchResources.rejected, (state) => {
        state.resourcesStatus = 'failed';
      });
  },
});

export default homeSlice.reducer;
