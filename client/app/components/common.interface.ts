export interface Guild {
  id: number;
  code: string;
  name: string;
  iconPath?: string;
  ownerId: number;
  ownerCode: string;
  colorCode?: string;
  state?: string;
  updatedAt: Date;
  createdAt: Date;
}

export interface GuildMember {
  userId: number;
  userCode: string;
  iconPath?: string;
  displayName: string;
  role: string;
}

export interface Auth {
  id: number;
  code: string;
  displayName?: string;
  state: string;
  role: string;
  guildCode?: string | null;
  accessToken: string;
  iconPath?: string;
}

export interface GuildChat {
  userId: number;
  userCode: string;
  message: string;
}
export interface HistoryTask {
  type: string;
  input: string;
  output: string;
}
export interface GameHistory {
  _id: string;
  sceneId: number;
  chat: GuildChat;
  tasks?: HistoryTask[];
  entities: Entity[];
  createdAt: Date;
}

export interface GuildChatMessage {
  _id: string;
  type: string;
  color: string;
  userId: number;
  userCode: string;
  iconPath?: string;
  displayName: string;
  content: string;
  timestamp: Date;
  entities: Entity[];
  tasks?: HistoryTask[];
}

export interface Entity {
  name: string;
  type: string;
  location: string;
  group?: string;
  // relations: { name: string; type: string }[];
  // state: { [key: string]: string };
  description: string;
  personality?: string;
  backstory?: string;
  appearance?: string;
  route?: string[];
  related?: string[]; // related entities' names
  documents: string[];
  memory: string[];
  lastScore: number;
  lastSceneId: number;
  retreivedCount: number;
  preference: number;
  isPreferred: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const MESSAGE_TYPES = {
  USER_ONLINE: "USER_ONLINE",
  USER_JOIN_GUILD: "USER_JOIN_GUILD",
  GUILD_LIST_UPDATE: "GUILD_LIST_UPDATE",

  AGENT_PROCESSING: "AGENT_PROCESSING",
  AGENT_COMPLETE: "AGENT_COMPLETE",

  GUILD_MEMBER_LIST_UPDATE: "GUILD_MEMBER_LIST_UPDATE",
  GUILD_WORLD_UPDATE: "GUILD_WORLD_UPDATE",
  GUILD_CHAT_UPDATE: "GUILD_CHAT_UPDATE",
};
