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

    route("game", "views/lobby/lobby-layout.tsx", [
      route("", "views/lobby/lobby-service-layout.tsx", [
        route("explore", "views/lobby-services/explore.tsx"),
        route("friends", "views/lobby-services/friends.tsx"),
        route("resources", "views/lobby-services/resources.tsx"),
        route("shop", "views/lobby-services/shop.tsx"),
        route("community", "views/community/community-layout.tsx", [
          route(":communityId", "views/community/community-dashboard.tsx"),
        ]),
      ]),

      route("guild/:guildId", "views/game/guild-layout.tsx", [
        index("views/game/guild-dashboard.tsx"),
      ]),
    ]),
  ]),
] satisfies RouteConfig;
