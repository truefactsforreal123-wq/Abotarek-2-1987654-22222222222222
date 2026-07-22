"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, MapPin, Phone, MessageCircle } from "lucide-react";
import { createBranch, updateBranch, deleteBranch } from "@/lib/actions";

type Branch = {
  id: number;
  number: string;
  nameAr: string;
  nameEn: string;
  addressAr: string;
  addressEn: string;
  phone: string;
  whatsapp: string;
  mapsUrl: string;
};

const emptyForm = {
  number: "",
  nameAr: "",
  nameEn: "",
  addressAr: "",
  addressEn: "",
  phone: "",
  whatsapp: "",
  mapsUrl: "",
};

const fieldClass =
  "w-full rounded-lg border border-ink-700 bg-ink-800 px-3 py-2 text-sm text-paper placeholder:text-paper/30 focus:border-cobalt-500 focus:outline-none";

export function BranchesClient({ branches }: { branches: Branch[] }) {
  const [editing, setEditing] = useState<Branch | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [pending, startTransition] = useTransition();

  function openCreate() {
    setForm(emptyForm);
    setCreating(true);
    setEditing(null);
  }

  function openEdit(branch: Branch) {
    setForm({
      number: branch.number,
      nameAr: branch.nameAr,
      nameEn: branch.nameEn,
      addressAr: branch.addressAr,
      addressEn: branch.addressEn,
      phone: branch.phone,
      whatsapp: branch.whatsapp,
      mapsUrl: branch.mapsUrl,
    });
    setEditing(branch);
    setCreating(false);
  }

  function closeModal() {
    setEditing(null);
    setCreating(false);
    setForm(emptyForm);
  }

  function handleSave() {
    startTransition(async () => {
      if (editing) {
        await updateBranch(editing.id, form);
      } else {
        await createBranch(form as typeof emptyForm);
      }
      closeModal();
    });
  }

  function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this branch?")) return;
    startTransition(async () => {
      await deleteBranch(id);
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-paper">Branches</h1>
          <p className="text-sm text-paper/50">Manage restaurant locations</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="h-4 w-4" /> New Branch
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {branches.map((branch) => (
            <motion.div
              key={branch.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-xl border border-ink-800 bg-ink-950 p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="inline-block rounded-md bg-cobalt-500/15 px-2 py-0.5 text-xs font-bold text-cobalt-500">
                    #{branch.number}
                  </span>
                  <h3 className="mt-2 font-bold text-paper">{branch.nameEn}</h3>
                  <p className="text-sm text-paper/50">{branch.nameAr}</p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => openEdit(branch)}
                    className="rounded-lg p-2 text-paper/40 hover:bg-ink-800 hover:text-paper transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(branch.id)}
                    disabled={pending}
                    className="rounded-lg p-2 text-paper/40 hover:bg-tomato-500/15 hover:text-tomato-500 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-paper/50">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span>{branch.addressEn}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  <span>{branch.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{branch.whatsapp}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {(creating || editing) && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60"
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-lg rounded-2xl border border-ink-700 bg-ink-900 p-6 shadow-2xl">
                <h2 className="mb-4 text-lg font-extrabold text-paper">
                  {editing ? "Edit Branch" : "New Branch"}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    placeholder="Number"
                    value={form.number}
                    onChange={(e) => setForm({ ...form, number: e.target.value })}
                    className={fieldClass}
                  />
                  <input
                    placeholder="Name (EN)"
                    value={form.nameEn}
                    onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                    className={fieldClass}
                  />
                  <input
                    placeholder="Name (AR)"
                    value={form.nameAr}
                    onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                    className={fieldClass}
                  />
                  <input
                    placeholder="Address (EN)"
                    value={form.addressEn}
                    onChange={(e) => setForm({ ...form, addressEn: e.target.value })}
                    className={fieldClass}
                  />
                  <input
                    placeholder="Address (AR)"
                    value={form.addressAr}
                    onChange={(e) => setForm({ ...form, addressAr: e.target.value })}
                    className={fieldClass}
                  />
                  <input
                    placeholder="Phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={fieldClass}
                  />
                  <input
                    placeholder="WhatsApp"
                    value={form.whatsapp}
                    onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                    className={fieldClass}
                  />
                  <input
                    placeholder="Maps URL"
                    value={form.mapsUrl}
                    onChange={(e) => setForm({ ...form, mapsUrl: e.target.value })}
                    className={`${fieldClass} sm:col-span-2`}
                  />
                </div>
                <div className="mt-5 flex justify-end gap-3">
                  <button onClick={closeModal} className="btn-ghost">
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={pending}
                    className="btn-primary disabled:opacity-50"
                  >
                    {pending ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
