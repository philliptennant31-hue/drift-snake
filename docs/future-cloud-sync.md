# Future: optional cloud sync

**Status: deliberately deferred (June 2026).** Not a TODO for now — a captured plan.

## The decision

Cross-device save transfer already works via **save links** (stats tab →
"copy save link" / "load a save" — see `packSave`/`readSave`/`applySave` in
`game.js`). That covers the real need (play on phone *and* computer) with no
account, no server, no privacy policy.

Full *automatic* sync was scoped and held back on purpose. Reasons:

- Zero benefit until there's an audience asking for it.
- Storing emails + saves makes us a data controller → needs a privacy policy,
  an auth/login surface, and a hard dependency on a service.
- Row-Level Security is the difference between "each player sees only their
  save" and "anyone can read everyone's saves" — worth configuring slowly and
  reviewed, not fast.
- The project's bottleneck is content, not features.

## Trigger to build it

Players actually asking to sync, or hitting the cross-device wall often enough
that the save link feels like friction.

## The plan when that day comes (~half a day)

Backend: **Supabase** (a paid account already exists).

1. **Auth: email magic-link / OTP.** Lightest cross-device identity — no
   passwords, no Google-OAuth consent-screen setup. Same email on each device =
   same save.
2. **Keep localStorage as the source of truth.** Anonymous players never see a
   login. Add one optional **"sync my devices"** button (likely in the stats
   tab, next to the save-link buttons) that signs in and turns on sync. The
   save link stays as the no-account fallback.
3. **Data model:** one row per user — `saves(user_id uuid primary key,
   data jsonb, updated_at timestamptz)`. `data` is the same blob `packSave()`
   already produces (drift-progress + bests + settings; ghosts excluded).
4. **RLS (the careful part):** enable Row-Level Security on the table; policy
   `auth.uid() = user_id` for select/insert/update so a user can only touch
   their own row. Verify with two test accounts before trusting it.
5. **Sync logic:** on sign-in, last-write-wins by `updated_at`, with a "this
   device is behind — keep local or pull cloud?" prompt on conflict so a fresh
   device can't silently clobber a richer save. Push on each unlock/flush
   (debounced), same cadence as the deferred localStorage writes.
6. **Privacy policy:** a short page covering what's stored (email + game save)
   and how to delete it. Required before collecting any emails.
7. Game stays a static GitHub Pages site; Supabase is just a client SDK. No
   server to run.

## Setup note

The Supabase project, table, and RLS policies have to be created in the owner's
dashboard (the agent can't create accounts or sign in). Do the security config
together with a human reviewing it.
