import type { l } from "node_modules/@react-router/dev/dist/routes-CZR-bKRt";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { axiosInstance } from "~/axios-instance";
import type { Auth } from "~/components/common.interface";
import useLoading from "~/hooks/use-loading.hook";
const defaultAuth: Auth = {
  id: 0,
  code: "",
  state: "",
  role: "user",
  accessToken: "",
};

export const AuthContext = createContext<{
  auth: Auth;
  isLoading: boolean;
  login: any;
  logout: any;
}>({
  auth: defaultAuth,
  isLoading: true,
  login: (auth: Auth) => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const nav = useNavigate();
  const [auth, setAuth] = useState<Auth | null>(defaultAuth);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const login = (auth: Auth) => {
    window.localStorage.setItem("auth", JSON.stringify(auth));
    setAuth(auth);
  };
  const logout = () => {
    window.localStorage.removeItem("auth");
    setAuth(null);
    nav("/auth/signin");
  };

  useEffect(() => {
    const fetchAuth = async () => {
      setIsLoading(true);
      setAuth(null);
      const storedAuth = window.localStorage.getItem("auth");
      if (storedAuth) {
        console.log("stored auth found");
        const parsedAuth = JSON.parse(storedAuth) as Auth;
        console.log("check stored auth");
        try {
          const response = await axiosInstance.post(
            `/user/validate-token`,
            {},
            {
              headers: {
                Authorization: `Bearer ${parsedAuth?.accessToken}`,
              },
            },
          );

          if (response.status === 200) {
            console.log("stored auth is valid");
            const authData = await response.data.responseObject;
            login(authData);
          }
        } catch (error) {
          logout();
        }
      } else {
        console.log("No stored auth found / refresh token auth");
        try {
          const response = await axiosInstance.post(`/user/validate-token`, {});

          if (response.status === 200) {
            console.log("stored auth is valid");
            const authData = await response.data.responseObject;
            login(authData);
          }
        } catch (error) {
          logout();
        }
      }
      setIsLoading(false);
    };
    fetchAuth();
  }, []);

  return (
    <AuthContext
      value={{
        auth: auth || defaultAuth,
        isLoading: isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext>
  );
}
