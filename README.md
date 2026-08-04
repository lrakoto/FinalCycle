# Future Firm Group – Placement Questionnaire

Single-page intake form for Future Firm Group's accounting firm placement service. Built with plain HTML/CSS/JS, Cloudflare Pages + Functions, D1 database, Web3Forms notifications, and Resend confirmation emails.

Live at **https://futurefirmgroup.com**

## Prerequisites

- Node.js installed (for wrangler)
- A Cloudflare account (free tier is fine)
- Web3Forms API key (already set)
- Resend API key (see Secrets below — **not yet set**)

---

## Local preview

```bash
cd public && python3 -m http.server 8080
```

Then open http://localhost:8080 in your browser.

> Form submission requires the Cloudflare Functions runtime. The UI, validation, and "Other" toggles all work locally without it. For the full stack including `/api/*`, use `npx wrangler pages dev public`.

---

## Deploying

**Pushing to `main` deploys to production**, via `.github/workflows/deploy.yml`.

```bash
git add -A
git commit -m "your message"
git push origin main
```

The workflow deploys and then verifies that `futurefirmgroup.com` actually serves the new `index.html` before reporting success.

### Manual deploy (fallback)

```bash
npx wrangler pages deploy public --project-name final-cycle-questionnaire --branch production
```

**Always deploy `public`, never `.`** — deploying the repo root would publish `.dev.vars`, `wrangler.toml`, and `schema.sql` as fetchable static assets.

### Why not native Git integration?

This is a Cloudflare **Direct Upload** project, and Cloudflare does not allow converting one to Git integration — that choice is fixed when the project is created. Switching would mean building a new Pages project and migrating the custom domain, D1 binding, and secrets off a live site. The GitHub Actions workflow gives the same push-to-deploy behavior without that risk.

---

## Secrets

Set as Pages **project secrets** (not in this repo, not in the dashboard's plaintext env vars):

```bash
npx wrangler pages secret put <NAME> --project-name final-cycle-questionnaire
```

| Secret | Status | Purpose |
|---|---|---|
| `ADMIN_PASSWORD` | set | Password for the submissions dashboard |
| `RESEND_API_KEY` | **not set** | Confirmation emails. Until this is set, `functions/api/submit.js` skips the send silently — submissions still save to D1 and still notify via Web3Forms. Also requires verifying `futurefirmgroup.com` as a Resend sending domain (sender: `noreply@futurefirmgroup.com`). |

The GitHub Actions deploy needs two repo secrets: `CLOUDFLARE_API_TOKEN` (Cloudflare → My Profile → API Tokens, permission *Account · Cloudflare Pages · Edit*) and `CLOUDFLARE_ACCOUNT_ID`.

---

## Branding

Palette is sampled from `public/FFG-Logo2.png` and defined once as CSS custom properties in `public/styles.css` (`:root`), mirrored as inline hex in the email template in `functions/api/submit.js` (email clients don't support CSS variables).

| Token | Value |
|---|---|
| green | `#253622` |
| bronze | `#8a5a24` |

`FFG-Logo2.*` is the current (v2) logo; `FFG-Logo.webp` / `FFG-favicon.webp` are the retired v1 files, kept for rollback. Use the **`.png`** logo in email and `og:image` — WebP renders unreliably in email clients and social scrapers.

---

## Project structure

```
├── public/                     # ← the deploy root; only this is served
│   ├── index.html              # Questionnaire form
│   ├── styles.css              # Form styles
│   ├── _headers                # Cache policy (revalidate CSS, pin hashed assets)
│   ├── FFG-Logo2.{webp,png}    # Current logo (png is for email/og:image)
│   ├── FFG-favicon2.webp       # Current favicon
│   ├── FFG-Logo.webp           # Retired v1 logo, kept for rollback
│   ├── FFG-favicon.webp        # Retired v1 favicon
│   └── admin/
│       └── index.html          # Submissions dashboard
├── functions/
│   └── api/
│       ├── submit.js           # POST /api/submit — stores in D1, sends notifications
│       ├── auth.js             # POST /api/auth — password login
│       └── submissions.js      # GET/PATCH/DELETE /api/submissions — CRUD
├── .github/workflows/deploy.yml
├── wrangler.toml               # Cloudflare config + D1 binding
├── schema.sql                  # D1 table schema
└── README.md
```
