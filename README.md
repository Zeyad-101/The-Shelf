<p align="center">
  <img alt="HTML5" src="https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white">
  <img alt="CSS3" src="https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white">
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black">
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white">
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white">
  <img alt="Vercel" src="https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white">
</p>

<h1 align="center">The Shelf</h1>
<p align="center"><em>A personal digital display room for your books, movies, music, and a few small objects.</em></p>
<p align="center"><a href="https://the-shelf-ecru.vercel.app"><strong>Live demo →</strong></a></p>

---

## About

Most media trackers look like spreadsheets. The Shelf is built to feel like an actual shelf: a warm, lit room where you place books, movies, records, and a few personal objects, and arrange them however you like. The arrangement is the point, the same way a real shelf says something about whoever put it together, and a sorted list never does.

Every item renders as the physical object it represents instead of a generic card. Books show real page edges and a spine. Movie cases have visible thickness and a glossy sheen. Records show their grooves through the sleeve. Click anything and it comes off the shelf toward you, opens, and returns to the exact spot it started from when you're done.

## Screenshots

![Sign in](./screenshots/login.png)

## Features

- Google sign-in
- Up to 5 shelves, each one renamed and engraved directly onto the wood
- Books, movies, and music rendered as spines, cases, and vinyl sleeves. Uploaded cover images show on all three.
- Decorative objects: a plant, a framed photo of your own, or a duck
- Drag items to rearrange them; the position is saved
- Click an item to bring it forward and see its details, then close it and it returns exactly where it was
- Delete items or whole shelves
- Toggle a shelf public and share a view-only link, no login needed to view
- Installable as an app on desktop and Android Chrome; add-to-home-screen on iOS

## Tech stack

| | |
|---|---|
| **Frontend** | HTML, CSS, vanilla JavaScript — no framework, no build step |
| **Styling** | Tailwind CSS (CDN) |
| **Backend** | Supabase — Postgres, Auth, Storage |
| **Auth** | Google OAuth |
| **Hosting** | Vercel |

## How it works

Each item stores its type, name, optional cover image, rating, description, and its position and rotation on the shelf. Everything on screen renders from that data. The physical detail, page edges on books, the thickness strip on movie cases, the grooves on a record, is done entirely in CSS, not images.

Row-level security in Postgres enforces that you can only edit your own shelves. A shelf marked public is readable by anyone, logged in or not, but never writable by them.

## Running locally

No build step. Clone the repo and serve the files:

```bash
npx serve .
```

You'll need your own Supabase project. In the SQL editor, run:

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz default now()
);

create table shelves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null default 'FAVORITES',
  sort_order int not null default 0,
  is_public boolean not null default false,
  share_slug text unique default encode(gen_random_bytes(6), 'hex'),
  created_at timestamptz default now()
);

create table items (
  id uuid primary key default gen_random_uuid(),
  shelf_id uuid not null references shelves(id) on delete cascade,
  type text not null check (type in ('book','movie','music','decorative')),
  name text not null,
  cover_url text,
  rating numeric(3,1) check (rating between 0 and 10),
  description text,
  position_x real not null default 0,
  rotation real not null default 0,
  sort_order int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles enable row level security;
alter table shelves enable row level security;
alter table items enable row level security;

grant usage on schema public to authenticated, anon;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.shelves  to authenticated;
grant select, insert, update, delete on public.items    to authenticated;
grant select on public.shelves to anon;
grant select on public.items   to anon;

create policy "own profile" on profiles for all using (auth.uid() = id);
create policy "owner full access shelves" on shelves for all using (auth.uid() = user_id);
create policy "public read shelves" on shelves for select using (is_public = true);
create policy "owner full access items" on items for all using (
  exists (select 1 from shelves where shelves.id = items.shelf_id and shelves.user_id = auth.uid())
);
create policy "public read items" on items for select using (
  exists (select 1 from shelves where shelves.id = items.shelf_id and shelves.is_public = true)
);
```

Then:

1. **Authentication → Providers**: enable Google, add your client ID and secret, and set your redirect URLs
2. **Storage**: create a `covers` bucket, public read, restricted to image MIME types with a reasonable size limit
3. Fill in `js/config.js` with your project URL and anon key. The anon key is safe to commit, it's public by design; row-level security is what actually enforces access, not keeping that key secret.

## Notes from building it

- RLS policies do nothing if the role has no base table grants to begin with. A whole afternoon went into "permission denied" errors that had nothing to do with the policies themselves.
- `Date.now()` returns milliseconds, and a 13-digit millisecond timestamp will overflow a Postgres `integer` column. Use seconds, or size the column for it.
- Rebuilding the items as actual physical objects, page edges on books, a thickness strip on movie cases, grooves on vinyl, made a bigger visual difference than any amount of general polish passes.
- Testing RLS through the Supabase SQL editor doesn't prove anything, since it runs as the postgres superuser and bypasses RLS entirely. Test through the real client instead.

---

<p align="center">Built by Zeyad Waled</p>
