import "dotenv-safe/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import roomRoutes from "./routes/rooms";
import userRoutes from "./routes/users";
import authRoutes from "./routes/auth";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import Room from "./models/room";

const main = async () => {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN,
    },
  });

  io.on("connection", (socket) => {
    console.log("a user has connected");

    // Join a code room
    const { roomId } = socket.handshake.query;
    socket.join(roomId as string);

    socket.on("send-content-change", (value) => {
      socket.broadcast
        .to(roomId as string)
        .emit("receive-content-change", value);
    });

    socket.on("save-content", async (content) => {
      console.log("saved...");
      await Room.findOneAndUpdate({ _id: roomId }, { $set: { content } });
    });

    socket.on("send-mode-change", async (language) => {
      console.log("lang:", language);
      socket.broadcast
        .to(roomId as string)
        .emit("receive-mode-change", language);

      await Room.findOneAndUpdate(
        { _id: roomId },
        { $set: { mode: language } }
      );
    });

    // TODO: Add count down to disconnect sockets when no user in room
    socket.on("disconnect", () => {
      console.log("user disconnected");
      socket.leave(roomId as string);
    });
  });

  // TODO: Use a redis session to store room cookies (needed for anon users) that keeps track of { temp: boolean, username: string }

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "16mb" }));
  app.use(express.urlencoded({ limit: "16mb", extended: true }));
  app.use(cookieParser());

  app.use("/rooms", roomRoutes);
  app.use("/users", userRoutes);
  app.use("/auth", authRoutes);

  await mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  mongoose.set("useFindAndModify", false);

  httpServer.listen(process.env.PORT, () =>
    console.log(`Server running on port: ${process.env.PORT}`)
  );
};

main().catch((err) => {
  console.error(err);
});
