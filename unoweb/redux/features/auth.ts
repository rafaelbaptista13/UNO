import { createSlice, createAsyncThunk, Slice } from "@reduxjs/toolkit";
import { setMessage } from "./message";

import AuthService from "../../services/auth.service";

let user;
if (typeof window !== 'undefined') {
  user = JSON.parse(localStorage.getItem("user") || "{}");
}

export const register = createAsyncThunk(
  "auth/register",
  async ({ first_name, last_name, email, password }: {first_name: string, last_name: string, email: string, password: string}, thunkAPI) => {
    try {
      const response = await AuthService.register(first_name, last_name, email, password);
      thunkAPI.dispatch(setMessage(response.data.message));
      return response.data;
    } catch (error: any) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      thunkAPI.dispatch(setMessage(message));
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }: {email: string, password: string}, thunkAPI) => {
    try {
      const data = await AuthService.login(email, password);
      return { user: data };
    } catch (error: any) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      thunkAPI.dispatch(setMessage(message));
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  await AuthService.logout();
});

export interface AuthState {
  isLoggedIn: boolean,
  user: any
}

let initialState: AuthState;
if (user && Object.keys(user).length !== 0) {
  initialState = { isLoggedIn: true, user };
} else {
  initialState = { isLoggedIn: false, user: null };
}

console.log(initialState);

const authSlice: Slice = createSlice({
  name: "auth",
  initialState,
  extraReducers: (builder) => {
    builder.addCase(register.fulfilled, (state, action) => {
      state.isLoggedIn = false;
    })
    builder.addCase(register.rejected, (state, action) => {
      state.isLoggedIn = false;
    })
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoggedIn = true;
      state.user = action.payload.user;
    })
    builder.addCase(login.rejected, (state, action) => {
      state.isLoggedIn = false;
      state.user = null;
    })
    builder.addCase(logout.fulfilled, (state, action) => {
      state.isLoggedIn = false;
      state.user = null;
    })
  },
  reducers: {}
});

const { reducer } = authSlice;
export default reducer;
