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

export interface GameHistory {
  _id: string;
  sceneId: number;
  chat: { userId: number; userCode: string; message: string };
  tasks?: { type: string; input: string; output: string }[];
  entities: any[];
  citations: any[];
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
  citations: { content: string; ruleId: number; description?: string }[];
  entities: any[];
  tasks?: string;
}

export interface Entity {
  id: string;
  name: string;
  description: string;
  secrets?: string; // Optional field for GM's reference, not used in gameplay
  score?: number;
  relations: { id: string; type: string }[];
  features: string[];
  favorite?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
