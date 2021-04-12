import axios from "axios";
import { getAccessToken } from "../accessToken";

axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL;

axios.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.authorization = `Bearer ${token}`;
  }
  return config;
});

export default axios;
