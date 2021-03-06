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
    // Join a code room
    const { roomId, username } = socket.handshake.query;

    // Connect socket to room channel
    if (roomId) {
      socket.join(roomId as string);
      socket.broadcast.to(roomId as string).emit("user-join", username);
    }

    // Save content to database
    socket.on("save-content", async (content) => {
      await Room.findOneAndUpdate({ _id: roomId }, { $set: { content } }).catch(
        (err) => console.log("save error:", err)
      );
    });

    // Save language mode change and emit
    socket.on("send-mode-change", async (language) => {
      socket.broadcast
        .to(roomId as string)
        .emit("receive-mode-change", language);

      await Room.findOneAndUpdate(
        { _id: roomId },
        { $set: { mode: language } }
      );
    });

    // Emit chat message in room channel
    socket.on("send-chat-message", (value) => {
      io.to(roomId as string).emit("receive-chat-message", {
        value: value,
        username: username,
      });
    });

    // On disconnect, emit that user has left and leave channel
    socket.on("disconnect", () => {
      socket.broadcast.to(roomId as string).emit("user-leave", username);
      socket.leave(roomId as string);
    });
  });

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

  await mongoose.connect(process.env.DATABASE_URI, {
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
