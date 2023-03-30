import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";

export interface ActivitiesState {
  type: string;
}

const initialState: ActivitiesState = {
  type: "",
};

export const activitiesSlice: Slice = createSlice({
  initialState: initialState,
  name: "activities",
  reducers: {
    setType: (state, action: PayloadAction<string>) => {
      state.type = action.payload;
    },
  },
});

export const { setType } = activitiesSlice.actions;

export default activitiesSlice.reducer;
