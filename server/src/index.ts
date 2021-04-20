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
  let updateQueue: {
    [roomId: string]: {
      updating?: boolean;
      content: string;
      timer?: NodeJS.Timeout;
    };
  } = {};

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

    socket.on("code edit", (value) => {
      socket.broadcast.to(roomId as string).emit("code edit", value);

      console.log(updateQueue);

      if (!updateQueue[roomId as string]) {
        updateQueue[roomId as string] = { updating: true, content: value };
      } else {
        updateQueue[roomId as string].content = value;
      }

      if (!updateQueue[roomId as string].timer) {
        updateQueue[roomId as string].timer = setInterval(() => {
          if (!updateQueue[roomId as string].updating) {
            clearInterval(
              updateQueue[roomId as string].timer as NodeJS.Timeout
            );
            delete updateQueue[roomId as string];
            return;
          }

          Room.findOneAndUpdate(
            { _id: roomId },
            { $set: { content: updateQueue[roomId as string].content } }
          ).then((res) => {
            console.log(res);
            updateQueue[roomId as string].updating = false;
          });
        }, 3000);
      }
    });

    socket.on("setting edit language", (language) => {
      socket.broadcast
        .to(roomId as string)
        .emit("setting edit language", language);

      Room.findOneAndUpdate({ _id: roomId }, { $set: { mode: language } }).then(
        (res) => {
          console.log(res);
        }
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
