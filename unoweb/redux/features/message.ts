import { createSlice, Slice } from "@reduxjs/toolkit";

export interface MessageState {
  message?: string;
}

const initialState: MessageState = {};

const messageSlice: Slice = createSlice({
  name: "message",
  initialState,
  reducers: {
    setMessage: (state, action) => {
      return { message: action.payload };
    },
    clearMessage: () => {
      return { message: "" };
    },
  },
});

const { reducer, actions } = messageSlice;

export const { setMessage, clearMessage } = actions;
export default reducer;
