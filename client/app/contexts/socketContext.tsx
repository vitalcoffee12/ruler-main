import { createContext, useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "./userContext";

export interface SocketInstance {
  isConnected: boolean;
  payloads: Payload[];
  socket: WebSocket | null;
}

const defaultSocket: SocketInstance = {
  isConnected: false,
  payloads: [],
  socket: null,
};

export interface Payload {
  type: string;
  userId: number;
  userCode: string;
  guildId: number;
  guildCode: string;
  content: any;
}

export const SocketContext = createContext<SocketInstance>(defaultSocket);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socketInstance, setSocketInstance] = useState<SocketInstance | null>(
    null,
  );
  const user = useContext(UserContext);

  useEffect(() => {
    if (!user.code) return;
    console.log("SocketProvider - Initializing WebSocket", user);
    const socket = new WebSocket(
      import.meta.env.REACT_APP_WS_URL || "ws://localhost:8080",
    );

    setSocketInstance({
      isConnected: false,
      payloads: [],
      socket: socket,
    });

    socket.onopen = () => {
      console.log("WebSocket connected");
      setSocketInstance((prev) => ({
        ...prev!,
        isConnected: true,
      }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data) as Payload;
      console.log("WebSocket message received:", data);
      setSocketInstance((prev) => ({
        ...prev!,
        payloads: [...(prev?.payloads || []), data],
      }));
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
      setSocketInstance((prev) => ({
        ...prev!,
        isConnected: false,
      }));
    };

    return () => {
      console.log("SocketProvider - Cleaning up", user);
      if (socket.readyState === WebSocket.OPEN) socket.close();
    };
  }, [user.code]);

  return (
    <SocketContext value={socketInstance || defaultSocket}>
      {children}
    </SocketContext>
  );
}
