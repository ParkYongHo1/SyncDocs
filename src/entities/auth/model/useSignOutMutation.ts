import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signOut } from "../api";
import { useDocumentStore } from "@/features/document-editing/model/useDocumentStore";

export function useSignOutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.setQueryData(["currentUser"], null);
      useDocumentStore.getState().setCurrentDocumentId(null);
    },
  });
}
