import { createContext, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useLocation } from "react-router";
import { postRequest } from "~/request";

export interface User {
  id: number;
  code: string;
  displayName?: string;
  state: string;
  role: string;
  guildCode?: string | null;
  accessToken: string;
  refreshToken: string;
}
const defaultUser: User = {
  id: 1,
  code: "U-9oEjAF5a",
  state: "active",
  role: "user",
  accessToken: "acccessToken-clientsent",
  refreshToken: "refreshToken-clientsent",
};

export const UserContext = createContext<User>(defaultUser);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [guildCode, setGuildCode] = useState<string | null>(null);
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

  useEffect(() => {
    const paths = location.pathname.split("/");
    if (paths.includes("guild")) {
      // Do something when in game routes
      const guildCodeFromPath = paths[4] || null;
      setGuildCode(guildCodeFromPath);
    } else {
      setGuildCode(null);
      // Do something when outside game routes
    }
  }, [location.pathname]);

  return (
    <UserContext value={{ ...(user || defaultUser), guildCode }}>
      {!loading && children}
    </UserContext>
  );
}
