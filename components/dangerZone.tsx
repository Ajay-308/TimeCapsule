"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { useState } from "react";

export function DangerZone() {
  const { toast } = useToast();
  const router = useRouter();
  const { signOut } = useClerk();
  const deleteAccountMutation = trpc.user.deleteAccount.useMutation();
  const [deleting, setDeleting] = useState(false);

  async function onDelete() {
    setDeleting(true);
    try {
      await deleteAccountMutation.mutateAsync();

      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      });

      // Sign out and redirect to home
      await signOut();
      router.push("/");
    } catch (err: any) {
      toast({
        title: "Deletion failed",
        description: err?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
      setDeleting(false);
    }
  }

  return (
    <Card aria-labelledby="danger-heading">
      <CardHeader>
        <CardTitle id="danger-heading">Danger Zone</CardTitle>
        <CardDescription>
          Delete your account and all associated data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          This action is irreversible. All of your time capsules, files, and
          collaborations will be permanently removed.
        </p>
      </CardContent>
      <CardFooter>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={deleting}>
              {deleting ? "Deleting..." : "Delete Account"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
