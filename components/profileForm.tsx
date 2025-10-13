"use client";

import * as React from "react";
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
import { useTrpcUser } from "@/hooks/useTrpcUser";
import { trpc } from "@/lib/trpc";

function getInitials(name?: string) {
  if (!name) return "U";
  const parts = name.trim().split(" ").filter(Boolean);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function ProfileForm(props: { clerkId?: string }) {
  const { clerkId } = props;
  const { toast } = useToast();
  const { data, isLoading } = useTrpcUser(clerkId);
  const syncUserMutation = trpc.user.syncUser.useMutation();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("you@example.com");
  const [image, setImage] = React.useState<string | undefined>(undefined);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (data?.exists && data.user) {
      setName((prev) => (prev ? prev : data.user.name ?? ""));
      setEmail((prev) =>
        prev && prev !== "you@example.com" ? prev : data.user.email ?? ""
      );
      setImage((prev) => (prev ? prev : data.user.image ?? undefined));
    }
  }, [data]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clerkId) {
      toast({
        title: "Missing clerkId",
        description:
          "Provide a clerkId prop to ProfileForm so we can call tRPC.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      const res = await syncUserMutation.mutateAsync({
        name,
        email,
        image: image || "",
        clerkId,
      });
      if (res?.user) {
        toast({
          title: "Profile saved",
          description: "Your profile has been updated.",
        });
      } else {
        toast({
          title: "Profile synced",
          description: "User created successfully.",
        });
      }
    } catch (err: any) {
      toast({
        title: "Save failed",
        description: err?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  function onImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImage(url);
    console.log("[v0] Avatar selected", { name: file.name, size: file.size });
  }

  return (
    <Card aria-labelledby="profile-heading">
      <CardHeader>
        <CardTitle id="profile-heading">Profile</CardTitle>
        <CardDescription>
          Update your name, avatar, and email address.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-6 sm:grid-cols-2">
          {!clerkId && (
            <div className="col-span-full">
              <p className="text-xs text-muted-foreground">
                Tip: pass a clerkId to ProfileForm (e.g., from your auth) to
                enable tRPC syncing.
              </p>
            </div>
          )}
          <div className="col-span-full flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage
                src={image || "/placeholder.svg"}
                alt={name ? `${name}'s avatar` : "Your avatar"}
              />
              <AvatarFallback>{getInitials(name)}</AvatarFallback>
            </Avatar>
            <div>
              <Label htmlFor="avatar">Avatar</Label>
              <Input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={onImageChange}
                className="mt-2"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                PNG, JPG up to 2MB.
              </p>
            </div>
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
