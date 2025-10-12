"use client";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import Navbar from "@/components/navbar";

export default function ArchivedCapsules({}) {
  const utils = trpc.useUtils();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const { data: archivedCapsules = [] } = trpc.capsule.getArchived.useQuery();

  const unarchiveMutation = trpc.capsule.unarchiveCapsule.useMutation({
    onSuccess: async () => {
      // Refresh capsule list after unarchiving
      await utils.capsule.getArchived.invalidate();
      await utils.capsule.listUserCapsules.invalidate();
      setLoadingId(null);
    },
  });

  const handleUnarchive = async (id: string) => {
    setLoadingId(id);
    unarchiveMutation.mutate({ capsuleId: id });
  };

  return (
    <>
      <Navbar />
      <div className="p-8 space-y-4">
        <h1 className="text-2xl font-bold mb-4">Archived Capsules</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {archivedCapsules.map((capsule) => (
            <Card key={capsule.id} className="flex flex-col justify-between">
              <CardContent className="p-4">
                <h3 className="font-semibold">{capsule.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {capsule.content}
                </p>
              </CardContent>

              <CardFooter className="p-4 pt-0">
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={loadingId === capsule.id}
                  onClick={() => handleUnarchive(capsule.id)}
                >
                  {loadingId === capsule.id ? "Unarchiving..." : "Unarchive"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
