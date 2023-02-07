import { configureStore } from "@reduxjs/toolkit";
import activitiesReducer from "./features/activitiesSlice";

export const store = configureStore({
  reducer: {
    activities: activitiesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
