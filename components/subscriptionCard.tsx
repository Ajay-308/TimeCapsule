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
import { useToast } from "@/hooks/use-toast";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";

export function SubscriptionCard() {
  const { toast } = useToast();
  const router = useRouter();

  const { data: subscription, isLoading } =
    trpc.payment.getUserSubscription.useQuery();
  const cancelSubscriptionMutation =
    trpc.payment.cancelSubscription.useMutation();

  const [canceling, setCanceling] = React.useState(false);

  async function handleCancelSubscription() {
    setCanceling(true);
    try {
      await cancelSubscriptionMutation.mutateAsync();

      toast({
        title: "Subscription cancelled",
        description: "Your subscription has been cancelled successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Cancellation failed",
        description: err?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setCanceling(false);
    }
  }

  function handleManageSubscription() {
    toast({
      title: "Coming soon",
      description: "Subscription management portal is being developed.",
    });
  }

  function handleUpgradePlan() {
    router.push("/pricing");
  }

  if (isLoading) {
    return (
      <Card aria-labelledby="subscription-heading">
        <CardHeader>
          <CardTitle id="subscription-heading">Subscription</CardTitle>
          <CardDescription>Loading subscription details...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const sub = subscription || {
    plan: "Personal",
    status: "free",
    billing: null,
    startDate: null,
    endDate: null,
  };

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
            <span className="text-base font-medium">
              {sub.plan || "Personal"}
            </span>
            {sub.status && (
              <Badge
                variant={sub.status === "active" ? "default" : "secondary"}
                aria-label={`Status ${sub.status}`}
              >
                {sub.status}
              </Badge>
            )}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Billing</div>
          <div className="mt-1 text-base font-medium capitalize">
            {sub.billing || "—"}
          </div>
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
        {sub.status === "active" && (
          <Button variant="default" onClick={handleManageSubscription}>
            Manage Subscription
          </Button>
        )}
        {(sub.status === "free" || sub.plan === "Personal") && (
          <Button variant="default" onClick={handleUpgradePlan}>
            Upgrade Plan
          </Button>
        )}
        {sub.status === "active" && (
          <Button
            variant="outline"
            onClick={handleCancelSubscription}
            disabled={canceling}
          >
            {canceling ? "Cancelling..." : "Cancel"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
