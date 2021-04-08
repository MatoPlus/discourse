import { Document } from "mongoose";

export default interface RoomDocument extends Document {
  host: string;
  name: string;
  maxUsers: number;
}
