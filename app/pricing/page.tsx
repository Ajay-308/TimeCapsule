import { PricingSection } from "@/components/pricingSection";

export default function PricingPage() {
  return (
    <main className="relative">
      {/* subtle grid background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in oklab, var(--color-foreground) 8%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--color-foreground) 8%, transparent) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage:
            "radial-gradient(80% 60% at 50% 0%, black 40%, transparent 100%)",
          opacity: 0.2,
        }}
      />
      <PricingSection />
    </main>
  );
}
