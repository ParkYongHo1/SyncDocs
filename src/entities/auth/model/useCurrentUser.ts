import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "../api";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });
}
