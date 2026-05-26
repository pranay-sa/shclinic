import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "./config.js";

type TokenPayload = {
  sub: string;
  clinicId: string;
  role: string;
};

export let io: Server | null = null;

export function setupRealtime(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: { origin: env.API_CORS_ORIGIN, credentials: true }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error("missing auth token"));
    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
      socket.data.clinicId = payload.clinicId;
      socket.join(`clinic:${payload.clinicId}`);
      next();
    } catch {
      next(new Error("invalid auth token"));
    }
  });

  io.on("connection", (socket) => {
    socket.emit("connected", { ok: true });
  });

  return io;
}

export function emitClinicEvent(clinicId: string, event: string, payload: unknown) {
  io?.to(`clinic:${clinicId}`).emit(event, payload);
}
