"use client";

import { trpc } from "@/lib/trpc";

export function useTrpcUser(clerkId?: string) {
  const { data, error, isLoading, refetch } = trpc.user.getUser.useQuery(
    { clerkId: clerkId! },
    { enabled: !!clerkId }
  );

  return { data, error, isLoading, mutate: refetch };
}
