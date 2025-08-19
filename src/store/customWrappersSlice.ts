import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../services/apiService';

export const fetchCustomWrappers = createAsyncThunk(
  'customWrappers/fetchCustomWrappers',
  async () => {
    const response = await apiService.get('/wrapper/custom');
    return response?.data ?? [];
  }
);

type Status = 'idle' | 'loading' | 'succeeded' | 'failed';

interface CustomWrappersState {
  data: any[];
  status: Status;
}

const initialState: CustomWrappersState = {
  data: [],
  status: 'idle',
};

const customWrappersSlice = createSlice({
  name: 'customWrappers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomWrappers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCustomWrappers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchCustomWrappers.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export default customWrappersSlice.reducer;
