import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../services/apiService';

export const fetchWrappersTemplate = createAsyncThunk(
  'wrappersTemplate/fetchWrappersTemplate',
  async () => {
    const response = await apiService.get('/wrapper/all');
    return response?.data ?? [];
  }
);

type Status = 'idle' | 'loading' | 'succeeded' | 'failed';

interface WrappersTemplateState {
  data: any[];
  status: Status;
}

const initialState: WrappersTemplateState = {
  data: [],
  status: 'idle',
};

const wrappersTemplateSlice = createSlice({
  name: 'wrappersTemplate',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWrappersTemplate.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchWrappersTemplate.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchWrappersTemplate.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export default wrappersTemplateSlice.reducer;
