import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type LetterInput, type LetterResponse } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useLetter(shareId: string) {
  return useQuery({
    queryKey: [api.letters.get.path, shareId],
    queryFn: async () => {
      const url = buildUrl(api.letters.get.path, { shareId });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch letter");
      return api.letters.get.responses[200].parse(await res.json());
    },
    enabled: !!shareId,
  });
}

export function useCreateLetter() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: LetterInput) => {
      const res = await fetch(api.letters.create.path, {
        method: api.letters.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.letters.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create letter");
      }
      return api.letters.create.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      toast({
        title: "Letter drafted",
        description: "Your letter has been saved locally.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

export function useUpdateLetter() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<LetterInput>) => {
      const url = buildUrl(api.letters.update.path, { id });
      const res = await fetch(url, {
        method: api.letters.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update letter");
      return api.letters.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
       // Invalidate if needed, but for now updates are local-ish until share
    },
    onError: (error) => {
      toast({
        title: "Error saving",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}
