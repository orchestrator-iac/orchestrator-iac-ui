// store/iconsSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiService from "../services/apiService";

interface FetchIconsArgs {
  query?: string;
  exact_search?: boolean;
  page?: number;
  pageSize?: number;
}

export const fetchIcons = createAsyncThunk(
  "icons/fetchIcons",
  async ({
    query = "",
    exact_search = false,
    page = 1,
    pageSize = 20,
  }: FetchIconsArgs) => {
    const endpoint = query
      ? `/icons/search?query=${encodeURIComponent(
          query
        )}&exact_search=${exact_search}&page=${page}&page_size=${pageSize}`
      : `/icons?page=${page}&page_size=${pageSize}`;

    const response = await apiService.get(endpoint);
    return response;
  }
);

const iconsSlice = createSlice({
  name: "icons",
  initialState: {
    icons: [] as any[],
    loading: false,
    page: 1,
    hasMore: true,
  },
  reducers: {
    resetIcons: (state) => {
      state.icons = [];
      state.page = 1;
      state.hasMore = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIcons.pending, (state) => {
        state.loading = true;
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
      .addCase(fetchIcons.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { resetIcons } = iconsSlice.actions;
export default iconsSlice.reducer;
