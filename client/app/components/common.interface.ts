export interface Guild {
  id: number;
  code: string;
  name: string;
  iconPath?: string;
  ownerId: number;
  ownerCode: string;
  colorCode?: string;
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
