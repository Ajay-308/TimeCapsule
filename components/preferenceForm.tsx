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

export function PreferencesForm() {
  const [theme, setTheme] = React.useState<"system" | "light" | "dark">(
    "system"
  );
  const [emailNotifs, setEmailNotifs] = React.useState(true);
  const [pushNotifs, setPushNotifs] = React.useState(false);
  const [collaborations, setCollaborations] = React.useState(true);
  const [publicWall, setPublicWall] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  async function onSave() {
    setSaving(true);
    console.log("[v0] Saving preferences", {
      theme,
      emailNotifs,
      pushNotifs,
      collaborations,
      publicWall,
    });
    await new Promise((r) => setTimeout(r, 500));
    setSaving(false);
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
          <Select value={theme} onValueChange={(v: any) => setTheme(v)}>
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
            />
          </div>
        </div>

        <div>
          <Button onClick={onSave} disabled={saving}>
            {saving ? "Saving..." : "Save preferences"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
