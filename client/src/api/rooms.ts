import axios from "axios";

const url = (process.env.NEXT_PUBLIC_API_URL as string) + "/rooms";

export const fetchRooms = () => axios.get(url);

export const fetchRoom = (id: string) => axios.get(url + "/" + id);
