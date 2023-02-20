import { createSlice, createAsyncThunk, Slice } from "@reduxjs/toolkit";
import { setMessage } from "./message";

import AuthService from "../../services/auth.service";

let user;
if (typeof window !== "undefined") {
  user = JSON.parse(localStorage.getItem("user") || "{}");
}

const messages = new Map<string, string>([
  ["User was registered successfully!", "Utilizador registado com sucesso!"],
  ["Failed! Email is already in use!", "Erro! Email já está a ser utilizado!"],
  ["User Not found.", "Utilizador não encontrado."],
  ["Invalid Password!", "Palavra passe incorreta!"],
]);

export const register = createAsyncThunk(
  "auth/register",
  async (
    {
      first_name,
      last_name,
      email,
      password,
    }: {
      first_name: string;
      last_name: string;
      email: string;
      password: string;
    },
    thunkAPI
  ) => {
    try {
      const response = await AuthService.register(
        first_name,
        last_name,
        email,
        password
      );
      const translated_message = messages.get(response.data.message);
      thunkAPI.dispatch(
        setMessage(
          translated_message ? translated_message : response.data.message
        )
      );
      return response.data;
    } catch (error: any) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      const translated_message = messages.get(message);
      thunkAPI.dispatch(
        setMessage(translated_message ? translated_message : message)
      );
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    thunkAPI
  ) => {
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
      const translated_message = messages.get(message);
      thunkAPI.dispatch(
        setMessage(translated_message ? translated_message : message)
      );
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  await AuthService.logout();
});

export interface AuthState {
  isLoggedIn: boolean;
  user: any;
}

let initialState: AuthState;

if (user && Object.keys(user).length !== 0) {
  initialState = { isLoggedIn: true, user };
} else {
  initialState = { isLoggedIn: false, user: null };
}

const authSlice: Slice = createSlice({
  name: "auth",
  initialState,
  extraReducers: (builder) => {
    builder.addCase(register.fulfilled, (state, action) => {
      state.isLoggedIn = false;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.isLoggedIn = false;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoggedIn = true;
      state.user = action.payload.user;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoggedIn = false;
      state.user = null;
    });
    builder.addCase(logout.fulfilled, (state, action) => {
      console.log("aqui");
      state.isLoggedIn = false;
      state.user = null;
    });
  },
  reducers: {},
});

const { reducer } = authSlice;
export default reducer;
