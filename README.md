# Abo Tarek

Official bilingual website, admin dashboard, and QR table-ordering system for Abo Tarek Koshari.

## Stack

- Next.js 16 App Router and React 19
- TypeScript and Tailwind CSS 4
- Prisma 7 with Supabase Postgres
- Supabase Auth, Storage, Realtime, and Cron
- Framer Motion for public-site interactions

## Local Setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and provide the Supabase and database credentials.
3. Link the intended Supabase project with `supabase link --project-ref YOUR_PROJECT_REF`.
4. Apply migrations with `supabase db push --linked`.
5. Run the app with `npm run dev`.

## Commands

- `npm run dev`: start the development server
- `npm run lint`: run ESLint
- `npm run build`: create a production build
- `npm run start`: run the production server
- `npm run db:generate`: regenerate Prisma Client
- `npm run db:seed`: reseed application data through Prisma

## Database

The complete database is reproducible from `supabase/migrations` and includes:

- Base application schema
- Public and authenticated RLS policies
- Public `menu-images` storage bucket
- Realtime publication for new orders
- Hourly served-order cleanup cron
- Initial branch, menu, settings, and site content

Running `supabase db reset --linked` is destructive: it clears public data and Supabase Auth users before replaying migrations.

## Deployment

Deploy to a Node.js-compatible Next.js platform such as Vercel. Configure all variables shown in `.env.example`; never commit `.env.local`, service-role keys, or database passwords.
