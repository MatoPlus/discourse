import axios from "../baseAxios";

const path = "/users";

export const registerUser = (user: {
  username: string;
  email: string;
  password: string;
}) => axios.post(`${path}/register`, user);

export const loginUser = (loginBody: {
  usernameOrEmail: string;
  password: string;
}) => axios.post(`${path}/login`, loginBody, { withCredentials: true });

export const logoutUser = () =>
  axios.post(`${path}/logout`, null, { withCredentials: true });

export const fetchMe = () =>
  axios.get(`${path}/current`, { withCredentials: true });
