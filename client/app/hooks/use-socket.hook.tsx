import { useContext, useEffect, useRef, useState } from "react";
import { SocketContext } from "~/contexts/socketContext";
import { UserContext } from "~/contexts/userContext";

export interface Payload {
  type: string;
  userId: number;
  userCode: string;
  guildId: number;
  guildCode: string;
  content: any;
}

export default function useSocket() {
  const user = useContext(UserContext);
  const socketInstance = useContext(SocketContext);

  const sendMessage = (type: string, content?: any) => {
    console.log("Sending message:", { type, content });
    if (
      socketInstance.socket &&
      socketInstance.socket.readyState === WebSocket.OPEN
    ) {
      socketInstance.socket.send(
        JSON.stringify({
          type,
          userId: user?.id,
          userCode: user?.code,
          guildCode: user?.guildCode,
          content,
        } as Payload),
      );
    } else {
      console.warn("WebSocket is not connected. Unable to send message.");
    }
  };

  return {
    payloads: socketInstance.payloads,
    isConnected: socketInstance.socket?.readyState === WebSocket.OPEN,
    sendMessage,
  };
}
