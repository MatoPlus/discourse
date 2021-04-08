import "dotenv-safe/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import roomRoutes from "./routes/rooms";
import userRoutes from "./routes/users";

const main = async () => {
  const app = express();

  app.use(express.json({ limit: "16mb" }));
  app.use(express.urlencoded({ limit: "16mb", extended: true }));
  app.use(cors());

  app.use("/rooms", roomRoutes);
  app.use("/users", userRoutes);

  await mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  mongoose.set("useFindAndModify", false);

  app.listen(process.env.PORT, () =>
    console.log(`Server running on port: ${process.env.PORT}`)
  );
};

main().catch((err) => {
  console.error(err);
});
