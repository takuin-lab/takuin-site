# takuin.com — rebuild

This is the full rebuilt site: all 339 restored posts and 2,454 historical
comments from the old WordPress archive (2006–2016), the four new pieces
from the relaunch (Step One, Ink That Tells A Truth, What Remains, Bird and
Water), the Archive, Start Here, What's This, and the six restored WordPress
pages (About, Contact, Subscribe, Interviews, Fasting Resources, The Past).

Every old post keeps its exact original URL, so existing backlinks from
other sites will keep working with no redirects needed.

Inline images from the old archive were intentionally removed rather than
left as broken links — most pointed to a defunct Flickr URL scheme or the
old WordPress host, and recovering them wasn't worth the effort for what
this site is now. Old posts read as text-only going forward.

## Getting this live — one-time setup

1. **Create a new GitHub repository** (empty, no README/gitignore needed).
2. On the new repo's page, click **"uploading an existing file"** and drag
   in *everything inside this folder* (not the folder itself — its
   contents should sit at the repo's root). Commit directly to `main`.
3. In the Cloudflare dashboard, open the **`lifebeyond`** Pages project →
   **Settings** → connect it to this new GitHub repo (exact wording may
   have changed since — if you don't see a "Connect to Git" option, tell
   Claude and it'll pull the current steps). Build command: none. Build
   output directory: `/` (the repo root).

After that one-time connection, every future update is: drag the updated
folder into GitHub's upload page again, same as step 2. Cloudflare
redeploys automatically.

## Required before comments work: D1 database + Turnstile

The comment system needs two things set up in the Cloudflare dashboard
that can't be done from a file upload:

1. **D1 database.** Create one (any name, e.g. `takuin-comments`), run
   `schema.sql` against it (the dashboard has a query editor, or use
   `wrangler d1 execute`), then bind it to the Pages project as `DB` in
   **Settings → Functions → D1 database bindings**.
2. **Turnstile widget.** Create one at **Turnstile** in the dashboard
   (any name, add `takuin.com` as the domain). Copy the **site key** into
   `templates/_comments.html` wherever `YOUR_TURNSTILE_SITE_KEY` appears
   (search-and-replace, then rebuild), and set the **secret key** as an
   environment variable named `TURNSTILE_SECRET` on the Pages project
   (Settings → Environment variables). Also set `IP_HASH_SALT` to any
   random string of your choosing.

Until this is done, historical comments (baked into every old post) still
display fine — only new comment submission needs the database and
Turnstile.

## What's not finished yet

- **8 unpublished drafts** from the old archive were intentionally left
  out of this build, pending your review.
- **Tagline / "What's This" copy** uses "Manufactured by Return" as a
  placeholder — swap the word if you want something else.
- **Bird and Water** uses a plain essay layout, same as "Ink That Tells A
  Truth" — no bespoke form was picked for it yet.
