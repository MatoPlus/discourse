import { fetchRoom } from "../api/rooms";
import { useGetQueryId } from "./useGetQueryId";

export const useGetRoomFromUrl = () => {
  return fetchRoom("6068ca7f8355fa159e4c4b3a");
};
