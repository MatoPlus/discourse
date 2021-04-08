import { useRouter } from "next/router";

export const useGetQueryId = () => {
  const router = useRouter();
  return router.query.id;
};
