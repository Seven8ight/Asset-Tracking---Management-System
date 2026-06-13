import { Server } from "node:http";
import type { AuthenticatedSocket, SocketIOService } from "./socket.types.js";
import { Socket, Server as SocketServer, type ExtendedError } from "socket.io";
import type { PublicUser } from "../Users/user.types.js";
import { decode_access_token } from "../../Utilities/Jwt.js";
import { assetServ, assetsService, assetsService } from "../../Data Objects/DTO.js";

/*
    1. Ownership change to asset as per the department
    2. Broken asset change
    3. Maintenance change report
*/

export class SocketIO implements SocketIOService {
  public ioServer: SocketServer;

  private establishMiddleware() {
    this.ioServer.use(
      (socket: Socket, next: (error?: ExtendedError) => void) => {
        try {
          const token = socket.handshake.auth?.token as string | undefined;

          if (!token) return next(new Error("Auth token not provided"));

          const user = decode_access_token(token!);
          if (!(user as PublicUser).id)
            return next(new Error("Invalid auth token provided"));

          socket.data.user = user as PublicUser;
          next();
        } catch (error) {
          next(new Error("Unauthorized user"));
        }
      },
    );
  }

  constructor(private server: Server) {
    this.ioServer = new SocketServer({ connectTimeout: 4000 });

    this.establishMiddleware();
    this.ioServer.on("connection", (socket: Socket) => {
      const authenticatedSocket: AuthenticatedSocket = socket,
        { id, department_id } = authenticatedSocket.data.user;

        const assetsServ = assetsService

      socket.join(`Rooms:${department_id}`);

      socket.on(
        "ownership change",
        async (
          departmentId: string,
          assetsId:string,
          event: {
            asset_id: string;
            status: string;
          },
        ) => {
            const asset = await assetServ.getIndividualAssets(assetsId)
            
          this.ioServer
            .to(`Rooms:${departmentId}`)
            .emit("ownership change", {
                asset_id:asset.
            });
        },
      );
    });
  }

  establishConnection(): void {
    this.ioServer.listen(this.server);
  }

  emitToAdmins(event: string, data: unknown): void {}
  emitToUser(userId: string, event: string, data: unknown): void {}
  broadcast(event: string, data: unknown): void {
    this.ioServer.emit(event, data);
  }
}
