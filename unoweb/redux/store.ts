import { configureStore } from "@reduxjs/toolkit";
import activitiesReducer from "./features/activitiesSlice";
import authReducer from "./features/auth";
import messageReducer from "./features/message";
import activeClassReducer from "./features/active_class";

export const store = configureStore({
  reducer: {
    activities: activitiesReducer,
    auth: authReducer,
    message: messageReducer,
    active_class: activeClassReducer
  },
  devTools: true,
});

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>;
export default store;