# IdeaLabz — Tech Base LK

A modern, high-performance web platform and AI Knowledge Hub designed with futuristic glassmorphism, responsive cyber aesthetics, and dynamic particle effects. Built with Next.js (App Router) and powered by Supabase.

---

## 🚀 Features

- **Tech Base LK Hub**: AI Knowledge Hub showcasing tutorials, classes, products, and insights.
- **Curated AI Prompts**: Searchable, categorised prompt directory with instant copy-to-clipboard functionality.
- **Admin Management Portal**: Secure authentication and admin dashboard for creating, editing, and managing prompts and categories.
- **Modern Cyber Aesthetics**: Dynamic canvas particle effects, glassmorphism navigation, neon accents, and smooth responsive layouts.
- **Supabase Backend**: Real-time Postgres database with Row Level Security (RLS) policies.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: Vanilla CSS Modules with custom neon styling & modern glassmorphism
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Icons**: Lucide React

---

## 🔒 Security & Environment Setup

This project follows strict security practices. Never commit private credentials or `.env.local` to public repositories.

1. **Clone the repository**:
   ```bash
   git clone https://github.com/erangaIrugalbandara/techbaselk.git
   cd techbaselk
   ```

2. **Set up environment variables**:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase project credentials in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ADMIN_EMAIL=admin@example.com
   ```

3. **Set up database schema**:
   Run the SQL statements in [`supabase-schema.sql`](supabase-schema.sql) in your Supabase SQL Editor to initialize the tables, views, and Row Level Security (RLS) policies.

---

## 💻 Getting Started

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) or [http://localhost:3000/techbaselk](http://localhost:3000/techbaselk) in your browser.

---

## 📁 Project Structure

```
├── public/                 # Static assets
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Landing / Home
│   │   └── techbaselk/     # Tech Base LK portal & admin routes
│   │       ├── admin/      # Admin login and dashboard
│   │       ├── prompts/    # AI Prompts library
│   │       ├── classes/    # Masterclasses & courses
│   │       ├── products/   # AI tools & products
│   │       └── about/      # About IdeaLabz
│   ├── components/         # Reusable UI components (Navbar, Hero, etc.)
│   └── lib/                # Supabase client and utilities
├── supabase-schema.sql     # Database schema and RLS policies
├── .env.example            # Environment variables template
└── .gitignore              # Git ignore rules
```

---

## 📄 License

This project is licensed under the MIT License.
