import { defaultRecordsPerPage } from "../../constants";
import axios from "../baseAxios";

const path = "/rooms";

export const fetchRooms = (
  page: number,
  recordsPerPage: number = defaultRecordsPerPage
) => axios.get(path, { params: { page, recordsPerPage } });

export const fetchRoom = (id: string) =>
  axios.get(`${path}/${id}`, { withCredentials: true });

export const editRoom = (
  id: string,
  room: {
    name: string;
    maxUsers: number;
    description: string;
    password?: string;
  }
) => axios.patch(`${path}/${id}`, room);

export const deleteRoom = (id: string) => axios.delete(`${path}/${id}`);

export const createRoom = (room: {
  name: string;
  maxUsers: number;
  description: string;
  password?: string;
}) => axios.post(path, room);

export const enterRoom = (id: string, room: { password?: string }) =>
  axios.patch(`${path}/enter/${id}`, room, { withCredentials: true });

export const leaveRoom = (id: string) =>
  axios.patch(`${path}/leave/${id}`, { withCredentials: true });

export const verifyUserForRoom = (id: string) =>
  axios.get(`${path}/verify/${id}`, { withCredentials: true });
