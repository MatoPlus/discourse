import axios from "../baseAxios";

const path = "/auth";

export const refreshAccessToken = () =>
  axios.post(`${path}/refresh`, null, { withCredentials: true });
