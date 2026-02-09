import { Data, Server, WebSocket } from "ws";
import { GameService } from "./gameService";
import { GuildService } from "../guild/guildService";

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

export class SocketHandler {
  constructor(
    private ws: Server | null,
    private gameService: GameService = new GameService(),
    private guildService: GuildService = new GuildService(),
  ) {}

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
      case "USER_ONLINE":
        // Handle chat message
        socket.userId = parsed.userId;
        socket.userCode = parsed.userCode;

        break;
      case "USER_JOIN_GUILD":
        socket.guildId = parsed.guildId;
        socket.guildCode = parsed.guildCode;

        this.sendMemberList(parsed.guildCode);
        this.sendHistoryUpdate(parsed.guildCode);
        break;
      case "GUILD_CHAT_MESSAGE":
        // Handle chat message
        await this.receiveGuildChatMessage(parsed);
        this.sendHistoryUpdate(parsed.guildCode);

        break;
      case "GUILD_FLAG_UP":
        // Handle flag up message
        break;
      default:
        console.log(`Unknown message type: ${parsed.type}`);
        break;
    }
  }

  public sendMessageToUser(type: string, userCode: string, message: any) {
    // Implement sending message to specific socket
    this.ws?.clients.forEach((client) => {
      const extClient = client as ExtendedWebSocket;
      if (
        extClient.userCode === userCode &&
        client.readyState === WebSocket.OPEN
      ) {
        client.send(JSON.stringify({ ...message, userCode, type }));
      }
    });
  }
  public sendMessageToGuild(type: string, guildCode: string, message: any) {
    this.ws?.clients.forEach((client) => {
      const extClient = client as ExtendedWebSocket;
      if (
        extClient.guildCode === guildCode &&
        client.readyState === WebSocket.OPEN
      ) {
        client.send(JSON.stringify({ ...message, guildCode, type }));
      }
    });
  }

  async sendMemberList(guildCode: string) {
    const members = await this.guildService.findMembersByGuild({
      guildCode,
    });

    this.sendMessageToGuild("GUILD_MEMBER_LIST_UPDATE", guildCode, {
      content: members.responseObject,
    });
  }

  async sendHistoryUpdate(guildCode: string) {
    const guildData = await this.guildService.getHistoryByCode(guildCode);
    this.sendMessageToGuild("GUILD_CHAT_UPDATE", guildCode, {
      content: guildData.responseObject,
    });
  }
  async sendWorldUpdate(guildCode: string) {
    const guildData = await this.guildService.getHistoryByCode(guildCode);
    this.sendMessageToGuild("GUILD_WORLD_UPDATE", guildCode, {
      content: guildData.responseObject,
    });
  }

  async receiveGuildChatMessage(payload: Payload) {
    try {
      await this.gameService.receiveMessage(
        payload.guildCode,
        payload.userId,
        payload.userCode,
        payload.content.message,
        payload.content.entities,
      );
    } catch (ex) {
      const errorMessage = ex instanceof Error ? ex.message : "Unknown error";
      console.error(`Error handling guild chat message: ${errorMessage}`);
    }
  }
}

export const socketHandler = new SocketHandler(null);
