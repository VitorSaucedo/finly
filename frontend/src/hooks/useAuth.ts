import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setCredentials, logout } from "../store/authSlice";
import { authService } from "../services/authService";
import type { LoginRequest, RegisterRequest } from "../types/auth";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated } = useAppSelector(
    (state) => state.auth,
  );

  const login = async (data: LoginRequest) => {
    const response = await authService.login(data);
    dispatch(
      setCredentials({ user: response.user, token: response.accessToken }),
    );
    return response;
  };

  const register = async (data: RegisterRequest) => {
    const response = await authService.register(data);
    dispatch(
      setCredentials({ user: response.user, token: response.accessToken }),
    );
    return response;
  };

  const signOut = () => {
    dispatch(logout());
  };

  return { user, token, isAuthenticated, login, register, signOut };
};
