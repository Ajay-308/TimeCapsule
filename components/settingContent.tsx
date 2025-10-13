"use client";

import { ProfileForm } from "./profileForm";
import { PreferencesForm } from "./preferenceForm";
import { SubscriptionCard } from "./subscriptionCard";
import { DangerZone } from "./dangerZone";

export function SettingsContent() {
  return (
    <div className="space-y-8">
      <ProfileForm />
      <PreferencesForm />
      <SubscriptionCard />
      <DangerZone />
    </div>
  );
}
