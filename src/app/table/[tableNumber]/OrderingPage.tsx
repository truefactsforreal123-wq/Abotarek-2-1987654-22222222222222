"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  X,
  ChevronRight,
  Check,
  ArrowLeft,
  ChefHat,
  PackageCheck,
  UtensilsCrossed,
} from "lucide-react";

interface LocaleLabel {
  ar: string;
  en: string;
}

interface Size {
  label: LocaleLabel;
  price: number;
}

interface MenuItemType {
  id: number;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  price: number | null;
  sizes: Size[] | null;
  image: string;
  badge: string | null;
}

interface CategoryType {
  id: number;
  nameAr: string;
  nameEn: string;
  items: MenuItemType[];
}

interface TableInfo {
  id: string;
  tableNumber: number;
  branchNameAr: string;
  branchNameEn: string;
  qrToken: string;
}

interface CartItem {
  menuItemId: number;
  nameAr: string;
  nameEn: string;
  quantity: number;
  selectedSize?: Size;
  image: string;
  notes?: string;
  presets?: string[];
  unitPrice: number;
}

type Screen = "menu" | "review" | "success";

type QRLang = "ar" | "en";

const qr = {
  ar: {
    table: "طاولة",
    reviewOrder: "مراجعة الطلب",
    total: "الإجمالي",
    submitting: "جارٍ الإرسال...",
    confirmOrder: "تأكيد الطلب",
    noChanges: "بعد الإرسال لا يمكن تعديل الطلب.",
    add: "أضف",
    from: "من",
    currency: "ج.م",
    popular: "الأكثر طلبًا",
    viewCart: "عرض السلة",
    cart: "السلة",
    cartEmpty: "سلتك فاضية",
    editNotes: "تعديل ملاحظات",
    addNotes: "+ إضافة ملاحظات",
    remove: "حذف",
    cancel: "إلغاء",
    quickOptions: "خيارات سريعة",
    customNote: "ملاحظة خاصة",
    done: "تم",
    addNotesFor: "إضافة ملاحظات",
    orderSubmitted: "تم استلام الطلب!",
    itemsWord: "صنف",
    staffComing: "الموظف هييجي لك بالطلب قريبًا. شكرًا!",
    orderReceived: "تم استلام الطلب",
    preparing: "قيد التحضير",
    ready: "جاهز",
    served: "تم التسليم",
    stageSubmitted: "طلبك اتسلم والمطبخ هيبدأ تحضيره قريبًا.",
    stagePreparing: "الشيف بيحضّر أكلك دلوقتي.",
    stageReady: "أكلك جاهز! الموظف هيجيبه لك على الطاولة.",
    stageServed: "بالهنا والشفا!",
    networkError: "مشكلة في الشبكة. حاول تاني.",
    invalidQR: "QR غير صالح",
    invalidQRDesc: "كود الـ QR ده مش شغّال. اسأل الموظف عن كود جديد.",
    presets: ["بدون بصل", "حراق زيادة", "مستوي كويس", "ملح قليل", "بدون توم"],
  },
  en: {
    table: "Table",
    reviewOrder: "Review Your Order",
    total: "Total",
    submitting: "Submitting...",
    confirmOrder: "Confirm Order",
    noChanges: "Once submitted, this order cannot be changed.",
    add: "Add",
    from: "from",
    currency: "LE",
    popular: "Popular",
    viewCart: "View Cart",
    cart: "Cart",
    cartEmpty: "Your cart is empty",
    editNotes: "Edit notes",
    addNotes: "+ Add notes",
    remove: "Remove",
    cancel: "Cancel",
    quickOptions: "Quick options",
    customNote: "Custom note",
    done: "Done",
    addNotesFor: "Add Notes",
    orderSubmitted: "Order Submitted!",
    itemsWord: "items",
    staffComing: "Staff will bring your food shortly. Thank you!",
    orderReceived: "Order Received",
    preparing: "Preparing",
    ready: "Ready",
    served: "Served",
    stageSubmitted: "Your order has been received. The kitchen will start preparing it soon.",
    stagePreparing: "The chef is preparing your food now.",
    stageReady: "Your food is ready! Staff will bring it to your table.",
    stageServed: "Enjoy your meal!",
    networkError: "Network error. Please try again.",
    invalidQR: "Invalid QR link",
    invalidQRDesc: "This QR code is missing a valid token.",
    presets: ["No onions", "Extra spicy", "Well done", "Less salt", "No garlic"],
  },
} as const;

