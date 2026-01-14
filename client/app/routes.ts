import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("views/layout.tsx", [
    index("views/welcome/welcome.tsx"),

    route("auth", "views/auth/layout.tsx", [
      route("register", "views/auth/register.tsx"),
      route("signin", "views/auth/signin.tsx"),
    ]),

    route("game", "views/game/lobby-layout.tsx", [
      index("views/game/lobby.tsx"),
      route(":guildId", "views/game/guild-layout.tsx", [
        index("views/game/guild-dashboard.tsx"),
      ]),
    ]),
  ]),
] satisfies RouteConfig;
