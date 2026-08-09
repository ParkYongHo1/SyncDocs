import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signInAsDemo } from "../api";

export function useSignInMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signInAsDemo,
    onSuccess: (user) => {
      queryClient.setQueryData(["currentUser"], user);
    },
  });
}
