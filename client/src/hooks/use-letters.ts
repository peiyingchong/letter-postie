import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { encodeLetter } from "@shared/routes";
import type { Letter } from "@shared/schema";

export function useCreateLetter() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const mutateAsync = useCallback(async (data: Letter) => {
    try {
      const encoded = encodeLetter(data);
      const shareUrl = `${window.location.origin}${window.location.pathname}#/letter/${encoded}`;
      return { shareUrl, encoded };
    } catch {
      toast({
        title: "Error",
        description: "Failed to create share link.",
        variant: "destructive",
      });
      throw new Error("Failed to encode letter");
    }
  }, [toast]);

  return {
    mutateAsync,
    isPending: false,
  };
}
