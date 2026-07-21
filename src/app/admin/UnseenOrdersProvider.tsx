"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { getNewOrderAlerts } from "@/lib/actions";
import { playOrderAlertSound } from "@/lib/order-alert-audio";
import { createClient } from "@/lib/supabase/client";

interface OrderAlert {
  id: string;
  tableId: string;
  submittedAt: string;
  branchName?: string;
}

const LAST_SEEN_KEY = "admin-orders-last-seen-at";

const UnseenOrdersContext = createContext<{
  count: number;
  branchFilter: string;
  setBranchFilter: (branch: string) => void;
  reset: () => void;
}>({ count: 0, branchFilter: "all", setBranchFilter: () => {}, reset: () => {} });

export function useUnseenOrders() {
  return useContext(UnseenOrdersContext);
}

export function UnseenOrdersProvider({
  children,
  initialSoundEnabled,
  tableBranches,
}: {
  children: React.ReactNode;
  initialSoundEnabled: boolean;
  tableBranches: { tableId: string; branchName: string }[];
}) {
  const pathname = usePathname();
  const [count, setCount] = useState(0);
  const [branchFilter, setBranchFilterState] = useState("all");
  const pathnameRef = useRef(pathname);
  const branchFilterRef = useRef(branchFilter);
  const soundEnabledRef = useRef(initialSoundEnabled);
  const cursorRef = useRef(new Date().toISOString());
  const sessionStartedAtRef = useRef(new Date().toISOString());
  const handledIdsRef = useRef(new Set<string>());
  const tableBranchesRef = useRef(new Map(tableBranches.map((table) => [table.tableId, table.branchName])));

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  const reset = useCallback(() => {
    const now = new Date().toISOString();
    cursorRef.current = now;
    window.localStorage.setItem(LAST_SEEN_KEY, now);
    handledIdsRef.current.clear();
    setCount(0);
  }, []);

  const setBranchFilter = useCallback((branch: string) => {
    branchFilterRef.current = branch;
    setBranchFilterState(branch);
    setCount(0);
  }, []);

  useEffect(() => {
    const handleSettingChange = (event: Event) => {
      soundEnabledRef.current = Boolean((event as CustomEvent<boolean>).detail);
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "staff_sound_alerts") {
        soundEnabledRef.current = event.newValue === "true";
      }
    };

    window.addEventListener("staff-sound-alerts-changed", handleSettingChange);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("staff-sound-alerts-changed", handleSettingChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    const supabase = createClient();

    const storedLastSeen = window.localStorage.getItem(LAST_SEEN_KEY);
    if (storedLastSeen && !Number.isNaN(new Date(storedLastSeen).getTime())) {
      cursorRef.current = storedLastSeen;
    }

    const registerOrder = (order: OrderAlert) => {
      const branchName = order.branchName ?? tableBranchesRef.current.get(order.tableId);
      if (branchFilterRef.current !== "all" && branchName !== branchFilterRef.current) return false;
      if (handledIdsRef.current.has(order.id)) return false;

      handledIdsRef.current.add(order.id);
      if (!pathnameRef.current.startsWith("/admin/orders")) {
        setCount((current) => current + 1);
      }
      return true;
    };

    const channel = supabase
      .channel("admin-order-alerts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "Order" },
        (payload) => {
          const order = payload.new as OrderAlert & { status?: string };
          if (order.status === "submitted" && registerOrder(order) && soundEnabledRef.current) {
            void playOrderAlertSound();
          }
        },
      )
      .subscribe();

    let polling = false;
    const poll = async () => {
      if (polling) return;
      polling = true;
      try {
        const orders = await getNewOrderAlerts(cursorRef.current);
        let hasNewSessionOrder = false;
        for (const order of orders) {
          if (registerOrder(order) && order.submittedAt >= sessionStartedAtRef.current) {
            hasNewSessionOrder = true;
          }
        }
        if (hasNewSessionOrder && soundEnabledRef.current) {
          void playOrderAlertSound();
        }
        const newest = orders.at(-1)?.submittedAt;
        if (newest) cursorRef.current = newest;
      } catch (error) {
        console.warn("Order alert polling failed:", error);
      } finally {
        polling = false;
      }
    };

    // Realtime should handle this immediately; this three-second fallback covers
    // slow or disconnected websocket subscriptions without duplicate alerts.
    const interval = window.setInterval(poll, 3000);
    void poll();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void poll();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
      void supabase.removeChannel(channel);
    };
  }, []);

  return (
    <UnseenOrdersContext.Provider value={{ count, branchFilter, setBranchFilter, reset }}>
      {children}
    </UnseenOrdersContext.Provider>
  );
}
