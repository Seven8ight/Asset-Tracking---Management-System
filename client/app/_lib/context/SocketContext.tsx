"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { ServerAPI } from "../constants/globals";
import { useAuth } from "./AuthContext";

const SocketContext = createContext<Socket | null>(null);
export const useSocketContext = () => useContext(SocketContext);

const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null),
    user = useAuth();

  useEffect(() => {
    const socketInstance = io(ServerAPI, {
      withCredentials: true,
      auth: {
        token: user.accessToken,
      },
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export default SocketProvider;
