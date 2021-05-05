import { Document } from "mongoose";

export default interface RoomDocument extends Document {
  host: string;
  name: string;
  hashedPassword?: string;
  hasPassword: boolean;
  maxUsers: number;
  currentUsers: [{ userId: string }];
  content: string;
  mode: string;
}
