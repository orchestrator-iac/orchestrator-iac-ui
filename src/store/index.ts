import {
  AnyAction,
  combineReducers,
  configureStore,
} from "@reduxjs/toolkit";
import resourceReducer from "./resourceSlice";
import iconReducer from "./iconsSlice";
import customWrappersReducer from "./customWrappersSlice";
import wrappersTemplateReducer from "./wrappersTemplateSlice";
import resourcesReducer from "./resourcesSlice";
import resourceAnalyticsReducer from "./resourceAnalyticsSlice";
import usersReducer from "./usersSlice";
import orchestratorsReducer from "./orchestratorsSlice";
import templatesReducer from "./templatesSlice";
import chatReducer from "./chatSlice";
import { resetAppState } from "./appActions";

const appReducer = combineReducers({
  resource: resourceReducer,
  icons: iconReducer,
  customWrappers: customWrappersReducer,
  wrappersTemplate: wrappersTemplateReducer,
  resources: resourcesReducer,
  resourceAnalytics: resourceAnalyticsReducer,
  users: usersReducer,
  orchestrators: orchestratorsReducer,
  templates: templatesReducer,
  chat: chatReducer,
});

const rootReducer = (
  state: ReturnType<typeof appReducer> | undefined,
  action: AnyAction,
) => {
  if (resetAppState.match(action)) {
    return appReducer(undefined, action);
  }

  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof appReducer>;
export type AppDispatch = typeof store.dispatch;
