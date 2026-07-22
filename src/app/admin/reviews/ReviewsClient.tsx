"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Check, Trash2, Clock, CheckCircle2 } from "lucide-react";
import { approveReview, deleteReview } from "@/lib/actions";
import { useAdminI18n } from "@/lib/admin-i18n";

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
  const { lang, t } = useAdminI18n();

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
    <div className="min-h-full" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900">{t("reviewsTitle")}</h1>
          <p className="text-sm text-gray-500 mt-1">{t("manageReviews")}</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="rounded-2xl border border-gray-200 bg-white px-8 py-5 shadow-sm">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{t("approved")}</p>
            <p className="text-4xl font-extrabold text-emerald-600 mt-1">{approvedCount}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white px-8 py-5 shadow-sm">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{t("pending")}</p>
            <p className="text-4xl font-extrabold text-amber-600 mt-1">{pendingCount}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1 w-fit mb-6">
          {(["all", "pending", "approved"] as Tab[]).map((tabValue) => (
            <button
              key={tabValue}
              onClick={() => setTab(tabValue)}
              className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-all ${
                tab === tabValue
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t(tabValue)}
            </button>
          ))}
        </div>

        {/* Reviews List */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl border border-dashed border-gray-300 py-16 text-center"
              >
                <Star size={32} className="mx-auto text-gray-200 mb-3" />
                <p className="text-sm text-gray-400 font-medium">{t("noReviews")}</p>
              </motion.div>
            ) : (
              filtered.map((review) => (
                <motion.div
                  key={review.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-gray-900">{review.name}</span>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            review.approved
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {review.approved ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" /> {t("approved")}
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3" /> {t("pending")}
                            </>
                          )}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-3 leading-relaxed">{review.text}</p>

                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        {review.branch && (
                          <span className="bg-gray-50 rounded-lg px-2 py-1">
                            {lang === "ar" ? review.branch.nameAr : review.branch.nameEn} (#{review.branch.number})
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
                          className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-600 transition-colors hover:bg-emerald-100 disabled:opacity-50"
                        >
                           <Check className="h-3.5 w-3.5" /> {t("approve")}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(review.id)}
                        disabled={pending}
                        className="flex items-center gap-1.5 rounded-xl bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
                      >
                         <Trash2 className="h-3.5 w-3.5" /> {t("delete")}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
