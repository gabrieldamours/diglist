# diglist

A self-hosted listening list for Bandcamp hoarders.

Add releases and tracks you want to listen to, tag them, track your status, and embed Bandcamp players directly in the list. Your data lives in your own Supabase database. Multiple users can each maintain their own separate list.

> Vibe coded by an enthusiast. Bug fixes and contributions welcome.

## Features

- Add Bandcamp (and other) links with auto-fill from URL
- Album artwork fetched automatically from Bandcamp
- Embedded Bandcamp player per item
- Tags, notes, and status (to listen / in progress / listened)
- Filter by status and tag, search across all fields
- Batch status edit and batch delete
- Import / export as JSON
- Magic link authentication (no password required)
- Multi-user support — each user sees only their own list
- Data persists across devices via Supabase

## Deploy your own

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. In the SQL Editor, run:
```sql
create table items (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now(),
  user_id uuid references auth.users(id)
);

alter table items enable row level security;

create policy "users see own items" on items
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

3. Go to **Authentication → Sign In / Providers** and make sure **Email** is enabled. Disable **Confirm email**.

4. Go to **Authentication → URL Configuration** and set your site URL (e.g. `https://your-app.netlify.app` or your custom domain).

5. Go to **Project Settings → API** and copy your **Project URL** and **Publishable key**

### 2. Netlify

1. Fork this repo
2. Connect it to a new Netlify site
3. In **Site configuration → Environment variables**, add:

| Variable | Value |
|----------|-------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_KEY` | Your Supabase publishable key |
> **Security note:** `SUPABASE_KEY` is your Supabase `anon` (public) key. It is safe to expose in a Netlify Function environment — all data access is controlled by Row Level Security policies defined in Supabase, not by keeping the key secret. Never use your `service_role` key here.

4. Deploy

## Local development

No build step required. The Netlify Functions in `netlify/functions/` require a Netlify environment to run (they proxy requests to Supabase). For local development, use the [Netlify CLI](https://docs.netlify.com/cli/get-started/):
```bash
npm install -g netlify-cli
netlify dev
```

## Contributing

Bug fixes and improvements are welcome.

1. Fork the repo
2. Create a branch from `dev`
3. Submit a PR against `dev` — Netlify will generate a deploy preview automatically
4. Once reviewed, changes are merged into `dev`, then into `main` for release

Please test your changes against a live Supabase instance before submitting.

## License

MIT