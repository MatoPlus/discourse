import axios from "../baseAxios";

const path = "/rooms";

export const fetchRooms = () => axios.get(path);

export const fetchRoom = (id: string) =>
  axios.get(`${path}/${id}`, { withCredentials: true });
