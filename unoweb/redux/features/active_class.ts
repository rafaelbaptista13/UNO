import { createSlice, Slice } from "@reduxjs/toolkit";

export interface ActiveClassState {
  id: number;
  name: string;
}

let active_class;
if (typeof window !== "undefined") {
  active_class = JSON.parse(localStorage.getItem("active_class") || "{}");
}

const initialState: ActiveClassState = active_class && active_class.id !== undefined
  ? active_class
  : {
      id: -1,
      name: "",
    };

const activeClassSlice: Slice = createSlice({
  name: "active_class",
  initialState,
  reducers: {
    setActiveClass: (state, action) => {
      localStorage.setItem("active_class", JSON.stringify(action.payload));
      return { id: action.payload.id, name: action.payload.name };
    },
  },
});

const { reducer, actions } = activeClassSlice;

export const { setActiveClass } = actions;
export default reducer;
