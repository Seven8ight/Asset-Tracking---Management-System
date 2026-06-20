import type { Socket } from "socket.io";
import type { PublicUser } from "../Users/user.types.js";

export type AuthenticatedSocket = Socket & {
  data: {
    user: PublicUser;
  };
};

export interface SocketIOService {
  establishConnection: () => void;
  emitToAdmins: (event: string, data: unknown) => void;
  broadcast: (event: string, data: unknown) => void;
}
