"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Check, Trash2, Clock, CheckCircle2 } from "lucide-react";
import { approveReview, deleteReview } from "@/lib/actions";

type Review = {
  id: number;
  name: string;
  rating: number;
  text: string;
  approved: boolean;
  createdAt: string;
  branch: { id: number; number: string; nameAr: string; nameEn: string } | null;
};

type Tab = "all" | "pending" | "approved";

export function ReviewsClient({
  reviews,
  pendingCount,
  approvedCount,
}: {
  reviews: Review[];
  pendingCount: number;
  approvedCount: number;
}) {
  const [tab, setTab] = useState<Tab>("all");
  const [pending, startTransition] = useTransition();

  const filtered =
    tab === "pending"
      ? reviews.filter((r) => !r.approved)
      : tab === "approved"
        ? reviews.filter((r) => r.approved)
        : reviews;

  function handleApprove(id: number) {
    startTransition(async () => {
      await approveReview(id);
    });
  }

  function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this review?")) return;
    startTransition(async () => {
      await deleteReview(id);
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-paper">Reviews</h1>
        <p className="text-sm text-paper/50">Manage customer reviews</p>
      </div>

      <div className="flex gap-3">
        <div className="rounded-xl border border-ink-800 bg-ink-950 px-4 py-3">
          <p className="text-xs text-paper/40">Pending</p>
          <p className="text-2xl font-bold text-saffron-400">{pendingCount}</p>
        </div>
        <div className="rounded-xl border border-ink-800 bg-ink-950 px-4 py-3">
          <p className="text-xs text-paper/40">Approved</p>
          <p className="text-2xl font-bold text-cobalt-500">{approvedCount}</p>
        </div>
      </div>

      <div className="flex gap-1 rounded-lg border border-ink-800 bg-ink-950 p-1 w-fit">
        {(["all", "pending", "approved"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
              tab === t
                ? "bg-cobalt-500 text-paper"
                : "text-paper/50 hover:bg-ink-800"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-paper/40 py-8 text-center"
            >
              No reviews found.
            </motion.p>
          ) : (
            filtered.map((review) => (
              <motion.div
                key={review.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="rounded-xl border border-ink-800 bg-ink-950 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-paper">{review.name}</span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "fill-saffron-400 text-saffron-400"
                                : "text-ink-700"
                            }`}
                          />
                        ))}
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          review.approved
                            ? "bg-cobalt-500/15 text-cobalt-500"
                            : "bg-saffron-400/15 text-saffron-400"
                        }`}
                      >
                        {review.approved ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" /> Approved
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3" /> Pending
                          </>
                        )}
                      </span>
                    </div>

                    <p className="text-sm text-paper/70 mb-2">{review.text}</p>

                    <div className="flex items-center gap-3 text-xs text-paper/40">
                      {review.branch && (
                        <span>
                          {review.branch.nameEn} (#{review.branch.number})
                        </span>
                      )}
                      <span>
                        {new Date(review.createdAt).toLocaleDateString("en-GB")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!review.approved && (
                      <button
                        onClick={() => handleApprove(review.id)}
                        disabled={pending}
                        className="flex items-center gap-1.5 rounded-lg bg-cobalt-500/15 px-3 py-1.5 text-xs font-semibold text-cobalt-500 transition-colors hover:bg-cobalt-500/25 disabled:opacity-50"
                      >
                        <Check className="h-3.5 w-3.5" /> Approve
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(review.id)}
                      disabled={pending}
                      className="flex items-center gap-1.5 rounded-lg bg-tomato-500/15 px-3 py-1.5 text-xs font-semibold text-tomato-500 transition-colors hover:bg-tomato-500/25 disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
