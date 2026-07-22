"use client";

import { useState, useTransition, useCallback } from "react";
import { motion } from "framer-motion";
import { Save, Check } from "lucide-react";
import { updateSystemSetting } from "@/lib/actions";
import { useAdminI18n } from "@/lib/admin-i18n";

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
        checked ? "bg-red-600" : "bg-gray-300"
      }`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`inline-block h-5 w-5 rounded-full bg-white shadow-md ${
          checked ? "ml-6" : "ml-1"
        }`}
      />
    </button>
  );
}

export function SettingsClient({
  settings,
}: {
  settings: Record<string, unknown>;
}) {
  const [liveTracking, setLiveTracking] = useState(
    settings.customer_live_tracking === true || settings.customer_live_tracking === "true",
  );
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const { lang, t } = useAdminI18n();

  const handleSave = useCallback(() => {
    startTransition(async () => {
      await Promise.all([
        updateSystemSetting("customer_live_tracking", liveTracking),
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }, [liveTracking]);

  return (
    <div className="space-y-8 max-w-2xl" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">{t("settingsTitle")}</h1>
        <p className="text-sm text-gray-500">{t("configurePreferences")}</p>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-900">
                {t("liveTracking")}
              </p>
              <p className="text-xs text-gray-500">
                {t("liveTrackingDesc")}
              </p>
            </div>
            <Toggle checked={liveTracking} onChange={setLiveTracking} />
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={pending}
        className="btn-primary text-sm disabled:opacity-50"
      >
        {saved ? (
          <>
            <Check className="h-4 w-4" /> {t("saved")}
          </>
        ) : pending ? (
          t("saving")
        ) : (
          <>
            <Save className="h-4 w-4" /> {t("saveSettings")}
          </>
        )}
      </button>
    </div>
  );
}
