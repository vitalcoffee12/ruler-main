import { Data, Server, WebSocket } from "ws";

import { GuildService } from "../guild/guildService";
import { gameLib } from "./game.lib";
import { Entity } from "../game/gameModel";

const defaultUser = {
  userId: 1,
  userCode: "U-9oEjAF5a",
};

export interface Payload {
  type: string;
  userId: number;
  userCode: string;
  guildId: number;
  guildCode: string;
  content: any;
}

export type ExtendedWebSocket = WebSocket & {
  userId: number;
  userCode: string;
  guildId?: number;
  guildCode?: string;
};

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

export class SocketHandler {
  constructor(private ws: Server | null) {}

  public setWebSocketServer(ws: Server) {
    this.ws = ws;
  }

  public connection(socket: ExtendedWebSocket) {
    socket.on(
      "message",
      async (data: Data) => await this.receiveMessage(socket, data),
    );
    socket.on("close", () => {
      console.log("WebSocket connection closed");
    });
  }
  public async receiveMessage(socket: ExtendedWebSocket, data: Data) {
    const parsed = JSON.parse(data.toString()) as Payload;

    console.log(
      `Message ${parsed.type} received from user ${parsed.userId}/${parsed.userCode} in guild ${parsed.guildId}/${parsed.guildCode}\n`,
    );

    switch (parsed.type) {
      case MESSAGE_TYPES.USER_ONLINE:
        // Handle chat message
        socket.userId = Number(parsed.userId);
        socket.userCode = parsed.userCode;

        break;
      case MESSAGE_TYPES.USER_JOIN_GUILD:
        socket.guildId = Number(parsed.guildId);
        socket.guildCode = parsed.guildCode;

        await this.sendMemberList(parsed.guildCode);
        await this.sendChatUpdate(parsed.guildCode);
        await this.sendWorldUpdate(parsed.guildCode);
        break;
      // case MESSAGE_TYPES.GUILD_CHAT_MESSAGE:
      //   // Handle chat message
      //   await this.receiveGuildChatMessage(parsed);
      //   await this.sendChatUpdate(parsed.guildCode);
      //   const flagData = await this.receiveFlagUp(parsed);
      //   await this.sendChatUpdate(parsed.guildCode);
      //   if (flagData) {
      //     console.log("Received flag up data:", flagData);
      //     await this.requestEdit(flagData, parsed.guildCode);
      //     console.log("requestEdit has well completed");
      //   }
      //   await this.sendChatUpdate(parsed.guildCode);
      //   await this.sendWorldUpdate(parsed.guildCode);
      //   await this.sendMessageToGuild("GUILD_FLAG_DOWN", parsed.guildCode, {});
      //   break;
      // case "GUILD_FLAG_UP":
      //   // Handle flag up message
      //   // await this.sendMessageToGuild(
      //   //   "GUILD_FLAG_WAITING",
      //   //   parsed.guildCode,
      //   //   {},
      //   // );
      //   // const previousData = await this.receiveFlagUp(parsed);
      //   // await this.sendHistoryUpdate(parsed.guildCode);
      //   // if (previousData) {
      //   //   await this.requestEdit(previousData, parsed.guildCode);
      //   //   await this.sendHistoryUpdate(parsed.guildCode);
      //   // }
      //   // this.sendMessageToGuild("GUILD_FLAG_DOWN", parsed.guildCode, {});

      //   break;
      default:
        console.log(`Unknown message type: ${parsed.type}`);
        break;
    }
  }

  public async sendMessageToUserByUserId(
    type: string,
    userId: number,
    message: any,
  ) {
    // Implement sending message to specific socket
    console.log(`Sending message to userId ${userId}:`, { type, ...message });
    this.ws?.clients.forEach((client) => {
      const extClient = client as ExtendedWebSocket;
      if (extClient.userId === userId && client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({
            ...message,
            userId: extClient.userId,
            userCode: extClient.userCode,
            type,
          }),
        );
      }
    });
  }
  public async sendMessageToUserByUserCode(
    type: string,
    userCode: string,
    message: any,
  ) {
    // Implement sending message to specific socket
    console.log(`Sending message to userCode ${userCode}:`, {
      type,
      ...message,
    });
    this.ws?.clients.forEach((client) => {
      const extClient = client as ExtendedWebSocket;
      if (
        extClient.userCode === userCode &&
        client.readyState === WebSocket.OPEN
      ) {
        client.send(
          JSON.stringify({
            ...message,
            userId: extClient.userId,
            userCode: extClient.userCode,
            type,
          }),
        );
      }
    });
  }
  public async sendMessageToGuild(
    type: string,
    guildCode: string,
    message: any,
  ) {
    console.log(`Sending message to guildCode ${guildCode}:`, {
      type,
      ...message,
    });
    this.ws?.clients.forEach((client) => {
      const extClient = client as ExtendedWebSocket;
      if (
        extClient.guildCode === guildCode &&
        client.readyState === WebSocket.OPEN
      ) {
        client.send(
          JSON.stringify({
            ...message,
            userId: extClient.userId,
            userCode: extClient.userCode,
            guildCode: extClient.guildCode,
            guildId: extClient.guildId,
            type,
          }),
        );
      }
    });
  }

  async sendMemberList(guildCode: string) {
    this.sendMessageToGuild(
      MESSAGE_TYPES.GUILD_MEMBER_LIST_UPDATE,
      guildCode,
      {},
    );
  }

  async sendWorldUpdate(guildCode: string) {
    console.log(`Sending world update to guildCode ${guildCode}:`, {});
    this.sendMessageToGuild(MESSAGE_TYPES.GUILD_WORLD_UPDATE, guildCode, {});
  }
  async sendChatUpdate(guildCode: string) {
    console.log(`Sending chat update to guildCode ${guildCode}:`, {});
    this.sendMessageToGuild(MESSAGE_TYPES.GUILD_CHAT_UPDATE, guildCode, {});
  }

  // async receiveGuildChatMessage(payload: Payload) {
  //   try {
  //     await gameLib.insertGameHistory(payload.guildCode, {
  //       chat: {
  //         userId: payload.userId,
  //         userCode: payload.userCode,
  //         message: payload.content.message,
  //       },
  //       entities: payload.content.entities,
  //     });
  //   } catch (ex) {
  //     const errorMessage = ex instanceof Error ? ex.message : "Unknown error";
  //     console.error(`Error handling guild chat message: ${errorMessage}`);
  //   }
  // }

  // async receiveFlagUp(payload: Payload): Promise<{
  //   memberCodes: string;
  //   narrative: string;
  //   sceneDescription: string;
  //   // documents: string;
  //   // terms: string;
  //   entities: Entity[];
  // } | null> {
  //   try {
  //     return await gameLib.requestNarrative(payload.guildCode);
  //   } catch (ex) {
  //     const errorMessage = ex instanceof Error ? ex.message : "Unknown error";
  //     console.error(`Error handling flag up message: ${errorMessage}`);
  //   }
  //   return null;
  // }

  // async requestEdit(
  //   previousData: {
  //     memberCodes: string;
  //     narrative: string;
  //     sceneDescription: string;
  //     entities: Entity[];
  //   },
  //   guildCode: string,
  // ) {
  //   try {
  //     await gameLib.requestEdit(previousData, guildCode);
  //   } catch (ex) {
  //     const errorMessage = ex instanceof Error ? ex.message : "Unknown error";
  //     console.error(`Error handling entity update: ${errorMessage}`);
  //   }
  // }
}

export const socketHandler = new SocketHandler(null);
