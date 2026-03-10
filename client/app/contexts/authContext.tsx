import type { l } from "node_modules/@react-router/dev/dist/routes-CZR-bKRt";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
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
  login: any;
  logout: any;
}>({
  auth: defaultAuth,
  login: (auth: Auth) => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const nav = useNavigate();
  const [auth, setAuth] = useState<Auth | null>(defaultAuth);
  const [loading, setIsLoading] = useLoading();

  const login = (auth: Auth) => {
    window.localStorage.setItem("auth", JSON.stringify(auth));
    setAuth(auth);
  };
  const logout = () => {
    window.localStorage.removeItem("auth");
    setAuth(null);
    nav("/auth/login");
  };

  useEffect(() => {
    const fetchAuth = async () => {
      try {
        setIsLoading(true);
        const storedAuth = window.localStorage.getItem("auth");
        if (storedAuth) {
          const parsedAuth = JSON.parse(storedAuth) as Auth;
          setAuth(parsedAuth);
        }

        if (auth?.accessToken) {
          const response = await postRequest(
            `/user/validate-token`,
            {},
            {
              Authorization: `Baerer ${auth?.accessToken}`,
            },
          );

          if (response.status === 200) {
            const authData = await response.data.responseObject;
            login(authData);
          } else {
            logout();
          }
        }
      } catch (error) {
        logout();
      }
      setIsLoading(false);
    };

    fetchAuth();
  }, []);

  return (
    <AuthContext
      value={{
        auth: auth || defaultAuth,
        login,
        logout,
      }}
    >
      {children}
      {loading}
    </AuthContext>
  );
}
