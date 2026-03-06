import { createContext, useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "./authContext";

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
  const { auth } = useContext(AuthContext);

  useEffect(() => {
    if (!auth?.code) return;
    console.log("SocketProvider - Initializing WebSocket", auth);
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
      if (socket.readyState === WebSocket.OPEN) socket.close();
    };
  }, [auth?.code]);

  return (
    <SocketContext value={socketInstance || defaultSocket}>
      {children}
    </SocketContext>
  );
}
