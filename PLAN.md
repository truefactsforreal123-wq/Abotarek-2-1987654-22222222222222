# 👑 أبو طارق — Abo Tarek (King of Koshari) Website Plan

> Adapted from the El Mostafa Grill plan → rebranded & rebuilt for **كشري أبو طارق**, the most famous koshari address in Egypt.

## 1. Project Overview

Official website for **أبو طارق** (Abo Tarek) — the original koshari, since 1950.

- **Facebook:** [@kosharyaboutarek](https://web.facebook.com/kosharyaboutarek)
- **Founder:** يوسف زكي «أبو طارق» — started with a wooden cart in Downtown Cairo, 1950
- **Brand:** royal blue badge + red/gold border (official logo, `public/images/logo.png`)
- **Signature hook:** **فرع واحد فقط — والباقي تقليد** (one branch only; everything else is an imitation)
- **Languages:** Arabic (default, RTL) + English (toggle, LTR)

### The One Branch

| Location (AR) | Location (EN) | Hours |
|---|---|---|
| ٤٠ شارع شامبليون، المعروف، وسط البلد، القاهرة | 40 Champollion St, Marouf, Downtown Cairo | Daily 9AM–12AM |

- **Phone/WhatsApp:** ⚠️ placeholder in `src/lib/data.ts` (`brand.phone` / `brand.whatsapp`) — **owner must replace**
- **Maps:** `branch.mapsUrl` in `src/lib/data.ts`

---

## 2. Tech Stack

### Frontend (Phase 1 — DONE ✅)
| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 16** (App Router, Turbopack) | all 4 routes prerender static |
| Language | **TypeScript** | scoped to `src/` only (see tsconfig) |
| Styling | **Tailwind CSS v4** | brand tokens in `globals.css` (`@theme`); scanning restricted via `@source` |
| Animations | **Framer Motion** + CSS keyframes | logo preloader, steam particles, staggered reveals, counters, marquee, hover lift, floating stamp/logo |
| Icons | **lucide-react** v1 (+ inline `FacebookIcon` — brand icons were removed from lucide) |
| Font | **Cairo** (next/font/google, arabic+latin) | `--font-cairo` CSS variable |
| i18n | Custom AR/EN context (`src/lib/i18n.tsx`) | `<html dir>` switching + localStorage persistence |

### Backend (Phase 2 — later)
| Layer | Choice |
|---|---|
| API | Next.js route handlers / server actions |
| ORM | **Prisma** |
| Database | **Supabase** (managed Postgres + Auth + Storage for food photos) |
| Features (TBD) | Admin panel (menu/price CRUD), online ordering, table reservations, review submissions |

---

## 3. Design System

- **Colors:** night `#090C22` bg · navy `#10153A` · royal blue `#2B2E7A` (logo) · ember `#E53222` · gold `#F6B21B` · cream `#FFF6E3`
- **Vibe:** downtown-Cairo neon legend — navy surfaces, gold accents, red stamps, rising koshari-pot steam, 1950s cinema-poster founder portrait (arch frame)
- **Signature animations:** logo preloader w/ clip-path exit → hero stagger, steam particles, tilted double marquee (red + gold), animated counters (76+ years · 1 branch · 1950 · 100% original), «الأصل» red stamp float, staggered menu cards w/ layout-animated tab pill, hover glow/lift, gallery zoom, floating WhatsApp pulse
- **Logo note:** the PNG has a **white background** → always displayed inside white "signage" cards (intentional shop-sign look)
- **Founder photo:** `public/images/founder.jpg` (blue studio bg kept — framed as poster, never cut out)

## 4. Site Structure (multi-page)

- `/` — preloader, cinematic hero (founder portrait + floating logo + الأصل stamp), tilted marquees, features, koshari showcase + gallery, stats counters, founder quote band, CTA/social
- `/about` — the 1950 cart story, founder section, 5-stop timeline, values
- `/menu` — category filter tabs (الكل / الكشري / الإضافات / الحلويات / المشروبات), animated cards, sizes+prices, placeholder-prices note
- `/branches` — the single original branch (call / WhatsApp / directions / Facebook) + **احذر التقليد** warning panel
- Shared: preloader, navbar (AR/EN toggle + mobile overlay), footer (photo credits), floating WhatsApp

## 5. Phase 2 Data Model (draft)

`Branch` (name, address, phone, mapsUrl) · `Category` (name_ar, name_en, order) · `MenuItem` (categoryId, name_ar/en, desc_ar/en, price, sizes json, image, available) · `Review` (name, rating, text, approved) · `Order`/`Reservation` (if enabled)

## 6. Roadmap

- [x] Confirm brand, branch, stack
- [x] **Phase 1:** Next.js frontend — full design + animations, CC-licensed placeholder food photos, editable data files (`src/lib/data.ts`)
- [ ] Owner replaces placeholder phone/WhatsApp + confirms prices & hours in `src/lib/data.ts`
- [ ] Replace placeholders with real food photos (Supabase Storage) — current photos are Wikimedia Commons/Flickr CC (attribution in footer + `data.ts`)
- [ ] **Phase 2:** Supabase + Prisma schema, seed menu, API routes
- [ ] **Phase 3:** Admin panel → then ordering/reservations/reviews (discussed later)
- [ ] Deploy: Vercel + custom domain

> Notes: menu prices are placeholders in EGP — owner edits in `src/lib/data.ts` (Phase 1) or admin panel (Phase 3).
