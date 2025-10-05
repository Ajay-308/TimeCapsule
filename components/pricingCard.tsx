import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type BillingCycle = "monthly" | "annually";

export type PricingCardProps = {
  title: string;
  description: string;
  priceMonthly: number | null; // null => Free
  features: string[];
  cta: string;
  highlight?: boolean;
  billing: BillingCycle;
  onClick?: () => void | Promise<void>;
};

export function PricingCard({
  title,
  description,
  priceMonthly,
  features,
  cta,
  highlight,
  billing,
  onClick,
}: PricingCardProps) {
  const price =
    priceMonthly == null
      ? "Free"
      : billing === "monthly"
      ? `$${priceMonthly}`
      : `$${Math.round(priceMonthly * 0.8)}`;

  const sub =
    priceMonthly == null ? "" : billing === "monthly" ? "/month" : "/month";

  return (
    <Card
      className={cn(
        "relative flex h-full flex-col justify-between border bg-card text-card-foreground",
        highlight
          ? "border-(--color-chart-3) shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-chart-3)_60%,transparent)]"
          : ""
      )}
    >
      {highlight && (
        <div className="absolute right-3 top-3">
          {/* using badge from shadcn if available; fallback is styled span */}
          <Badge
            className="border-0 bg-(--color-chart-3) text-(--color-foreground)"
            variant="default"
          >
            Most Popular
          </Badge>
        </div>
      )}
      <CardHeader className="space-y-2">
        <h3 className="text-balance text-xl font-semibold">{title}</h3>
        <div className="flex items-end gap-1">
          <span
            className={cn(
              "text-4xl font-extrabold tracking-tight",
              highlight ? "text-(--color-foreground)" : ""
            )}
          >
            {price}
          </span>
          {sub && (
            <span className="pb-1 text-sm text-muted-foreground">{sub}</span>
          )}
        </div>
        <p className="text-pretty text-sm text-muted-foreground">
          {description}
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        <ul className="grid gap-3">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-3">
              <Check
                className="mt-0.5 size-4 shrink-0 text-(--color-chart-3)"
                aria-hidden="true"
              />
              <span className="text-sm leading-6">{f}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          className={cn(
            "w-full",
            highlight
              ? "bg-(--color-chart-3) text-(--color-foreground) hover:opacity-90"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
          onClick={onClick}
        >
          {cta}
        </Button>
      </CardFooter>
    </Card>
  );
}
