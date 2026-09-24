# gabrielfontaine.com — v2 (local preview)

Light-first design · 6 pages · hamburger nav · IIQ-inspired structure

## Preview locally

```bash
cd /Users/gf-mac/Cursor/gabrielfontaine-site
python3 -m http.server 8765
```

Open **http://localhost:8765/**

## Pages

| File | Purpose |
|---|---|
| `index.html` | Home — dual gateway, metrics, signal |
| `executive.html` | Full-time track record |
| `fractional.html` | Advisory engagements, playbook, FAQ |
| `practice-areas.html` | 8 expandable practice area cards |
| `about.html` | Bio, how I work, credentials |
| `contact.html` | JotForm + mailto shortcuts |

## Upload to cPanel

Upload all files preserving folders:
- `index.html`, `executive.html`, `fractional.html`, `practice-areas.html`, `about.html`, `contact.html`
- `css/styles.css`
- `js/main.js`
- `assets/gabriel-headshot.png`

Overwrite files in `public_html`. Hard refresh: `Cmd+Shift+R`.

## Design doc

See `DESIGN-FRAMEWORK.md` for rationale and reference sites.
