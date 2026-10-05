import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { orchestratorService } from "../services/orchestratorService";
import {
  OrchestratorListItem,
  SaveOrchestratorResponse,
} from "../types/orchestrator";

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
  nodeCount: Number(item.nodeCount ?? 0),
  edgeCount: Number(item.edgeCount ?? 0),
  previewImageUrl: item.previewImageUrl,
  createdAt: item.metadata?.createdAt ?? item.createdAt ?? new Date().toISOString(),
  updatedAt: item.metadata?.updatedAt ?? item.updatedAt ?? new Date().toISOString(),
  metadata: item.metadata,
  policyScan: item.policyScan,
});

export const fetchOrchestratorById = createAsyncThunk<
  SaveOrchestratorResponse,
  string
>(
  "orchestrators/fetchOrchestratorById",
  async (id: string) => {
    return orchestratorService.getOrchestrator(id);
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
        const summary = mapOrchestratorToListItem(action.payload);
        const index = state.data.findIndex((item) => item._id === summary._id);
        if (index >= 0) {
          state.data[index] = summary;
          return;
        }
        state.data.unshift(summary);
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
