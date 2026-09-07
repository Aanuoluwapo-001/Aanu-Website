"""
Flask backend for Aanuoluwapo Afolabi's portfolio.

What this is for
-----------------
The site itself is a static frontend (index.html + css/ + js/ + data/portfolio.json)
that can be deployed as-is to Netlify, GitHub Pages, or any static host — no backend
required. This Flask app is an OPTIONAL layer on top of that for two things:

1. Serving the same portfolio data through a small REST API
   (useful if you ever want another app/tool to consume it).
2. Persisting contact-form submissions to a local JSON file, since static hosts
   have no server to receive form posts.

Running it also serves the frontend itself, so `python app.py` gives you the
whole site (charts, timeline, contact form and all) at http://localhost:5000
with a fully working contact form — handy for local development or if you
choose to deploy this Flask app somewhere that runs Python (Render, Railway,
PythonAnywhere, etc.) instead of / alongside Netlify.

Netlify and GitHub Pages do NOT run Python. If you deploy the static files there,
the contact form automatically falls back to opening the visitor's email client
(see js/main.js) since there is no live /api/contact endpoint to post to.
"""

import json
import os
from datetime import datetime, timezone

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # project root
DATA_FILE = os.path.join(BASE_DIR, "data", "portfolio.json")
SUBMISSIONS_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "submissions.json")

app = Flask(__name__, static_folder=BASE_DIR, static_url_path="")
CORS(app)  # harmless locally; only matters if the frontend is ever hosted separately from this API


def load_data():
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


# ---------------------------------------------------------------------------
# Frontend (serves the same index.html / css / js / images / data as static
# files, so visiting http://localhost:5000 works exactly like opening the
# static site, but with a live contact form).
# ---------------------------------------------------------------------------
@app.route("/")
def serve_index():
    return send_from_directory(BASE_DIR, "index.html")


# ---------------------------------------------------------------------------
# Read-only API mirroring data/portfolio.json
# ---------------------------------------------------------------------------
@app.route("/api/portfolio")
def api_portfolio():
    return jsonify(load_data())


@app.route("/api/timeline")
def api_timeline():
    return jsonify(load_data()["timeline"])


@app.route("/api/skills")
def api_skills():
    return jsonify(load_data()["skills"])


@app.route("/api/certifications")
def api_certifications():
    data = load_data()["certifications"]
    category = request.args.get("category")
    if category:
        data = [c for c in data if c["category"] == category]
    return jsonify(data)


@app.route("/api/education")
def api_education():
    return jsonify(load_data()["education"])


@app.route("/api/projects")
def api_projects():
    return jsonify(load_data()["projects"])


# ---------------------------------------------------------------------------
# Contact form
# ---------------------------------------------------------------------------
@app.route("/api/contact", methods=["POST"])
def api_contact():
    payload = request.get_json(silent=True) or {}
    name = (payload.get("name") or "").strip()
    email = (payload.get("email") or "").strip()
    message = (payload.get("message") or "").strip()

    if not name or not email or not message:
        return jsonify({"status": "error", "error": "name, email and message are all required"}), 400

    entry = {
        "name": name,
        "email": email,
        "message": message,
        "received_at": datetime.now(timezone.utc).isoformat(),
    }

    submissions = []
    if os.path.exists(SUBMISSIONS_FILE):
        try:
            with open(SUBMISSIONS_FILE, "r", encoding="utf-8") as f:
                submissions = json.load(f)
        except (json.JSONDecodeError, OSError):
            submissions = []

    submissions.append(entry)
    with open(SUBMISSIONS_FILE, "w", encoding="utf-8") as f:
        json.dump(submissions, f, indent=2)

    # NOTE: this saves the message locally only. No email/SMTP service is
    # configured here — wire one up (e.g. Flask-Mail, SendGrid, Postmark)
    # if you want an actual email notification when someone submits the form.
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
