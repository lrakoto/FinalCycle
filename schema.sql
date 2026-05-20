CREATE TABLE IF NOT EXISTS submissions (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  submitted_at    TEXT NOT NULL,
  name            TEXT,
  email           TEXT,
  phone           TEXT,
  annual_revenue  TEXT,
  team_members    TEXT,
  firm_worth      TEXT,
  client_count    TEXT,
  tax_returns     TEXT,
  tax_software    TEXT,
  documentation   TEXT,
  efficiency      TEXT,
  bottleneck      TEXT
);
