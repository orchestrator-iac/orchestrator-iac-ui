// store/iconsSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiService from "../services/apiService";

interface FetchIconsArgs {
  query?: string;
  exact_search?: boolean;
  page?: number;
  pageSize?: number;
  cloudType?: string;
}

export const fetchIcons = createAsyncThunk(
  "icons/fetchIcons",
  async ({
    query = "",
    exact_search = false,
    page = 1,
    pageSize = 20,
    cloudType,
  }: FetchIconsArgs) => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("page_size", String(pageSize));
    if (cloudType) params.set("cloud_type", cloudType);

    const endpoint = query
      ? `/icons/search?query=${encodeURIComponent(query)}&exact_search=${exact_search}&${params.toString()}`
      : `/icons?${params.toString()}`;

    const response = await apiService.get(endpoint);
    return response;
  },
);

const iconsSlice = createSlice({
  name: "icons",
  initialState: {
    icons: [] as any[],
    loading: false,
    page: 1,
    hasMore: true,
    error: null as string | null,
  },
  reducers: {
    resetIcons: (state) => {
      state.icons = [];
      state.page = 1;
      state.hasMore = true;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIcons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIcons.fulfilled, (state, action) => {
        if (action.payload.length === 0) {
          state.hasMore = false;
        } else {
          state.icons.push(...action.payload);
          state.page += 1;
        }
        state.loading = false;
      })
      .addCase(fetchIcons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load icons.";
      });
  },
});

export const { resetIcons } = iconsSlice.actions;
export default iconsSlice.reducer;
