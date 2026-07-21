"use client";

import { useState, useTransition, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Eye,
  EyeOff,
  Loader2,
  UtensilsCrossed,
} from "lucide-react";
import {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuItemAvailability,
} from "@/lib/actions";

type MenuItem = {
  id: number;
  categoryId: number;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  price: number | null;
  sizes: unknown;
  image: string;
  badge: string | null;
  available: boolean;
};

type Category = {
  id: number;
  nameAr: string;
  nameEn: string;
  order: number;
  image: string;
  items: MenuItem[];
};

interface Props {
  categories: Category[];
}

const emptyForm = {
  categoryId: 0,
  nameAr: "",
  nameEn: "",
  descAr: "",
  descEn: "",
  price: "",
  badge: "",
  image: "",
};

export function MenuManagementClient({ categories }: Props) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<number | "all">("all");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  const allItems = useMemo(
    () => categories.flatMap((c) => c.items.map((i) => ({ ...i, categoryNameAr: c.nameAr, categoryNameEn: c.nameEn }))),
    [categories],
  );

  const filtered = useMemo(() => {
    let items = allItems;
    if (activeCategory !== "all") {
      items = items.filter((i) => i.categoryId === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (i) =>
          i.nameAr.includes(q) ||
          i.nameEn.toLowerCase().includes(q) ||
          i.descAr.includes(q),
      );
    }
    return items;
  }, [allItems, activeCategory, search]);

  function openCreate() {
    setEditingId(null);
    setForm({ ...emptyForm, categoryId: categories[0]?.id ?? 0 });
    setShowModal(true);
  }

  function openEdit(item: MenuItem) {
    setEditingId(item.id);
    setForm({
      categoryId: item.categoryId,
      nameAr: item.nameAr,
      nameEn: item.nameEn,
      descAr: item.descAr,
      descEn: item.descEn,
      price: item.price?.toString() ?? "",
      badge: item.badge ?? "",
      image: item.image,
    });
    setShowModal(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const payload = {
        categoryId: form.categoryId,
        nameAr: form.nameAr,
        nameEn: form.nameEn,
        descAr: form.descAr,
        descEn: form.descEn,
        price: form.price ? parseInt(form.price, 10) : undefined,
        badge: form.badge || undefined,
        image: form.image || `https://placehold.co/400x300/0A1124/FBF5EC?text=${encodeURIComponent(form.nameEn || "Item")}`,
      };

      if (editingId) {
        await updateMenuItem(editingId, payload);
      } else {
        await createMenuItem({ ...payload, image: payload.image });
      }
      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);
    });
  }

  function handleDelete(id: number) {
    setDeleting(id);
  }

  function confirmDelete(id: number) {
    startTransition(async () => {
      await deleteMenuItem(id);
      setDeleting(null);
    });
  }

  function handleToggle(id: number) {
    startTransition(async () => {
      await toggleMenuItemAvailability(id);
    });
  }

  return (
    <div className="min-h-full">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-ink-950">
              Menu Management
            </h1>
            <p className="mt-1 text-sm text-ink-700">
              {allItems.length} items across {categories.length} categories
            </p>
          </div>
          <button onClick={openCreate} className="btn-primary">
            <Plus size={18} /> Add Item
          </button>
        </div>

        {/* Search + Filters */}
        <div className="mt-6 flex flex-col gap-4">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-700"
            />
            <input
              type="text"
              placeholder="Search menu items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-ink-800/10 bg-white py-2.5 pl-10 pr-4 text-sm text-ink-950 placeholder:text-ink-700/50 focus:border-cobalt-500 focus:outline-none focus:ring-2 focus:ring-cobalt-500/20"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory("all")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                activeCategory === "all"
                  ? "bg-cobalt-600 text-white"
                  : "bg-ink-800/5 text-ink-700 hover:bg-ink-800/10"
              }`}
            >
              All ({allItems.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                  activeCategory === cat.id
                    ? "bg-cobalt-600 text-white"
                    : "bg-ink-800/5 text-ink-700 hover:bg-ink-800/10"
                }`}
              >
                {cat.nameEn} ({cat.items.length})
              </button>
            ))}
          </div>
        </div>

        {/* Items Table */}
        <div className="mt-6 overflow-hidden rounded-xl border border-ink-800/10 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink-800/10 bg-ink-800/5">
                <th className="px-4 py-3 font-bold text-ink-950">Item</th>
                <th className="px-4 py-3 font-bold text-ink-950 hidden md:table-cell">
                  Category
                </th>
                <th className="px-4 py-3 font-bold text-ink-950">Price</th>
                <th className="px-4 py-3 font-bold text-ink-950 hidden sm:table-cell">
                  Status
                </th>
                <th className="px-4 py-3 font-bold text-ink-950 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-800/10">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-ink-700"
                  >
                    No menu items found.
                  </td>
                </tr>
              ) : (
                filtered.map((item, i) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="group hover:bg-paper-warm/50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-ink-800/5">
                          {item.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.image}
                              alt={item.nameEn}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <UtensilsCrossed size={16} className="text-ink-700" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-ink-950 truncate">
                            {item.nameAr}
                          </p>
                          <p className="text-xs text-ink-700 truncate">
                            {item.nameEn}
                          </p>
                        </div>
                        {item.badge && (
                          <span className="ml-2 hidden rounded-full bg-tomato-50 px-2 py-0.5 text-xs font-bold text-tomato-600 sm:inline-block">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="rounded-full bg-cobalt-50 px-2 py-0.5 text-xs font-bold text-cobalt-600">
                        {item.categoryNameEn}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-ink-950">
                      {item.price ? `EGP ${item.price}` : "—"}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <button
                        onClick={() => handleToggle(item.id)}
                        disabled={pending}
                        className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold transition-colors ${
                          item.available
                            ? "bg-green-50 text-green-600 hover:bg-green-100"
                            : "bg-ink-800/5 text-ink-700 hover:bg-ink-800/10"
                        }`}
                      >
                        {item.available ? (
                          <Eye size={12} />
                        ) : (
                          <EyeOff size={12} />
                        )}
                        {item.available ? "Active" : "Hidden"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => openEdit(item)}
                          className="rounded-lg p-1.5 text-cobalt-600 hover:bg-cobalt-50"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="rounded-lg p-1.5 text-tomato-500 hover:bg-tomato-50"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Delete Confirmation */}
        <AnimatePresence>
          {deleting !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="mx-4 w-full max-w-sm rounded-xl border border-ink-800/10 bg-white p-6 shadow-xl"
              >
                <h3 className="text-lg font-bold text-ink-950">
                  Delete item?
                </h3>
                <p className="mt-2 text-sm text-ink-700">
                  This action cannot be undone. The item will be permanently
                  removed from the menu.
                </p>
                <div className="mt-6 flex justify-end gap-2">
                  <button
                    onClick={() => setDeleting(null)}
                    className="btn-ghost"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => confirmDelete(deleting)}
                    disabled={pending}
                    className="btn-primary bg-tomato-600 hover:bg-tomato-500"
                  >
                    {pending ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create / Edit Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="mx-4 w-full max-w-lg rounded-xl border border-ink-800/10 bg-white p-6 shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-ink-950">
                    {editingId ? "Edit Item" : "Add New Item"}
                  </h3>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEditingId(null);
                    }}
                    className="rounded-lg p-1.5 text-ink-700 hover:bg-ink-800/5"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-ink-950">
                      Category
                    </label>
                    <select
                      value={form.categoryId}
                      onChange={(e) =>
                        setForm({ ...form, categoryId: Number(e.target.value) })
                      }
                      className="w-full rounded-lg border border-ink-800/10 bg-white px-3 py-2 text-sm text-ink-950 focus:border-cobalt-500 focus:outline-none focus:ring-2 focus:ring-cobalt-500/20"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nameEn} — {c.nameAr}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-xs font-bold text-ink-950">
                        Name (Arabic)
                      </label>
                      <input
                        required
                        type="text"
                        value={form.nameAr}
                        onChange={(e) =>
                          setForm({ ...form, nameAr: e.target.value })
                        }
                        className="w-full rounded-lg border border-ink-800/10 bg-white px-3 py-2 text-sm text-ink-950 focus:border-cobalt-500 focus:outline-none focus:ring-2 focus:ring-cobalt-500/20"
                        dir="rtl"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-ink-950">
                        Name (English)
                      </label>
                      <input
                        required
                        type="text"
                        value={form.nameEn}
                        onChange={(e) =>
                          setForm({ ...form, nameEn: e.target.value })
                        }
                        className="w-full rounded-lg border border-ink-800/10 bg-white px-3 py-2 text-sm text-ink-950 focus:border-cobalt-500 focus:outline-none focus:ring-2 focus:ring-cobalt-500/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-xs font-bold text-ink-950">
                        Description (Arabic)
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={form.descAr}
                        onChange={(e) =>
                          setForm({ ...form, descAr: e.target.value })
                        }
                        className="w-full rounded-lg border border-ink-800/10 bg-white px-3 py-2 text-sm text-ink-950 focus:border-cobalt-500 focus:outline-none focus:ring-2 focus:ring-cobalt-500/20"
                        dir="rtl"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-ink-950">
                        Description (English)
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={form.descEn}
                        onChange={(e) =>
                          setForm({ ...form, descEn: e.target.value })
                        }
                        className="w-full rounded-lg border border-ink-800/10 bg-white px-3 py-2 text-sm text-ink-950 focus:border-cobalt-500 focus:outline-none focus:ring-2 focus:ring-cobalt-500/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-xs font-bold text-ink-950">
                        Price (EGP)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={form.price}
                        onChange={(e) =>
                          setForm({ ...form, price: e.target.value })
                        }
                        className="w-full rounded-lg border border-ink-800/10 bg-white px-3 py-2 text-sm text-ink-950 focus:border-cobalt-500 focus:outline-none focus:ring-2 focus:ring-cobalt-500/20"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-ink-950">
                        Badge
                      </label>
                      <input
                        type="text"
                        value={form.badge}
                        onChange={(e) =>
                          setForm({ ...form, badge: e.target.value })
                        }
                        placeholder="e.g. Most popular"
                        className="w-full rounded-lg border border-ink-800/10 bg-white px-3 py-2 text-sm text-ink-950 placeholder:text-ink-700/50 focus:border-cobalt-500 focus:outline-none focus:ring-2 focus:ring-cobalt-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-ink-950">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={form.image}
                      onChange={(e) =>
                        setForm({ ...form, image: e.target.value })
                      }
                      placeholder="https://..."
                      className="w-full rounded-lg border border-ink-800/10 bg-white px-3 py-2 text-sm text-ink-950 placeholder:text-ink-700/50 focus:border-cobalt-500 focus:outline-none focus:ring-2 focus:ring-cobalt-500/20"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditingId(null);
                      }}
                      className="btn-ghost"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={pending}
                      className="btn-primary"
                    >
                      {pending ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : null}
                      {editingId ? "Save Changes" : "Add Item"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
