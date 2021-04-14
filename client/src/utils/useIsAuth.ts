import { useRouter } from "next/router";
import { useEffect } from "react";
import { useQuery } from "react-query";
import { fetchMe } from "../api/routes/users";

export const useIsAuth = () => {
  const router = useRouter();
  const { data, isLoading } = useQuery("me", fetchMe);
  useEffect(() => {
    if (!isLoading && !data?.data.username) {
      router.replace("/login");
    }
  }, [isLoading, data, router]);
};
