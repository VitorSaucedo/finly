import { useEffect, useState } from "react";
import AppRouter from "./router/AppRouter";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { setCredentials, logout } from "./store/authSlice";
import { userService } from "./services/userService";

const App = () => {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!token) {
      setHydrated(true);
      return;
    }

    userService
      .getMe()
      .then((userData) => {
        dispatch(setCredentials({ user: userData, token }));
      })
      .catch(() => {
        dispatch(logout());
      })
      .finally(() => {
        setHydrated(true);
      });
  }, []);

  if (!hydrated) return null;

  return <AppRouter />;
};

export default App;
