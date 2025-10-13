"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type Subscription = {
  plan: string | null;
  status: string | null;
  billing: string | null;
  startDate?: string | null;
  endDate?: string | null;
};

export function SubscriptionCard() {
  // Placeholder data. Wire this up to your billing provider later.
  const [sub] = React.useState<Subscription>({
    plan: "Free",
    status: "active",
    billing: "monthly",
    startDate: new Date().toISOString(),
    endDate: null,
  });

  return (
    <Card aria-labelledby="subscription-heading">
      <CardHeader>
        <CardTitle id="subscription-heading">Subscription</CardTitle>
        <CardDescription>
          Manage your plan and billing settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Current plan</div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-base font-medium">{sub.plan ?? "—"}</span>
            {sub.status && (
              <Badge variant="secondary" aria-label={`Status ${sub.status}`}>
                {sub.status}
              </Badge>
            )}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Billing</div>
          <div className="mt-1 text-base font-medium">{sub.billing ?? "—"}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Since</div>
          <div className="mt-1 text-base font-medium">
            {sub.startDate ? new Date(sub.startDate).toLocaleDateString() : "—"}
          </div>
        </div>
      </CardContent>
      <Separator className="my-2" />
      <CardFooter className="flex flex-wrap gap-2">
        <Button
          variant="default"
          onClick={() => console.log("[v0] Manage subscription")}
        >
          Manage Subscription
        </Button>
        <Button
          variant="secondary"
          onClick={() => console.log("[v0] Upgrade plan")}
        >
          Upgrade Plan
        </Button>
        <Button
          variant="outline"
          onClick={() => console.log("[v0] Cancel subscription")}
        >
          Cancel
        </Button>
      </CardFooter>
    </Card>
  );
}
