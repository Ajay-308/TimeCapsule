"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { trpc } from "@/lib/trpc";
import { useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";

export function PreferencesForm() {
  const { user } = useUser();
  const { toast } = useToast();
  const { setTheme } = useTheme();

  const { data: preferences, isLoading } = trpc.user.getPreferences.useQuery(
    undefined,
    { enabled: !!user?.id }
  );

  const updatePreferencesMutation = trpc.user.updatePreferences.useMutation();

  const [theme, setThemeState] = React.useState<"system" | "light" | "dark">(
    "system"
  );
  const [emailNotifs, setEmailNotifs] = React.useState(true);
  const [pushNotifs, setPushNotifs] = React.useState(false);
  const [collaborations, setCollaborations] = React.useState(true);
  const [publicWall, setPublicWall] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (preferences) {
      setThemeState(preferences.theme || "system");
      setEmailNotifs(preferences.emailNotifications ?? true);
      setPushNotifs(preferences.pushNotifications ?? false);
      setCollaborations(preferences.allowCollaborations ?? true);
      setPublicWall(preferences.showOnPublicWall ?? true);
    }
  }, [preferences]);

  async function onSave() {
    setSaving(true);
    try {
      await updatePreferencesMutation.mutateAsync({
        theme,
        emailNotifications: emailNotifs,
        pushNotifications: pushNotifs,
        allowCollaborations: collaborations,
        showOnPublicWall: publicWall,
      });

      // Update the actual theme
      setTheme(theme);

      toast({
        title: "Preferences saved",
        description: "Your preferences have been successfully updated.",
      });
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

  return (
    <Card aria-labelledby="preferences-heading">
      <CardHeader>
        <CardTitle id="preferences-heading">Preferences</CardTitle>
        <CardDescription>
          Set theme, notifications, and privacy options.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-2 sm:max-w-sm">
          <Label>Theme</Label>
          <Select
            value={theme}
            onValueChange={(v: "system" | "light" | "dark") => setThemeState(v)}
            disabled={isLoading}
          >
            <SelectTrigger aria-label="Theme selector">
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label className="mb-1 block">Email notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive updates about capsules and activity.
              </p>
            </div>
            <Switch
              checked={emailNotifs}
              onCheckedChange={setEmailNotifs}
              aria-label="Toggle email notifications"
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label className="mb-1 block">Push notifications</Label>
              <p className="text-sm text-muted-foreground">
                Enable browser push notifications.
              </p>
            </div>
            <Switch
              checked={pushNotifs}
              onCheckedChange={setPushNotifs}
              aria-label="Toggle push notifications"
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label className="mb-1 block">Allow collaborations</Label>
              <p className="text-sm text-muted-foreground">
                Other users can invite you to capsules.
              </p>
            </div>
            <Switch
              checked={collaborations}
              onCheckedChange={setCollaborations}
              aria-label="Toggle collaborations"
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label className="mb-1 block">Show on Public Wall</Label>
              <p className="text-sm text-muted-foreground">
                Display public capsules on your wall.
              </p>
            </div>
            <Switch
              checked={publicWall}
              onCheckedChange={setPublicWall}
              aria-label="Toggle public wall visibility"
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <Button onClick={onSave} disabled={saving || isLoading}>
            {saving ? "Saving..." : "Save preferences"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
