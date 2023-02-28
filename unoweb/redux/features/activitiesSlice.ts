import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";

export interface ActivitiesState {
  type: string;
  title: string;
}

const initialState: ActivitiesState = {
  type: "",
  title: "",
};

export const activitiesSlice: Slice = createSlice({
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

export default activitiesSlice.reducer;
