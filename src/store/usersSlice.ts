// src/store/usersSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./index";
import apiService from "../services/apiService";

export type User = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  imageUrl?: string; // avatar URL if you have it
};

type UsersState = {
  entities: Record<string, User>;              // key = _id
  loadingById: Record<string, boolean>;        // key = _id
  errorById: Record<string, string | undefined>; // key = _id
};

const initialState: UsersState = {
  entities: {},
  loadingById: {},
  errorById: {},
};

// Bulk-first loader (expects /user/profiles?ids=... to return User[])
export const loadUsersByIds = createAsyncThunk<
  Record<string, User>,   // returns map<_id, User>
  string[],               // arg is list of _id strings
  { state: RootState }
>("users/loadUsersByIds", async (ids, { getState }) => {
  const state = getState().users;
  const unique = Array.from(new Set(ids));
  const missing = unique.filter((_id) => !state.entities[_id]);

  if (missing.length === 0) return {};

  try {
    const bulkUrl = `/user/profiles?ids=${encodeURIComponent(missing.join(","))}`;
    const data: User[] = await apiService.get(bulkUrl);

    if (data && Array.isArray(data)) {
      const map: Record<string, User> = Object.fromEntries(
        data
          .filter((u): u is User => Boolean(u && u._id))
          .map((u) => [u._id, u])
      );

      // any still missing? (bulk might not return all)
      const stillMissing = missing.filter((m) => !map[m]);

      if (stillMissing.length) {
        const entries = await Promise.all(
          stillMissing.map(async (_id) => {
            try {
              // If you have a single profile endpoint, prefer that; otherwise keep this query style.
              const j = await apiService.get(`/user/profiles?ids=${_id}`);
              // If the API returns an array for single id, normalize it:
              const one: User | undefined = Array.isArray(j) ? j[0] : j;

              if (one && one._id) {
                return [one._id, one] as const;
              }

              // If your per-id endpoint is /users/{id}, you can alternatively:
              // const j = await apiService.get(`/users/${_id}`);
              // return [_id, { _id, firstName: j.firstName, lastName: j.lastName, email: j.email, imageUrl: j.avatarUrl || j.imageUrl || j.image }] as const;

              return [_id, { _id }] as const;
            } catch {
              return [_id, { _id }] as const;
            }
          })
        );
        for (const [k, v] of entries) map[k] = v;
      }

      return map;
    }
  } catch {
    // ignore and fall back to per-id only
  }

  // Per-ID only fallback
  const entries = await Promise.all(
    missing.map(async (_id) => {
      try {
        const j = await apiService.get(`/users/${_id}`);
        const u: User = {
          _id,
          firstName: j.firstName,
          lastName: j.lastName,
          email: j.email,
          imageUrl: j.avatarUrl || j.imageUrl || j.image,
        };
        return [_id, u] as const;
      } catch {
        return [_id, { _id }] as const;
      }
    })
  );

  return Object.fromEntries(entries);
});

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    upsertUsers(state, action: PayloadAction<User[]>) {
      for (const u of action.payload) {
        if (!u._id) continue;
        state.entities[u._id] = { ...(state.entities[u._id] || {}), ...u };
      }
    },
    clearUsers(state) {
      state.entities = {};
      state.loadingById = {};
      state.errorById = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUsersByIds.pending, (state, action) => {
        for (const _id of action.meta.arg) state.loadingById[_id] = true;
      })
      .addCase(loadUsersByIds.fulfilled, (state, action) => {
        const map = action.payload || {};
        for (const [_id, u] of Object.entries(map)) {
          state.entities[_id] = { ...(state.entities[_id] || {}), ...u };
          state.loadingById[_id] = false;
          state.errorById[_id] = undefined;
        }
        for (const _id of action.meta.arg) state.loadingById[_id] = false;
      })
      .addCase(loadUsersByIds.rejected, (state, action) => {
        for (const _id of action.meta.arg) {
          state.loadingById[_id] = false;
          state.errorById[_id] = action.error?.message || "Failed to load user";
        }
      });
  },
});

export const { upsertUsers, clearUsers } = usersSlice.actions;

// Selectors
export const selectUsersMap = (s: RootState) => s.users.entities;
export const selectUserById = (_id: string) => (s: RootState) => s.users.entities[_id];
export const selectUsersLoadingAny = (s: RootState, ids: string[]) =>
  ids.some((_id) => Boolean(s.users.loadingById[_id]));
export const selectUserErrorById = (_id: string) => (s: RootState) => s.users.errorById[_id];

export default usersSlice.reducer;
