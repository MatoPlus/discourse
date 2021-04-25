import { useRouter } from "next/router";

// Get query id using router
export const useGetId = () => {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : "-1";
  return id;
};
