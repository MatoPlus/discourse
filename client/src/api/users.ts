import axios from "axios";

const baseUrl = (process.env.NEXT_PUBLIC_API_URL as string) + "/users";

export const registerUser = (user: {
  username: string;
  email: string;
  password: string;
}) => axios.post(baseUrl + "/register", user);

export const loginUser = (loginBody: {
  usernameOrEmail: string;
  password: string;
}) => axios.post(baseUrl + "/login", loginBody);
