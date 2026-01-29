import { createCookie, createCookieSessionStorage } from "react-router";

// type SessionData = {
//   userId: number;
//   userCode: string;
//   displayName?: string;
//   accessToken: string;
//   refreshToken: string;
// };

// type SessionFlashData = {
//   error: string;
// };

// export const { getSession, commitSession, destroySession } =
//   createCookieSessionStorage<SessionData, SessionFlashData>({
//     cookie: {
//       name: "__session",
//       httpOnly: true,
//       maxAge: 60 * 60 * 24 * 7, // 7 days
//       domain: "ruler.kro.kr",
//       path: "/",
//       sameSite: "lax",
//       secure: process.env.NODE_ENV === "production",
//       secrets: [process.env.SESSION_SECRET || "default-secret"],
//     },
//   });

export const session = createCookie("__session", {
  maxAge: 60 * 60 * 24 * 7 * 2,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
});
