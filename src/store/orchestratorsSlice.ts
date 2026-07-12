import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { orchestratorService } from "../services/orchestratorService";
import { OrchestratorListItem } from "../types/orchestrator";

export const fetchOrchestrators = createAsyncThunk(
  "orchestrators/fetchOrchestrators",
  async ({ page = 1, size = 50 }: { page?: number; size?: number } = {}) => {
    const response = await orchestratorService.listOrchestrators(page, size);
    return response.orchestrations ?? [];
  },
);

const mapOrchestratorToListItem = (item: any): OrchestratorListItem => ({
  _id: item._id,
  templateInfo: item.templateInfo,
  templateId: item.templateId || undefined,
  nodes: item.nodes || [],
  edges: item.edges || [],
  nodeCount: item.nodeCount ?? item.nodes?.length ?? 0,
  edgeCount: item.edgeCount ?? item.edges?.length ?? 0,
  previewImageUrl: item.previewImageUrl,
  createdAt: item.metadata?.createdAt ?? item.createdAt ?? new Date().toISOString(),
  updatedAt: item.metadata?.updatedAt ?? item.updatedAt ?? new Date().toISOString(),
  metadata: item.metadata,
});

export const fetchOrchestratorById = createAsyncThunk(
  "orchestrators/fetchOrchestratorById",
  async (id: string) => {
    const response = await orchestratorService.getOrchestrator(id);
    return mapOrchestratorToListItem(response);
  },
);

export const deleteOrchestrator = createAsyncThunk(
  "orchestrators/deleteOrchestrator",
  async (id: string) => {
    await orchestratorService.deleteOrchestrator(id);
    return id;
  },
);

export const duplicateOrchestrator = createAsyncThunk(
  "orchestrators/duplicateOrchestrator",
  async ({ id, newName }: { id: string; newName: string }) => {
    const response = await orchestratorService.duplicateOrchestrator(
      id,
      newName,
    );
    return response;
  },
);

type Status = "idle" | "loading" | "succeeded" | "failed";

interface OrchestratorsState {
  data: OrchestratorListItem[];
  status: Status;
  error: string | null;
}

const initialState: OrchestratorsState = {
  data: [],
  status: "idle",
  error: null,
};

const orchestratorsSlice = createSlice({
  name: "orchestrators",
  initialState,
  reducers: {
    clearOrchestrators: (state) => {
      state.data = [];
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch orchestrators
      .addCase(fetchOrchestrators.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchOrchestrators.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchOrchestrators.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch orchestrators";
      })
      .addCase(fetchOrchestratorById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
        const index = state.data.findIndex((item) => item._id === action.payload._id);
        if (index >= 0) {
          state.data[index] = action.payload;
          return;
        }
        state.data.unshift(action.payload);
      })
      // Delete orchestrator
      .addCase(deleteOrchestrator.fulfilled, (state, action) => {
        state.data = state.data.filter((item) => item._id !== action.payload);
      })
      // Duplicate orchestrator
      .addCase(duplicateOrchestrator.fulfilled, (state, action) => {
        state.data.unshift(mapOrchestratorToListItem(action.payload));
      });
  },
});

export const { clearOrchestrators } = orchestratorsSlice.actions;
export default orchestratorsSlice.reducer;
