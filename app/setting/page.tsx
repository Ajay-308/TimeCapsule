import type { Metadata } from "next";
import { Separator } from "@/components/ui/separator";
import { SettingsContent } from "@/components/settingContent";
import Navbar from "@/components/navbar";

export const metadata: Metadata = {
  title: "Settings • TimeCapsule",
  description: "Manage your profile, preferences, and subscription.",
};

export default function SettingsPage() {
  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-pretty">
            Settings
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your account, preferences, and subscription.
          </p>
        </header>
        <Separator />
        <section className="mt-8">
          <SettingsContent />
        </section>
      </main>
    </>
  );
}
