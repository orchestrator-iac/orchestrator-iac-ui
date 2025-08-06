// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import homeReducer from './homeSlice';
import resourceReducer from './resourceSlice';

export const store = configureStore({
  reducer: {
    home: homeReducer,
    resource: resourceReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
