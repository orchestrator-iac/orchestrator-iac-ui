import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orchestratorService } from '../services/orchestratorService';
import { OrchestratorListItem } from '../types/orchestrator';

export const fetchOrchestrators = createAsyncThunk(
  'orchestrators/fetchOrchestrators',
  async ({ page = 1, size = 50 }: { page?: number; size?: number } = {}) => {
    const response = await orchestratorService.listOrchestrators(page, size);
    return response.orchestrations ?? [];
  }
);

export const deleteOrchestrator = createAsyncThunk(
  'orchestrators/deleteOrchestrator',
  async (id: string) => {
    await orchestratorService.deleteOrchestrator(id);
    return id;
  }
);

export const duplicateOrchestrator = createAsyncThunk(
  'orchestrators/duplicateOrchestrator',
  async ({ id, newName }: { id: string; newName: string }) => {
    const response = await orchestratorService.duplicateOrchestrator(id, newName);
    return response;
  }
);

type Status = 'idle' | 'loading' | 'succeeded' | 'failed';

interface OrchestratorsState {
  data: OrchestratorListItem[];
  status: Status;
  error: string | null;
}

const initialState: OrchestratorsState = {
  data: [],
  status: 'idle',
  error: null,
};

const orchestratorsSlice = createSlice({
  name: 'orchestrators',
  initialState,
  reducers: {
    clearOrchestrators: (state) => {
      state.data = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch orchestrators
      .addCase(fetchOrchestrators.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchOrchestrators.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchOrchestrators.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch orchestrators';
      })
      // Delete orchestrator
      .addCase(deleteOrchestrator.fulfilled, (state, action) => {
        state.data = state.data.filter(item => item._id !== action.payload);
      })
      // Duplicate orchestrator
      .addCase(duplicateOrchestrator.fulfilled, (state, action) => {
        state.data.unshift({
          _id: action.payload._id,
          name: action.payload.name,
          description: action.payload.description,
          templateInfo: action.payload.templateInfo,
          nodes: action.payload.nodes || [],
          edges: action.payload.edges || [],
          nodeCount: action.payload.nodes?.length || 0,
          edgeCount: action.payload.edges?.length || 0,
          createdAt:
            action.payload.metadata?.createdAt ??
            action.payload.createdAt ??
            new Date().toISOString(),
          updatedAt:
            action.payload.metadata?.updatedAt ??
            action.payload.updatedAt ??
            new Date().toISOString(),
        });
      });
  },
});

export const { clearOrchestrators } = orchestratorsSlice.actions;
export default orchestratorsSlice.reducer;
