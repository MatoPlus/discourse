import axios from "../baseAxios";

const path = "/rooms";

export const fetchRooms = () => axios.get(path);

export const fetchRoom = (id: string) =>
  axios.get(`${path}/${id}`, { withCredentials: true });

export const createRoom = (room: {
  name: string;
  maxUsers: number;
  password?: string;
}) => axios.post(path, room);

export const enterRoom = (id: string, room: { password?: string }) =>
  axios.patch(`${path}/enter/${id}`, room, { withCredentials: true });

export const leaveRoom = (id: string) =>
  axios.patch(`${path}/leave/${id}`, { withCredentials: true });
