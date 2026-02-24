import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface AuthState {
  user: UserState | null;
  token: string | null;
  isAuthenticated: boolean;
}

const token = localStorage.getItem("finly_token");
const storedUser = localStorage.getItem("finly_user");

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: token,
  isAuthenticated: !!token,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: UserState; token: string }>,
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem("finly_token", action.payload.token);
      localStorage.setItem("finly_user", JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("finly_token");
      localStorage.removeItem("finly_user");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
