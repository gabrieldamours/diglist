# diglist

A self-hosted listening list for Bandcamp hoarders.

Add releases and tracks you want to listen to, tag them, track your status, and embed Bandcamp players directly in the list. Your data lives in your own Supabase database.

> Vibe coded by an enthusiast. Bug fixes and contributions welcome.

## Features

- Add Bandcamp (and other) links with auto-fill from URL
- Album artwork fetched automatically from Bandcamp
- Embedded Bandcamp player per item
- Tags, notes, and status (to listen / in progress / listened)
- Filter by status and tag, search across all fields
- Batch status edit and batch delete
- Import / export as JSON
- Password-protected access
- Data persists across devices via Supabase

## Deploy your own

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. In the SQL Editor, run:

```sql
create table items (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

create policy "allow all" on items
for all
using (true)
with check (true);
```

3. Go to **Project Settings → API** and copy your **Project URL** and **Publishable key**

### 2. Netlify

1. Fork this repo
2. Connect it to a new Netlify site
3. In **Site configuration → Environment variables**, add:

| Variable | Value |
|----------|-------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_KEY` | Your Supabase publishable key |

4. Deploy

### 3. Set your password

In `index.html`, find this line and change `changeme`:

```js
const PASSWORD = "changeme";
```

Commit and push — Netlify will redeploy automatically.

## Local development

No build step required. Open `index.html` directly in a browser, or use any static file server.

The Netlify Functions in `netlify/functions/` require a Netlify environment to run (they proxy requests to Supabase). For local development, you can use the [Netlify CLI](https://docs.netlify.com/cli/get-started/):

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