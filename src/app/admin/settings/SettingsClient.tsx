"use client";

import { useState, useTransition, useCallback } from "react";
import { motion } from "framer-motion";
import { Save, Check } from "lucide-react";
import { updateSystemSetting } from "@/lib/actions";

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
        checked ? "bg-cobalt-500" : "bg-ink-700"
      }`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`inline-block h-5 w-5 rounded-full bg-paper shadow-md ${
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
  const [ttl, setTtl] = useState(
    typeof settings.order_ttl === "number" ? settings.order_ttl : 4,
  );
  const [liveTracking, setLiveTracking] = useState(
    typeof settings.live_tracking === "boolean" ? settings.live_tracking : true,
  );
  const [soundEnabled, setSoundEnabled] = useState(
    typeof settings.sound_enabled === "boolean" ? settings.sound_enabled : true,
  );
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleSave = useCallback(() => {
    startTransition(async () => {
      await Promise.all([
        updateSystemSetting("order_ttl", ttl),
        updateSystemSetting("live_tracking", liveTracking),
        updateSystemSetting("sound_enabled", soundEnabled),
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }, [ttl, liveTracking, soundEnabled]);

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-extrabold text-paper">Settings</h1>
        <p className="text-sm text-paper/50">Configure system preferences</p>
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-ink-800 bg-ink-950 p-5">
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-bold text-paper">
              Order TTL (hours)
            </label>
            <span className="text-sm font-bold text-cobalt-500">{ttl}h</span>
          </div>
          <p className="text-xs text-paper/40 mb-4">
            Auto-expire orders after this duration
          </p>
          <input
            type="range"
            min={1}
            max={72}
            value={ttl}
            onChange={(e) => setTtl(Number(e.target.value))}
            className="w-full accent-cobalt-500"
          />
          <div className="flex justify-between text-xs text-paper/30 mt-1">
            <span>1h</span>
            <span>72h</span>
          </div>
        </div>

        <div className="rounded-xl border border-ink-800 bg-ink-950 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-paper">
                Live Order Tracking
              </p>
              <p className="text-xs text-paper/40">
                Show real-time order status to customers
              </p>
            </div>
            <Toggle checked={liveTracking} onChange={setLiveTracking} />
          </div>
        </div>

        <div className="rounded-xl border border-ink-800 bg-ink-950 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-paper">Sound Alerts</p>
              <p className="text-xs text-paper/40">
                Play sound for new incoming orders
              </p>
            </div>
            <Toggle checked={soundEnabled} onChange={setSoundEnabled} />
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={pending}
        className="btn-primary disabled:opacity-50"
      >
        {saved ? (
          <>
            <Check className="h-4 w-4" /> Saved
          </>
        ) : pending ? (
          "Saving..."
        ) : (
          <>
            <Save className="h-4 w-4" /> Save Settings
          </>
        )}
      </button>
    </div>
  );
}
