import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { templateService, ListTemplatesParams } from "../services/templateService";
import { TemplateListItem } from "../types/template";

type SortBy = "popularity" | "newest";
type Status = "idle" | "loading" | "succeeded" | "failed";

interface FetchTemplatesArg extends ListTemplatesParams {
  /** When true, append results to the existing list (infinite scroll).
   *  When false (default), replace the list (new search / sort reset). */
  append?: boolean;
}

interface TemplatesState {
  items: TemplateListItem[];
  total: number;
  page: number;
  hasMore: boolean;
  status: Status;
  error: string | null;
  searchQuery: string;
  sortBy: SortBy;
}

const initialState: TemplatesState = {
  items: [],
  total: 0,
  page: 1,
  hasMore: true,
  status: "idle",
  error: null,
  searchQuery: "",
  sortBy: "popularity",
};

export const fetchTemplates = createAsyncThunk(
  "templates/fetchTemplates",
  async ({
    page = 1,
    size = 20,
    search,
    sort = "popularity",
  }: FetchTemplatesArg) => {
    const response = await templateService.listTemplates({
      page,
      size,
      search,
      sort,
    });
    return { response, page };
  },
);

const templatesSlice = createSlice({
  name: "templates",
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setSortBy(state, action: PayloadAction<SortBy>) {
      state.sortBy = action.payload;
    },
    resetTemplates(state) {
      state.items = [];
      state.total = 0;
      state.page = 1;
      state.hasMore = true;
      state.status = "idle";
      state.error = null;
    },
    /** Optimistically update like state on a single item. */
    updateLike(
      state,
      action: PayloadAction<{ id: string; liked: boolean; likeCount: number }>,
    ) {
      const item = state.items.find((t) => t.id === action.payload.id);
      if (item) {
        item.analytics.isLikedByMe = action.payload.liked;
        item.analytics.likeCount = action.payload.likeCount;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTemplates.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        const { response, page } = action.payload;
        state.status = "succeeded";
        state.total = response.total;
        state.page = response.page;

        if (page === 1) {
          // Replace list (new search / sort)
          state.items = response.templates;
        } else {
          // Append (infinite scroll next page)
          state.items = [...state.items, ...response.templates];
        }

        state.hasMore =
          state.items.length < response.total && response.templates.length > 0;
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch templates";
      });
  },
});

export const { setSearchQuery, setSortBy, resetTemplates, updateLike } =
  templatesSlice.actions;

export default templatesSlice.reducer;
