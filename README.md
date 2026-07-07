# Future Firm Group – Placement Questionnaire

Single-page intake form for Future Firm Group's accounting firm placement service. Built with plain HTML/CSS/JS, Cloudflare Pages + Functions, D1 database, Web3Forms notifications, and Resend confirmation emails.

## Prerequisites

- Node.js installed (for wrangler)
- A Cloudflare account (free tier is fine)
- Web3Forms API key (already set)
- Resend API key (set in Cloudflare dashboard env vars)

---

## Local preview

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080 in your browser.

> Form submission requires the Cloudflare Functions runtime. The UI, validation, and "Other" toggles all work locally without it.

---

## Deploy / re-deploy

```bash
npx wrangler pages deploy . --project-name=final-cycle-questionnaire
```

No build step needed — Wrangler uploads the static files and Functions directly.

---

## Auto-deploy from GitHub

The project is already connected to Cloudflare Pages via the GitHub repo.  
Every push to `master` automatically deploys to production.

Workflow:
```bash
git add -A
git commit -m "your message"
git push origin master
```

Cloudflare Pages will pick up the changes and deploy within ~30 seconds.

---

## Environment variables (set in Cloudflare dashboard)

| Variable | Description |
|---|---|
| `ADMIN_PASSWORD` | Password for the submissions dashboard |
| `RESEND_API_KEY` | API key for sending confirmation emails |

---

## Project structure

```
├── index.html                  # Questionnaire form
├── styles.css                  # Form styles
├── FutureFirmGroup-Logo.svg            # Brand logo
├── wrangler.toml               # Cloudflare config
├── schema.sql                  # D1 table schema
├── functions/
│   └── api/
│       ├── submit.js           # POST /api/submit — stores in D1, sends notifications
│       ├── auth.js             # POST /api/auth — password login
│       └── submissions.js      # GET/PATCH/DELETE /api/submissions — CRUD
├── admin/
│   └── index.html              # Submissions dashboard
└── README.md
```
