"use client";

import { useState } from "react";
import { PricingCard } from "./pricingCard";
import { cn } from "@/lib/utils";
import { useRazorpay } from "@/hooks/useRazorpay";

type BillingCycle = "monthly" | "annually";

export function PricingSection() {
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const { pay } = useRazorpay();
  const handlePayment = () => {
    const res = fetch("/api/payment");
  };

  const saveBadge =
    "rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground";

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16">
      <header className="mb-10 text-center">
        <span className="mx-auto mb-3 inline-block rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground">
          Pricing
        </span>
        <h1 className="text-balance text-3xl font-bold sm:text-4xl">
          Simple, Transparent Pricing
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-pretty text-sm text-muted-foreground sm:text-base">
          Start for free and upgrade as your time capsule collection grows. All
          plans include unlimited unlock dates.
        </p>

        {/* Segmented billing toggle */}
        <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary p-1">
          <button
            type="button"
            onClick={() => setBilling("monthly")}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm transition",
              billing === "monthly"
                ? "bg-background text-foreground shadow"
                : "text-muted-foreground"
            )}
            aria-pressed={billing === "monthly"}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBilling("annually")}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm transition",
              billing === "annually"
                ? "bg-background text-foreground shadow"
                : "text-muted-foreground"
            )}
            aria-pressed={billing === "annually"}
          >
            Annually
          </button>
          <span className={cn(saveBadge, "ml-2 hidden sm:inline-flex")}>
            Save 20%
          </span>
        </div>
      </header>

      {/* Pricing grid */}
      <div className="grid gap-6 md:grid-cols-3">
        <PricingCard
          title="Personal"
          description="Perfect for personal time capsules and memories."
          priceMonthly={0}
          features={[
            "Up to 5 time capsules",
            "Text messages only",
            "1GB storage",
            "Email notifications",
          ]}
          cta="Start Free"
          billing={billing}
        />

        <PricingCard
          title="Family"
          description="Ideal for families and close friends."
          priceMonthly={9}
          features={[
            "Up to 50 time capsules",
            "Photos & videos",
            "10GB storage",
            "Collaborative capsules",
            "Priority support",
          ]}
          cta="Start Free Trial"
          billing={billing}
          highlight
          onClick={() => pay({ name: "Family", price: "$1", billing })}
        />

        <PricingCard
          title="Legacy"
          description="For preserving memories across generations."
          priceMonthly={29}
          features={[
            "Unlimited time capsules",
            "All media types",
            "100GB storage",
            "Geo-locked capsules",
            "One-time access links",
            "White-label options",
          ]}
          cta="Start Free Trial"
          billing={billing}
        />
      </div>
    </section>
  );
}
