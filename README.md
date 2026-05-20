# Final Cycle – Placement Questionnaire

Single-page intake form for Final Cycle's accounting firm placement service. Built with plain HTML/CSS/JS, submissions handled by Web3Forms, deployed to Cloudflare Pages.

## Prerequisites

- Node.js installed (for wrangler)
- A Cloudflare account (free tier is fine)
- A Web3Forms API key — sign up free at https://web3forms.com

---

## Step-by-step deploy

### 1. Install Wrangler

```bash
npm install -g wrangler
```

### 2. Log in to Cloudflare

```bash
wrangler login
```

A browser window will open — authenticate with your Cloudflare account.

### 3. Add your Web3Forms API key

Open `index.html` and replace `YOUR_WEB3FORMS_KEY` with the key from your Web3Forms dashboard:

```html
<input type="hidden" name="access_key" value="YOUR_ACTUAL_KEY_HERE" />
```

### 4. Deploy to Cloudflare Pages

```bash
wrangler pages deploy . --project-name=final-cycle-questionnaire
```

Wrangler will create the project on first run and return a `*.pages.dev` preview URL.

### 5. Assign a custom domain (optional)

1. Go to https://dash.cloudflare.com → **Pages** → `final-cycle-questionnaire`
2. Click **Custom domains** → **Set up a custom domain**
3. Enter your domain and follow the DNS instructions

---

## Local preview

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080 in your browser.

> Note: form submission requires the real Web3Forms key to be set. The UI, validation, and "Other" toggles all work locally without it.

---

## Re-deploying after changes

```bash
wrangler pages deploy . --project-name=final-cycle-questionnaire
```

No build step needed — Wrangler uploads the static files directly.
