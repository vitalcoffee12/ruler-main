import { useContext, useEffect, useRef, useState } from "react";
import { SocketContext } from "~/contexts/socketContext";
import { AuthContext } from "~/contexts/authContext";

export interface Payload {
  type: string;
  userId: number;
  userCode: string;
  guildId: number;
  guildCode: string;
  content: any;
}

export default function useSocket() {
  const { auth, setAuth } = useContext(AuthContext);
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
          userId: auth?.id,
          userCode: auth?.code,
          guildCode: auth?.guildCode,
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
