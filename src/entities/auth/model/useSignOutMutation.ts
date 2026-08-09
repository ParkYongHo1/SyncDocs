import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signOut } from "../api";

export function useSignOutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.setQueryData(["currentUser"], null);
    },
  });
}
