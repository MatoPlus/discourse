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

export const recoverUserPassword = (recoverBody: { email: string }) =>
  axios.post(`${path}/recover`, recoverBody);

export const changePassword = (
  token: string,
  changePasswordBody: {
    password: string;
    confirm: string;
  }
) => axios.patch(`${path}/password/${token}`, changePasswordBody);
