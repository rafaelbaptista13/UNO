import { configureStore } from "@reduxjs/toolkit";
import activitiesReducer from "./features/activitiesSlice";
import authReducer from "./features/auth";
import messageReducer from "./features/message";

export const store = configureStore({
  reducer: {
    activities: activitiesReducer,
    auth: authReducer,
    message: messageReducer
  },
  devTools: true,
});

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>;
export default store;