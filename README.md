# The Shelf

A personal digital display room. Place books, movies, music, and a few decorative objects on a wooden shelf, arrange them however you want, and share a read-only link.

**Live:** https://the-shelf-ecru.vercel.app

## Screenshots

![Sign in](./screenshots/login.png)

## Features

- Google sign-in
- Up to 5 shelves, each one renamed and engraved onto the wood
- Books, movies, and music render as spines, cases, and vinyl sleeves, not generic cards. Uploaded cover images show on all three.
- Decorative objects: a plant, a framed photo (your own image), or a duck
- Drag items to rearrange them; position is saved
- Click an item and it comes forward, opens, and shows its details. Close it and it returns to the exact spot it started from.
- Delete items or whole shelves
- Toggle a shelf public and share a view-only link, no login needed to view
- Installable as an app on desktop and Android Chrome; add-to-home-screen on iOS

## Tech stack

- HTML, CSS, vanilla JavaScript, no framework, no build step
- Tailwind (CDN)
- Supabase: Postgres, Auth (Google OAuth), Storage
- Hosted on Vercel

## How it works

Each item stores its type, name, optional cover image, rating, description, and its position and rotation on the shelf. Everything renders from that data. The physical look, page edges on books, case thickness on movies, vinyl grooves on records, is done in CSS, not images.

Row-level security in Postgres enforces that you can only edit your own shelves. A shelf marked public is readable by anyone, logged in or not, but never writable.

## Running locally

No build step, clone it and serve the files:

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

1. Authentication → Providers → enable Google, add your client ID and secret, and set your redirect URLs
2. Storage → create a `covers` bucket, public read, restrict to image MIME types and a reasonable size limit
3. Fill in `js/config.js` with your project URL and anon key (the anon key is safe to commit; it's public by design and RLS is what enforces security, not key secrecy)

## What I learned

- RLS policies do nothing if the role has no base table grants to begin with. I lost most of an afternoon to "permission denied" errors that had nothing to do with the policies themselves.
- `Date.now()` returns milliseconds, and a 13-digit millisecond timestamp will overflow a Postgres `integer` column. Use seconds, or size the column for it.
- Rebuilding the items as actual physical objects, page edges on books, a thickness strip on movie cases, grooves on vinyl, made a bigger visual difference than any amount of general polish passes.
- Testing RLS through the Supabase SQL editor doesn't prove anything, since it runs as the postgres superuser and bypasses RLS entirely. Test through the real client instead.