const COMMON_PRESETS_EN = qr.en.presets;
const COMMON_PRESETS_AR = qr.ar.presets;

export function OrderingPage({
  table,
  categories,
  popularItemIds,
  liveTrackingEnabled,
}: {
  table: TableInfo;
  categories: CategoryType[];
  popularItemIds: number[];
  liveTrackingEnabled: boolean;
}) {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id ?? 0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [screen, setScreen] = useState<Screen>("menu");
  const [submitting, setSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<{
    orderId: string;
    total: number;
    items: unknown[];
    submittedAt: string;
  } | null>(null);
  const [orderStatus, setOrderStatus] = useState<string>("submitted");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [sizePicker, setSizePicker] = useState<MenuItemType | null>(null);
  const [noteItem, setNoteItem] = useState<CartItem | null>(null);
  const [tempNote, setTempNote] = useState("");
  const [tempPresets, setTempPresets] = useState<string[]>([]);
  const cartLoadedRef = useRef(false);
  const [lang, setLang] = useState<QRLang>(() => {
    if (typeof window === "undefined") return "en";
    return (localStorage.getItem("qr-lang") as QRLang) || "en";
  });
  const t = qr[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    localStorage.setItem("qr-lang", lang);
  }, [lang]);

  const storageKey = `qr-cart-${table.id}`;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) setCart(JSON.parse(saved));
      } catch {
        localStorage.removeItem(storageKey);
      } finally {
        cartLoadedRef.current = true;
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [storageKey]);

  useEffect(() => {
    if (!cartLoadedRef.current) return;
    localStorage.setItem(storageKey, JSON.stringify(cart));
  }, [cart, storageKey]);

  const addToCart = useCallback(
    (item: MenuItemType, size?: Size) => {
      setCart((prev) => {
        const existing = prev.findIndex(
          (c) =>
            c.menuItemId === item.id &&
            c.selectedSize?.label?.en === (size?.label?.en ?? undefined)
        );
        if (existing >= 0) {
          const next = [...prev];
          next[existing] = { ...next[existing], quantity: next[existing].quantity + 1 };
          return next;
        }
        const unitPrice = size ? size.price : item.price ?? 0;
        return [
          ...prev,
          {
            menuItemId: item.id,
            nameAr: item.nameAr,
            nameEn: item.nameEn,
            quantity: 1,
            selectedSize: size,
            image: item.image,
            unitPrice,
          },
        ];
      });
    },
    []
  );

  function updateQuantity(menuItemId: number, sizeLabelEn?: string, delta?: number) {
    setCart((prev) =>
      prev
        .map((c) => {
          if (
            c.menuItemId === menuItemId &&
            c.selectedSize?.label?.en === (sizeLabelEn ?? undefined)
          ) {
            const qty = delta !== undefined ? c.quantity + delta : 1;
            return { ...c, quantity: Math.max(1, qty) };
          }
          return c;
        })
    );
  }

  function removeFromCart(menuItemId: number, sizeLabelEn?: string) {
    setCart((prev) =>
      prev.filter(
        (c) =>
          !(
            c.menuItemId === menuItemId &&
            c.selectedSize?.label?.en === (sizeLabelEn ?? undefined)
          )
      )
    );
  }

  function updateNotes(menuItemId: number, sizeLabelEn?: string) {
    setCart((prev) =>
      prev.map((c) => {
        if (
          c.menuItemId === menuItemId &&
          c.selectedSize?.label?.en === (sizeLabelEn ?? undefined)
        ) {
          return { ...c, notes: tempNote || undefined, presets: tempPresets.length ? tempPresets : undefined };
        }
        return c;
      })
    );
    setNoteItem(null);
    setTempNote("");
    setTempPresets([]);
  }

  const cartTotal = cart.reduce((s, c) => s + c.unitPrice * c.quantity, 0);
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  async function handleSubmit() {
    if (cart.length === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          tableId: table.id,
          token: table.qrToken,
          items: cart.map((c) => ({
            menuItemId: c.menuItemId,
            quantity: c.quantity,
            selectedSize: c.selectedSize,
            notes: c.notes,
            presets: c.presets,
          })),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to submit order");
        return;
      }
      const data = await res.json();
      setOrderResult(data);
      setScreen("success");
      setCart([]);
      localStorage.removeItem(storageKey);
    } catch {
      alert(t.networkError);
    } finally {
      setSubmitting(false);
    }
  }

  const allCategories = categories.filter((c) => c.items.length > 0);
  const currentCat = allCategories.find((c) => c.id === activeCategory) ?? allCategories[0];

  if (screen === "success" && orderResult) {
    return (
      <SuccessScreen
        orderResult={orderResult}
        liveTrackingEnabled={liveTrackingEnabled}
        orderStatus={orderStatus}
        setOrderStatus={setOrderStatus}
        pollRef={pollRef}
        lang={lang}
        tableToken={table.qrToken}
      />
    );
  }

  if (screen === "review") {
    return (
      <div className="min-h-screen bg-[#f5ead8]">
        <div className="sticky top-0 z-10 bg-[#f5ead8] border-b border-ink-950/10 px-4 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setScreen("menu")} className="p-2 -ml-2">
              <ArrowLeft size={20} className="text-ink-950" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-black text-ink-950">{t.reviewOrder}</h1>
              <p className="text-xs text-ink-700">{t.table} {table.tableNumber}</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3 max-w-lg mx-auto">
          {cart.map((item) => {
            const key = `${item.menuItemId}-${item.selectedSize?.label?.en ?? "single"}`;
            return (
              <div key={key} className="rounded-xl border border-ink-950/8 bg-cream p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-black text-ink-950">{lang === "ar" ? item.nameAr : item.nameEn}</h3>
                    {item.selectedSize && (
                      <span className="text-xs text-ink-700">{lang === "ar" ? item.selectedSize.label.ar : item.selectedSize.label.en}</span>
                    )}
                    {item.presets && item.presets.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {item.presets.map((p) => (
                          <span key={p} className="rounded-md bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                            {p}
                          </span>
                        ))}
                      </div>
                    )}
                    {item.notes && (
                      <p className="mt-1 text-xs text-ink-700 italic">&quot;{item.notes}&quot;</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-brand-600">
                      {item.unitPrice * item.quantity} {t.currency}
                    </span>
                    <p className="text-xs text-ink-700">x{item.quantity}</p>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="rounded-xl border-2 border-brand-500/30 bg-brand-500/5 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-ink-950">{t.total}</span>
              <span className="text-xl font-black text-brand-600">{cartTotal} {t.currency}</span>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="brand-button w-full text-base justify-center"
          >
            {submitting ? t.submitting : `${t.confirmOrder} — ${cartTotal} ${t.currency}`}
          </button>

          <p className="text-center text-xs text-ink-700 px-4">
            {t.noChanges}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5ead8] pb-24">
      <div className="sticky top-0 z-10 border-b border-ink-950/10 bg-[#f5ead8]/90 px-3 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur sm:px-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-sm font-black text-ink-950">
              {t.table} {table.tableNumber}
            </h1>
            <p className="text-xs text-ink-700">{lang === "ar" ? table.branchNameAr : table.branchNameEn}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              className="min-h-11 min-w-11 rounded-lg border border-ink-950/10 bg-white px-2 text-xs font-black text-ink-700"
            >
              {lang === "ar" ? "EN" : "ع"}
            </button>
          <button
            onClick={() => setCartOpen(true)}
            className="relative flex min-h-11 items-center gap-2 rounded-full bg-brand-500 px-4 py-2 text-sm font-black text-cream shadow-md"
          >
            <ShoppingBag size={16} />
            {cartCount > 0 && (
              <motion.span
                key={cartCount}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gold-400 text-[10px] font-black text-ink-950 flex items-center justify-center"
              >
                {cartCount}
              </motion.span>
            )}
          </button>
          </div>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-ink-950/10 px-2 py-2 scrollbar-none" style={{ scrollbarWidth: "none" }}>
        {allCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`shrink-0 rounded-lg px-4 py-2 text-xs font-bold transition-colors ${
              activeCategory === cat.id
                ? "bg-brand-500 text-cream"
                : "bg-ink-950/5 text-ink-700 hover:bg-ink-950/10"
            }`}
          >
            {lang === "ar" ? cat.nameAr : cat.nameEn}
          </button>
        ))}
      </div>

      <div className="p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {currentCat && (
              <div className="space-y-3">
                {currentCat.items.map((item, index) => {
                  const hasSizes = item.sizes && item.sizes.length > 0;
                  const isPopular = popularItemIds.includes(item.id);
                  const displayPrice = hasSizes ? item.sizes![0].price : item.price ?? 0;
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="rounded-xl border border-ink-950/8 bg-cream p-3"
                    >
                      <div className="flex gap-3">
                        <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-ink-950/5">
                          <Image
                            src={item.image}
                            alt={item.nameEn}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-black text-ink-950">{lang === "ar" ? item.nameAr : item.nameEn}</h3>
                          <p className="text-xs text-ink-700 line-clamp-2">{lang === "ar" ? item.descAr : item.descEn}</p>
                          {isPopular && (
                            <span className="mt-1 inline-block rounded-md bg-gold-200 px-2 py-0.5 text-[10px] font-black text-ink-950">
                              {t.popular}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => hasSizes ? setSizePicker(item) : addToCart(item)}
                          className="brand-button text-xs min-h-8 px-3 py-1.5"
                        >
                          {t.add}
                        </motion.button>
                        <span className="text-sm font-black text-brand-600">
                          {hasSizes && item.sizes!.length > 1
                            ? `${t.from} ${displayPrice}`
                            : displayPrice}{" "}
                          {t.currency}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-3 right-3 z-20 sm:left-4 sm:right-4"
            style={{ bottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
          >
            <button
              onClick={() => setScreen("review")}
              className="brand-button w-full text-base justify-center shadow-lg shadow-brand-500/30"
            >
              {t.viewCart} ({cartCount}) — {cartTotal} {t.currency}
              <ChevronRight size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cartOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/50"
            onClick={() => setCartOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
               className="absolute bottom-0 right-0 top-0 flex w-full max-w-sm flex-col bg-ink-950 pb-[env(safe-area-inset-bottom)] shadow-2xl"
              dir="ltr"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
                <h2 className="text-sm font-black text-cream">
                  {t.cart} ({cartCount})
                </h2>
                <button onClick={() => setCartOpen(false)} className="p-1 text-cream/45 hover:text-cream">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.length === 0 && (
                  <p className="text-center text-sm text-cream/35 py-12">{t.cartEmpty}</p>
                )}
                {cart.map((item) => {
                  const key = `${item.menuItemId}-${item.selectedSize?.label?.en ?? "single"}`;
                  return (
                    <div key={key} className="rounded-xl border border-white/8 bg-ink-900 p-3">
                      <div className="flex items-start gap-3">
                        <div className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden">
                          <Image src={item.image} alt={item.nameEn} fill sizes="48px" className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-cream">{lang === "ar" ? item.nameAr : item.nameEn}</h4>
                          {item.selectedSize && (
                            <span className="text-[10px] text-cream/45">{lang === "ar" ? item.selectedSize.label.ar : item.selectedSize.label.en}</span>
                          )}
                          {item.presets && item.presets.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {item.presets.map((p) => (
                                <span key={p} className="rounded bg-brand-500/20 px-1.5 py-0.5 text-[9px] font-bold text-brand-300">
                                  {p}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="mt-1 flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.menuItemId, item.selectedSize?.label?.en, -1)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-cream hover:bg-white/20"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-xs font-bold text-cream w-5 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.menuItemId, item.selectedSize?.label?.en, 1)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-cream hover:bg-white/20"
                            >
                              <Plus size={12} />
                            </button>
                            <span className="ml-auto text-xs font-bold text-gold-300">
                              {item.unitPrice * item.quantity} {t.currency}
                            </span>
                          </div>
                          <div className="mt-2 flex gap-2">
                            <button
                              onClick={() => {
                                setNoteItem(item);
                                setTempNote(item.notes ?? "");
                                setTempPresets(item.presets ?? []);
                                setCartOpen(false);
                              }}
                              className="text-[10px] font-bold text-cream/45 hover:text-cream"
                            >
                              {item.notes || item.presets?.length ? t.editNotes : t.addNotes}
                            </button>
                            <button
                              onClick={() => removeFromCart(item.menuItemId, item.selectedSize?.label?.en)}
                              className="text-[10px] font-bold text-red-400 hover:text-red-300"
                            >
                              <Trash2 size={12} className="inline mr-1" />
                              {t.remove}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {cart.length > 0 && (
                <div className="border-t border-white/10 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-black text-cream">{t.total}</span>
                    <span className="text-lg font-black text-gold-300">{cartTotal} {t.currency}</span>
                  </div>
                  <button
                    onClick={() => {
                      setCartOpen(false);
                      setScreen("review");
                    }}
                    className="brand-button w-full justify-center text-sm"
                  >
                    {t.reviewOrder}
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sizePicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 flex items-end sm:items-center justify-center p-4"
            onClick={() => setSizePicker(null)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-t-2xl bg-ink-950 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:rounded-2xl sm:p-6"
            >
              <h3 className="text-sm font-black text-cream">{lang === "ar" ? sizePicker.nameAr : sizePicker.nameEn}</h3>
              <p className="mt-1 text-xs text-cream/45">{lang === "ar" ? sizePicker.descAr : sizePicker.descEn}</p>
              <div className="mt-4 space-y-2">
                {sizePicker.sizes?.map((size) => (
                  <button
                    key={size.label.en}
                    onClick={() => {
                      addToCart(sizePicker, size);
                      setSizePicker(null);
                    }}
                    className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-ink-900 px-4 py-3 text-sm font-bold text-cream hover:border-gold-500/30 hover:bg-ink-800 transition-colors"
                  >
                    <span>{lang === "ar" ? size.label.ar : size.label.en}</span>
                    <span className="text-gold-300">{size.price} {t.currency}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setSizePicker(null)}
                className="mt-3 w-full rounded-xl bg-white/5 py-3 text-xs font-bold text-cream/45 hover:text-cream"
              >
                {t.cancel}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {noteItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 flex items-end sm:items-center justify-center p-4"
            onClick={() => {
              updateNotes(noteItem.menuItemId, noteItem.selectedSize?.label?.en);
            }}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-t-2xl bg-ink-950 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:rounded-2xl sm:p-6"
            >
              <h3 className="text-sm font-black text-cream">{t.addNotesFor} — {lang === "ar" ? noteItem.nameAr : noteItem.nameEn}</h3>

              <div className="mt-4">
                <p className="text-xs font-bold text-cream/45 mb-2">{t.quickOptions}</p>
                <div className="flex flex-wrap gap-2">
                  {(lang === "ar" ? COMMON_PRESETS_AR : COMMON_PRESETS_EN).map((preset, idx) => {
                    const storagePreset = COMMON_PRESETS_EN[idx];
                    return (
                      <button
                        key={preset}
                        onClick={() =>
                          setTempPresets((prev) =>
                            prev.includes(storagePreset)
                              ? prev.filter((p) => p !== storagePreset)
                              : [...prev, storagePreset]
                          )
                        }
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                          tempPresets.includes(storagePreset)
                            ? "bg-brand-500 text-cream"
                            : "bg-white/5 text-cream/55 hover:bg-white/10"
                        }`}
                      >
                        {preset}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4">
                <label className="text-xs font-bold text-cream/45">{t.customNote}</label>
                <input
                  type="text"
                  value={tempNote}
                  onChange={(e) => setTempNote(e.target.value)}
                  placeholder='e.g. "no onions, extra spicy"'
                  className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2.5 text-sm text-cream placeholder:text-cream/25"
                />
              </div>

              <button
                onClick={() =>
                  updateNotes(noteItem.menuItemId, noteItem.selectedSize?.label?.en)
                }
                className="mt-4 w-full brand-button justify-center text-sm"
              >
                {t.done}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SuccessScreen({
  orderResult,
  liveTrackingEnabled,
  orderStatus,
  setOrderStatus,
  pollRef,
  lang,
  tableToken,
}: {
  orderResult: { orderId: string; total: number; items: unknown[]; submittedAt: string };
  liveTrackingEnabled: boolean;
  orderStatus: string;
  setOrderStatus: (s: string) => void;
  pollRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>;
  lang: QRLang;
  tableToken: string;
}) {
  const t = qr[lang];
  const STAGES = [
    { key: "submitted", label: t.orderReceived, icon: Check },
    { key: "preparing", label: t.preparing, icon: ChefHat },
    { key: "ready", label: t.ready, icon: PackageCheck },
    { key: "served", label: t.served, icon: UtensilsCrossed },
  ];
  const currentStageIdx = STAGES.findIndex((s) => s.key === orderStatus);

  useEffect(() => {
    if (!liveTrackingEnabled) return;

    async function poll() {
      try {
        const res = await fetch(`/api/orders/${orderResult.orderId}/status?token=${encodeURIComponent(tableToken)}`, {
          credentials: "same-origin",
        });
        if (res.ok) {
          const data = await res.json();
          setOrderStatus(data.status);
          if (data.status === "served") {
            if (pollRef.current) clearInterval(pollRef.current);
          }
        }
      } catch {}
    }

    poll();
    pollRef.current = setInterval(poll, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [liveTrackingEnabled, orderResult.orderId, setOrderStatus, pollRef, tableToken]);

  return (
    <div className="min-h-screen bg-[#f5ead8] flex items-center justify-center p-6">
      <div className="text-center max-w-md w-full">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mx-auto w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mb-6"
        >
          <Check size={32} className="text-white" />
        </motion.div>

        <h1 className="text-2xl font-black text-ink-950">{t.orderSubmitted}</h1>
        <p className="mt-2 text-sm text-ink-700">
          {orderResult.items.length} {t.itemsWord} — {orderResult.total} {t.currency}
        </p>

        {!liveTrackingEnabled && (
          <p className="mt-4 text-sm text-ink-700">
            {t.staffComing}
          </p>
        )}

        {liveTrackingEnabled && (
          <div className="mt-8">
            <div className="flex items-center justify-between px-2">
              {STAGES.map((stage, idx) => {
                const Icon = stage.icon;
                const isActive = idx <= currentStageIdx;
                const isCurrent = idx === currentStageIdx;
                return (
                  <div key={stage.key} className="flex flex-col items-center gap-2 relative">
                    {idx > 0 && (
                      <div
                        className={`absolute top-4 -left-[calc(50%+8px)] w-[calc(100%-16px)] h-0.5 -translate-y-1/2 transition-colors ${
                          isActive ? "bg-brand-500" : "bg-ink-950/15"
                        }`}
                        style={{ left: idx === 1 ? "-50%" : undefined }}
                      />
                    )}
                    <motion.div
                      animate={isCurrent ? { scale: [1, 1.15, 1] } : {}}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        isActive
                          ? "bg-brand-500 text-cream"
                          : "bg-ink-950/10 text-ink-950/30"
                      }`}
                    >
                      <Icon size={14} />
                    </motion.div>
                    <span
                      className={`text-[10px] font-bold ${
                        isActive ? "text-ink-950" : "text-ink-950/30"
                      }`}
                    >
                      {stage.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <motion.p
              key={orderStatus}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 text-sm font-bold text-ink-700"
            >
              {orderStatus === "submitted" && t.stageSubmitted}
              {orderStatus === "preparing" && t.stagePreparing}
              {orderStatus === "ready" && t.stageReady}
              {orderStatus === "served" && t.stageServed}
            </motion.p>
          </div>
        )}
      </div>
    </div>
  );
}
