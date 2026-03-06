import { createContext, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useLocation } from "react-router";
import type { Auth } from "~/components/common.interface";
import useLoading from "~/hooks/use-loading.hook";
import { postRequest } from "~/request";

const defaultAuth: Auth = {
  id: 0,
  code: "",
  state: "",
  role: "user",
  accessToken: "",
};

export const AuthContext = createContext<{
  auth: Auth;
  checkingAuth?: boolean;
  setAuth: React.Dispatch<React.SetStateAction<Auth | null>>;
}>({
  auth: defaultAuth,
  setAuth: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<Auth | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [loading, setIsLoading] = useLoading();

  useEffect(() => {
    const storedAuth = window.localStorage.getItem("auth");
    if (storedAuth) {
      try {
        const parsedAuth = JSON.parse(storedAuth) as Auth;
        setAuth(parsedAuth);
      } catch (error) {
        console.error("Failed to parse auth from localStorage:", error);
        setAuth(null);
      }
    }
    setIsCheckingAuth(false);
  }, []);

  useEffect(() => {
    if (auth && auth.id > 0) {
      setIsLoading(false);
      return;
    }
    const fetchAuth = async () => {
      try {
        if (!auth?.accessToken || auth.accessToken.trim() === "") {
          const response = await postRequest(`/user/refresh-token`, {});
          if (response.status === 200) {
            const authData = await response.data.responseObject;
            setAuth(authData);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setAuth(null);
      }
      setIsLoading(false);
    };

    fetchAuth();
  }, [auth]);

  return (
    <AuthContext
      value={{
        auth: auth || defaultAuth,
        checkingAuth: isCheckingAuth,
        setAuth,
      }}
    >
      {children}
      {loading}
    </AuthContext>
  );
}
