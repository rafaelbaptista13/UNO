import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface ActivitiesState {
  type: string;
  title: string;
}

const initialState: ActivitiesState = {
  type: "video",
  title: "Não definido",
};

export const activitiesSlice = createSlice({
  initialState: initialState,
  name: "activities",
  reducers: {
    setType: (state, action: PayloadAction<string>) => {
      state.type = action.payload;
    },
    setTitle: (state, action: PayloadAction<string>) => {
      state.title = action.payload;
    },
  },
});

export const { setType, setTitle } = activitiesSlice.actions;

export const activitiesState = (state: RootState) => state.activities;

export default activitiesSlice.reducer;
