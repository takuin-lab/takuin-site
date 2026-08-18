-- D1 schema for takuin.com comments.
-- Only NEW (post-relaunch) comments live here. All 2,454 historical
-- comments from the WordPress archive are baked into the static post
-- pages at build time and never touch this database.

CREATE TABLE IF NOT EXISTS comments (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  slug       TEXT NOT NULL,              -- which post this belongs to
  author     TEXT NOT NULL,
  email      TEXT,                       -- stored, never rendered publicly
  content    TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  ip_hash    TEXT,                       -- salted hash, not the raw IP
  hidden     INTEGER NOT NULL DEFAULT 0  -- 1 = removed after the fact, kept for records
);

CREATE INDEX IF NOT EXISTS idx_comments_slug ON comments(slug, created_at);
