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

interface HomeState {
  customWrappers: any[];
  allWrappers: any[];
  resources: any[];
}

const initialState: HomeState = {
  customWrappers: [],
  allWrappers: [],
  resources: [],
};

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomWrappers.fulfilled, (state, action) => {
        state.customWrappers = action.payload;
      })
      .addCase(fetchAllWrappers.fulfilled, (state, action) => {
        state.allWrappers = action.payload;
      })
      .addCase(fetchResources.fulfilled, (state, action) => {
        state.resources = action.payload;
      });
  },
});

export default homeSlice.reducer;
