# Aanuoluwapo Isaac Afolabi — Portfolio

A data-driven portfolio site. All content (timeline, skills, certifications,
education, projects, achievements, interests) lives in one file —
`data/portfolio.json` — and is rendered into the page by `js/main.js`.
Charts (skill levels, course grades, certification categories) are built
with **Chart.js**. An optional **Flask** backend can serve that same data
as a REST API and persist contact-form submissions.

## Folder structure

```
portfolio/
├── index.html              # page skeleton — containers get filled by main.js
├── css/
│   └── styles.css
├── js/
│   └── main.js              # fetches data/portfolio.json, renders everything, builds charts
├── data/
│   └── portfolio.json       # single source of truth for all structured content
├── images/                  # profile photo, caricature, certificate scans
├── Aanu-Afolabi-cv.pdf
├── backend/
│   ├── app.py                # Flask API + static file server + contact form handler
│   ├── requirements.txt
│   └── submissions.json      # created automatically when the contact form is used (git-ignored)
├── netlify.toml
├── .gitignore
└── README.md
```

## How the two hosting paths differ

**Static only (Netlify / GitHub Pages)** — just the HTML/CSS/JS/JSON/images.
Everything renders (timeline, charts, certifications, filtering, the photo
flip) with zero backend. The only thing that changes: the contact form has
no server to post to, so it automatically falls back to opening the
visitor's email client with the message pre-filled (see `wireContactForm()`
in `js/main.js`).

**Full stack (Flask)** — run `backend/app.py` and it serves the *same*
frontend files plus a working `/api/contact` endpoint that saves messages to
`backend/submissions.json`, and read-only JSON endpoints (`/api/timeline`,
`/api/skills`, `/api/certifications`, `/api/education`, `/api/projects`,
`/api/portfolio`) if you ever want another tool to consume this data.

You don't have to choose forever — deploy the static version to Netlify now,
and if you later want the live contact form, deploy `backend/app.py` to a
Python host (Render, Railway, PythonAnywhere all have free tiers) and update
`API_BASE` in `js/main.js` to point at it.

## Editing content

Everything factual lives in `data/portfolio.json` — add a job, a
certification, or a skill there and it appears on the site automatically,
no HTML editing needed. Narrative prose (About, the Expertise tabs) is
written directly in `index.html` since it's not repeatable/tabular data.

## Run it locally

**Option A — static, no Python needed:**
Just don't open `index.html` directly with `file://` — browsers block
`fetch()` of local JSON files that way. Instead, from the project folder:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000

**Option B — full stack with Flask (working contact form):**

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Then open http://localhost:5000

## Push to GitHub

```bash
cd portfolio
git init
git add .
git commit -m "Initial portfolio site"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

## Deploy to Netlify

**Fastest — drag and drop:**
1. Go to app.netlify.com → sign up/log in.
2. "Add new site" → "Deploy manually".
3. Drag the whole `portfolio` folder in.
4. Netlify gives you a live `https://yoursite.netlify.app` URL immediately.

**Recommended — connect the GitHub repo (auto-redeploys on every push):**
1. Push this folder to GitHub (see above).
2. In Netlify: "Add new site" → "Import an existing project" → "Deploy with GitHub".
3. Pick the repo. Build command: leave blank. Publish directory: `.` (already set in `netlify.toml`).
4. Deploy. Every future `git push` auto-updates the live site.

## Power BI

There's a placeholder card in the Interests section (in `index.html`,
just above the closing of that section) with a commented-out `<iframe>`
snippet. Once you publish a real Power BI report via **File → Publish to
web** inside Power BI, paste that embed URL into the iframe's `src` and
uncomment it — no other changes needed.

## Notes

- Certificate and CV images are your real documents (converted from the
  PDFs you provided), not placeholders.
- The Flask contact-form handler only saves submissions locally — no email
  service (SMTP/SendGrid/etc.) is wired up. Add one in `backend/app.py` if
  you want an actual email notification, not just a saved JSON record.
