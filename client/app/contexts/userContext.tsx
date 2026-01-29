import { createContext, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { postRequest } from "~/request";

export interface User {
  id: number;
  code: string;
  displayName?: string;
  state: string;
  role: string;
  accessToken: string;
  refreshToken: string;
}
const defaultUser: User = {
  id: 1,
  code: "asdf",
  state: "undefined",
  role: "guest",
  accessToken: "acccessToken-clientsent",
  refreshToken: "refreshToken-clientsent",
};

export const UserContext = createContext<User>(defaultUser);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [cookies, setCookie, removeCookie] = useCookies(["__session"]);

  const parsedCookie = JSON.parse(cookies["__session"] || "{}");
  const accessToken = parsedCookie.accessToken!;
  const refreshToken = parsedCookie.refreshToken!;

  useEffect(() => {
    if (user && user.id > 0) {
      setLoading(false);
      return;
    }
    setLoading(false);
    return;
    const fetchUser = async () => {
      try {
        if (accessToken || refreshToken) {
          const response = await postRequest(
            `/user/validate-token`,
            {},
            {
              Authorization: accessToken ? `Bearer ${accessToken}` : "",
              "x-refresh-token": refreshToken ? refreshToken : "",
            },
          );

          if (response.status === 200) {
            const userData = await response.data;
            setUser(userData);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  return (
    <UserContext value={user || defaultUser}>
      {!loading && children}
    </UserContext>
  );
}
