import { Document } from "mongoose";

export default interface UserDocument extends Document {
  username: string;
  email: string;
  hashedPassword: string;
}
