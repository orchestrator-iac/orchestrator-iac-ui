import { configureStore } from '@reduxjs/toolkit';
import resourceReducer from './resourceSlice';
import iconReducer from './iconsSlice';
import customWrappersReducer from './customWrappersSlice';
import wrappersTemplateReducer from './wrappersTemplateSlice';
import resourcesReducer from './resourcesSlice';

export const store = configureStore({
  reducer: {
    resource: resourceReducer,
    icons: iconReducer,
    customWrappers: customWrappersReducer,
    wrappersTemplate: wrappersTemplateReducer,
    resources: resourcesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
