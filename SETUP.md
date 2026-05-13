# Catena — Setup & Deployment

## What you need (all free)
- A [Supabase](https://supabase.com) account
- A [GitHub](https://github.com) account
- A [Vercel](https://vercel.com) account
- [Node.js](https://nodejs.org) installed (LTS version)

---

## Step 1 — Set up Supabase (5 min)

1. Go to [supabase.com](https://supabase.com) → **Start your project** → sign in with GitHub.
2. Click **New project**. Choose a name (e.g. `catena`), set a database password, pick any region. Click **Create new project** and wait ~2 minutes.
3. Once your project is ready, click **SQL Editor** in the left sidebar.
4. Click **New query**, paste the entire contents of `supabase-schema.sql`, and click **Run**.
5. You should see "Success. No rows returned."

**Get your credentials:**
1. In the left sidebar, click **Project Settings** → **API**.
2. Copy:
   - **Project URL** (looks like `https://abcxyz.supabase.co`)
   - **anon / public** key (the long string under "Project API keys")

---

## Step 2 — Configure the app locally (2 min)

In the `catena` folder, duplicate `.env.example` and rename the copy to `.env`:

```
cp .env.example .env
```

Open `.env` and fill in your credentials:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## Step 3 — Run locally (1 min)

In Terminal, navigate to the catena folder and run:

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

Open a second browser window or tab, click **Host a Game** in one and **Join a Game** in the other to verify everything works end-to-end.

---

## Step 4 — Deploy to Vercel (5 min)

1. Push the project to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
   Then create a new repository on GitHub and follow the instructions to push.

2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your GitHub repository.

3. Vercel will detect it as a Vite project automatically. Before clicking **Deploy**, click **Environment Variables** and add:
   - `VITE_SUPABASE_URL` — your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` — your Supabase anon key

4. Click **Deploy**. In ~1 minute you'll get a URL like `catena-yourname.vercel.app`.

That URL is the one you share with students. There are no separate teacher/student URLs — role is chosen on the home screen.

---

## Using the app in class

**You (teacher):**
1. Open the URL on the whiteboard.
2. Click **Host a Game** — a 4-letter room code appears large on screen.
3. Wait for students to join, then click **Draw Pair**.
4. The timer starts at 3 minutes. Use **+30s / −30s** to adjust.
5. Click **Reveal** when ready — all chains appear.
6. Click **Next Pair** to go again with the same students.
7. Click **End Session** when finished.

**Students:**
1. Open the same URL on their laptop.
2. Click **Join a Game**, enter their first name and the 4-letter code.
3. Wait on the lobby screen until you draw a pair.
4. Build their chain using the autocomplete input, then click **Submit Chain**.
5. They can resubmit as many times as they like before the timer ends.

---

## Maintenance notes

- Rooms are deleted when the teacher clicks **End Session**, which cascades and clears all players and submissions.
- If a room is abandoned (teacher closes browser without ending), the data stays in Supabase until you manually delete it. You can do this in the Supabase Table Editor.
- The free Supabase tier stores up to 500 MB and handles up to 200 concurrent realtime connections — comfortably sufficient for classroom use.
