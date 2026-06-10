# CommUnity

Production-ready SaaS foundation for community management.

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **shadcn/ui**
- **Supabase**
- **React Hook Form** + **Zod**
- **next-themes** (light default, dark mode support)

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

3. Add your Supabase credentials to `.env.local`.

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── (admin)/          # Admin route group layout
│   ├── (resident)/       # Resident route group layout
│   ├── globals.css       # Tailwind + shadcn theme tokens
│   ├── layout.tsx        # Root layout with providers
│   └── page.tsx          # Root page (minimal shell)
├── components/
│   ├── layouts/          # Resident & admin shell components
│   ├── providers/        # Theme and app providers
│   └── ui/               # shadcn/ui components (add via CLI)
├── config/
│   └── site.ts           # App metadata
├── hooks/                # Custom React hooks
├── lib/
│   ├── env.ts            # Zod-validated environment variables
│   ├── supabase/         # Browser, server, and middleware clients
│   ├── utils.ts          # cn() utility for Tailwind
│   └── validations/        # Zod schemas
├── middleware.ts         # Supabase session refresh
└── types/                # Shared TypeScript types
```

## shadcn/ui

Add components with the CLI:

```bash
npx shadcn@latest add button
```

Configuration is in `components.json`.

## Layouts

- **Resident** — `(resident)` route group with `ResidentShell` (header + sidebar + main)
- **Admin** — `(admin)` route group with `AdminShell` (sidebar + header + main)

Add pages under the appropriate route group to inherit each layout.
