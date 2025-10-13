"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { trpc } from "@/lib/trpc";
import { useUser } from "@clerk/nextjs";

function getInitials(name?: string) {
  if (!name) return "U";
  const parts = name.trim().split(" ").filter(Boolean);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function ProfileForm() {
  const { user: clerkUser } = useUser();
  const { toast } = useToast();

  const { data, isLoading } = trpc.user.getUser.useQuery(
    { clerkId: clerkUser?.id || "" },
    { enabled: !!clerkUser?.id }
  );

  const updateProfileMutation = trpc.user.updateProfile.useMutation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data?.exists && data.user) {
      setName(data.user.name || "");
      setEmail(data.user.email || "");
    }
  }, [data]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clerkUser?.id) {
      toast({
        title: "Not authenticated",
        description: "Please sign in to update your profile.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      await updateProfileMutation.mutateAsync({
        name,
        email,
      });

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (err: any) {
      toast({
        title: "Update failed",
        description: err?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card aria-labelledby="profile-heading">
      <CardHeader>
        <CardTitle id="profile-heading">Profile</CardTitle>
        <CardDescription>Update your name and email address.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-6 sm:grid-cols-2">
          <div className="col-span-full flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage
                src={clerkUser?.imageUrl || "/placeholder.svg"}
                alt={name ? `${name}'s avatar` : "Your avatar"}
              />
              <AvatarFallback>{getInitials(name)}</AvatarFallback>
            </Avatar>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder={isLoading ? "Loading..." : "Your name"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder={isLoading ? "Loading..." : "you@example.com"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className={cn("col-span-full")}>
            <Button type="submit" disabled={saving || isLoading}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
