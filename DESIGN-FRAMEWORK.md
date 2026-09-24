# gabrielfontaine.com — Design Framework (Step A)

**Status:** For review before any v2 HTML is built.  
**Date:** September 2026  
**Positioning:** Option C — Gabriel the Executive + Gabriel the Fractional Expert  
**Approved inputs:** Name Equifax, LexisNexis, and vendors on site · Multi-page + hamburger · Headshot yes · 6–8 practice area cards

---

## 1. Design references — what we mimic from each

| Source | We take | We do not take |
|---|---|---|
| **[IIQ Collective](https://iiqcollective.com/)** | Dark hero, niche authority headline, Inter-style typography, section rhythm (Expertise → Process → FAQ → Contact), “Schedule a call” CTA pattern, professional advisory gravitas | Their video hero, WordPress complexity, “About Mike” as separate founder page (we fold into About) |
| **[Rodriguez Jimmy](https://www.rodriguezjimmy.com/)** | Three engagement tiers (Consulting → Advisory → Fractional), “How it works,” discovery-call CTAs, clean hamburger nav, problem-led fractional copy | B2B SaaS founder tone (we adapt to fintech/identity/regulated buyers) |
| **[Get Product People](https://www.getproductpeople.com/product-management)** | “Operators, not advisors,” outcome-led bullets, industry/service page pattern, trust strip (“Trusted by…”) adapted to metrics | Marketplace “100+ companies” scale — you’re personal brand, not agency |

**Sites used for copy only (not visual):** Mind the Product (fractional definition FAQ), ScaleUpExec (“deck and disappeared” anti-pattern).

---

## 2. Visual direction (v2 — intentionally different from current site)

### Current site (v1 — retire visually)
Plus Jakarta + Newsreader, slate-blue cards, rounded “bento” metrics. Reads as generic SaaS portfolio.

### New direction (IIQ-led “Regulated Identity Advisory”)

| Element | Specification |
|---|---|
| **Mood** | Authoritative, precise, warm enough to be approachable — not startup-playful, not corporate-bureaucratic |
| **Primary background** | Deep navy `#0A1628` (hero, footer, key strips) |
| **Secondary background** | Off-white `#F7F8FA` (content sections) |
| **Accent** | Cobalt `#3B6FE8` (links, CTAs, active nav) — slightly brighter than v1 for contrast on dark hero |
| **Text** | `#0F172A` on light · `#E2E8F0` on dark |
| **Typography** | **Inter** (UI, body, nav) · **Instrument Serif** or **Fraunces** (headlines — editorial authority like IIQ/Rodriguez) |
| **Layout** | Wide hero, generous whitespace, max-width ~1120px content, fewer rounded cards — more full-width bands and thin dividers |
| **Headshot** | Circular crop on About + optional small circle in hero sidebar; file: `assets/gabriel-headshot.png` |
| **Motion** | Subtle only — section fade-in on scroll optional; no heavy animation |

### Logo / wordmark
**Gabriel Fontaine** in serif on light backgrounds; **GF** monogram or dot accent in nav (can keep minimal mark). No new logo file required for v1.

---

## 3. Site map — 6 pages + hamburger

```
[Logo: Gabriel Fontaine]                    [☰ Menu]

Mobile / hamburger drawer:
  Home
  Executive
  Fractional
  Practice Areas
  About
  Contact

Desktop: same links inline + primary CTA "Schedule a Conversation"
```

| Page | File | Primary audience | Primary goal |
|---|---|---|---|
| **Home** | `index.html` | Both | Route to Executive or Fractional in &lt;5 seconds |
| **Executive** | `executive.html` | Recruiters, hiring managers | Credibility → resume/LinkedIn/contact |
| **Fractional** | `fractional.html` | Founders, CPOs, CEOs | Understand engagements → contact |
| **Practice Areas** | `practice-areas.html` | Both | Show breadth without Pragmatic overwhelm |
| **About** | `about.html` | Both | Person + how you work + credentials |
| **Contact** | `contact.html` | Both | Form or mailto + LinkedIn |

Shared components across all pages: header, hamburger, footer, design tokens (CSS variables in one `styles.css` or embedded once).

---

## 4. Page wireframes

### 4.1 Home (`index.html`)

```
┌─────────────────────────────────────────────────────────────┐
│ [NAV + hamburger]                          [Schedule Call →] │
├─────────────────────────────────────────────────────────────┤
│ DARK HERO (full width)                                       │
│  Eyebrow: Identity · Fraud · Compliance Product Leadership    │
│  H1: Turning regulatory mandates into enterprise revenue.    │
│  Sub: 18+ years · Equifax & LexisNexis · FCRA/GLBA · APIs   │
│  [Executive Track Record]  [Fractional Advisory]             │
│  ┌──────────────────┐  optional: headshot thumb + snapshot  │
│  │ Snapshot strip   │  Location · 18+ yrs · FCRA/GLBA · ES  │
│  └──────────────────┘                                        │
├─────────────────────────────────────────────────────────────┤
│ LIGHT: Dual path cards (Option C)                            │
│  ┌─────────────────────┐  ┌─────────────────────┐           │
│  │ Gabriel the         │  │ Gabriel the         │           │
│  │ Executive           │  │ Fractional Expert     │           │
│  │ VP/Sr Director…     │  │ Interim · Advisory… │           │
│  │ → executive.html    │  │ → fractional.html   │           │
│  └─────────────────────┘  └─────────────────────┘           │
├─────────────────────────────────────────────────────────────┤
│ METRICS BAND (dark)                                          │
│  $8M+ pipeline │ $6M funding │ 69% cloud │ 45-person org     │
├─────────────────────────────────────────────────────────────┤
│ LIGHT: Fraud & Identity stack (pill tags)                    │
│  Socure · Prove · ThreatMetrix · Kount · …                   │
├─────────────────────────────────────────────────────────────┤
│ LIGHT: Practice areas preview (3 cards + link to full page)  │
├─────────────────────────────────────────────────────────────┤
│ LIGHT: Signal (2 items max on home — link to About or blog)  │
├─────────────────────────────────────────────────────────────┤
│ CTA band: Open to full-time leadership and selective advisory  │
│  [Contact] [LinkedIn] [Download Resume]                      │
├─────────────────────────────────────────────────────────────┤
│ FOOTER                                                       │
└─────────────────────────────────────────────────────────────┘
```

**Hero headline options (pick one in review):**
- A) *Turning regulatory mandates into scaled enterprise revenue.* (current — strong)
- B) *Identity, fraud, and compliance products that carry a business case.*
- C) *Regulatory-to-revenue product leadership for regulated data.*

---

### 4.2 Executive (`executive.html`)

```
HERO (light): Senior product leader · Identity, Fraud & Compliance
Sub: Open to VP, Senior Director, and CPO-level roles

EXECUTIVE SNAPSHOT (sidebar or top card)
  Location · 18+ years · Scale led · Practice areas · FCRA/GLBA · Languages

SIGNATURE OUTCOMES (4 metric cards — IIQ “expertise” style)

CAREER DEEP DIVE (timeline — Equifax + LexisNexis emphasis)
  Equifax Sr Director — Credit Header API, Purpose View, Contact & Locate…
  Equifax Director — DIT/RAE, 69% AWS→GCP, 16 workflows…
  LexisNexis — Risk Defense Platform, $6M funding, ThreatMetrix…
  NTT — brief (2 paragraphs max)

CORE DISCIPLINES (6 tiles — same as practice areas, abbreviated)

LEADERSHIP SIGNAL (3 bullets from Zenger/StandOut — no test names)
  Problem-solving under pressure · Cross-functional collaboration · Initiative

CTA: Download resume · LinkedIn · Contact
```

---

### 4.3 Fractional (`fractional.html`) — Rodriguez Jimmy structure

```
HERO (dark): Executive product muscle without full-time overhead.
Sub: Interim leadership, vendor strategy, regulatory-to-roadmap for
     identity, fraud, and compliance teams.

PROBLEM STATEMENT (1 paragraph — comprehensive profile §7)

THREE ENGAGEMENT MODES (Rodriguez-style columns)
  ┌─────────────────┬─────────────────┬─────────────────┐
  │ Sprint Audit    │ Retained        │ Interim /         │
  │ 2–4 weeks       │ Fractional VP   │ Fractional VP     │
  │ Vendor stack,   │ 10–20 hrs/wk    │ Full transition   │
  │ governance,     │ Roadmap + team  │ until permanent   │
  │ product intake  │ alignment       │ hire              │
  └─────────────────┴─────────────────┴─────────────────┘

WHERE I PLUG IN (5 bullets from profile)
  Interim leadership · GTM & vendor selection · Regulatory-to-product
  GenAI ops · Cloud/platform transformation oversight

PROBLEM PLAYBOOK (3 challenge → solution rows — keep from v1)

WHAT CLIENTS GET (4 cards — StandOut Advisor/Stimulator themes)

FRAUD & IDENTITY STACK (pills)

FAQ (2–3 items — Mind the Product inspired)
  What is fractional product management?
  How is this different from a consultant who delivers a deck?
  What industries do you work with?

CTA: Schedule a conversation → contact.html
```

---

### 4.4 Practice Areas (`practice-areas.html`) — 6–8 cards

**Your question: Should cards be clickable for more context?**

**Recommendation for v1: Yes — expand in place (accordion), not separate pages.**

| Approach | Pros | Cons |
|---|---|---|
| **Accordion expand (recommended)** | One page, SEO-friendly, mobile-friendly, no extra clicks to new URLs | Longer page scroll |
| Modal popup | Clean grid | Bad for mobile, worse for SEO |
| Separate page per area | Deep SEO per topic | 8 pages to maintain; overkill for launch |
| Link to anchor on Executive | Works | Splits fractional-relevant vs executive-relevant awkwardly |

**Interaction:** Each card shows **title + 1-line teaser**. Click/tap expands to **3–5 bullets + 1 “proof point”** (Equifax/LexisNexis example). Only one open at a time on mobile.

**Pragmatic mapping (8 cards — strategic coverage without every box):**

| # | Card title | Pragmatic columns covered | Teaser |
|---|---|---|---|
| 1 | **Market & Competitive Intelligence** | Market | Win/loss, competitive landscape, technology assessment for identity/fraud vendors |
| 2 | **Product Strategy & Roadmaps** | Strategy | 3-year platform vision, portfolio bets, Risk Defense / Credit Header evolution |
| 3 | **Business Case & Pricing** | Business | $6M funding pitch, bundled pricing, API/batch monetization |
| 4 | **Requirements & Compliance Design** | Planning | CIP/KYC/KYB specs, permissible use, Purpose View governance |
| 5 | **Go-to-Market & Launch** | Programs | Demo portals, sales enablement, Contact & Locate suite launch |
| 6 | **Sales & Channel Readiness** | Readiness | Enterprise buyer cycles, compliance stakeholder selling |
| 7 | **Platform & Cloud Transformation** | Business + Planning | AWS→GCP, 69% cost reduction, live migration without downtime |
| 8 | **GenAI Product Operations** | Planning + Programs | Gemini/NotebookLM/Claude in workflow, rapid data triage |

*Optional merge for 6 cards:* combine #6+#7 or drop #8 to About page — your call in review.

**Expanded example (card #3):**
- Business case development for executive funding
- Pricing models for API and batch data products
- Build vs buy analysis with hands-on vendor testing
- *Proof:* Authored business case that secured **$6M** for LexisNexis Risk Defense Platform roadmap

---

### 4.5 About (`about.html`)

```
HERO: Photo (circular) + name + title
  Gabriel Fontaine
  Product Management Leader · Identity, Fraud & Compliance

NARRATIVE (2–3 short paragraphs from comprehensive profile §1–2)
  Regulatory fluency + hands-on technical range + org leadership

HOW I WORK (6 patterns — grid, same as comprehensive profile)
  Hands-on with technology · Data quality as product risk
  Detection vs actionability · Business cases not just roadmaps
  Regulatory-to-revenue · GenAI in the workflow

CREDENTIALS STRIP
  MBA · BS EET · CSPO · Pragmatic PMC III · Spanish (native)

EARLIER CAREER (collapsed / footnote — NTT, manufacturing — 1 paragraph)

OPTIONAL: Signal section (3 industry links) — or keep on Home only

CTA → Contact
```

---

### 4.6 Contact (`contact.html`)

**JotForm not required.** cPanel / Namecheap options:

| Option | Effort | Notes |
|---|---|---|
| **A. PHP mail script** | Low | Namecheap supports PHP; simple `contact.php` posts to gabrielfontaine@gmail.com |
| **B. cPanel “Form Builder”** | Low | If available in your hosting panel — embed generated HTML |
| **C. Formspree / Getform** | Low | Free tier, no backend; external dependency |
| **D. mailto + LinkedIn only** | Minimal | Launch fastest; less professional |
| **E. Calendly embed** | Low | If you have Calendly — “Schedule” + minimal fields |

**Recommendation:** **A (PHP mail)** or **B (cPanel Form Builder)** for launch + prominent **LinkedIn** and **email** links. Add Calendly later if you use it.

```
CONTACT HERO: Let's talk about your product challenge or opportunity.

FORM FIELDS (minimal):
  Name · Email · I'm interested in: [Full-time role | Fractional | Either]
  Message

SIDEBAR:
  gabrielfontaine@gmail.com
  linkedin.com/in/gabrielfontaine1
  Alpharetta, GA
  [LinkedIn button] [Email button]
```

---

## 5. Navigation & hamburger behavior

**Desktop (≥768px):** Logo left · links center or right · CTA button right  
**Mobile:** Logo left · hamburger right · full-screen or slide-down drawer

**Active state:** Current page underlined or accent color  
**Footer (all pages):** © 2026 · Executive · Fractional · Practice Areas · About · Contact · LinkedIn · Email

---

## 6. Content rules (from your docs)

- **Lead metric story:** $8M pipeline (Equifax Contact & Locate) · $6M funding (LexisNexis RDP) · 69% cloud · 45-person org
- **Differentiator line:** *Regulatory-to-revenue* — compliance products with business cases attached
- **Fractional pitch:** Gap between engineering/data and compliance/legal — you own the product between them
- **Name freely:** Equifax, LexisNexis, ThreatMetrix, Socure, Prove, Kount, iovation, etc.
- **Do not put on site:** Personality type labels (ESTP), raw assessment scores, internal Manage Me flags
- **Resume:** PDF download link on Executive + Contact (file to add: `assets/Gabriel_Fontaine_Resume.pdf`)

---

## 7. Sample section copy (ready for Step B)

### Home — dual path card (Executive)
> **Gabriel the Executive**  
> Senior Director and VP-caliber product leader for identity, fraud, and compliance portfolios. Eleven years at Equifax and LexisNexis turning FCRA and GLBA constraints into API products with multi-million-dollar pipeline and funding outcomes.  
> *Open to VP, Senior Director, and CPO-level roles.*

### Home — dual path card (Fractional)
> **Gabriel the Fractional Expert**  
> When engineering has the data and compliance knows the rules — but no one owns the product between them. Interim leadership, vendor evaluation, and regulatory-to-roadmap translation without a full-time hire.  
> *Sprint audits · Retained fractional VP · Strategic advisory.*

### Fractional — engagement modes
1. **Targeted Sprint Audit (2–4 weeks)** — Assess API packaging, vendor stack, data governance, or product intake; deliver prioritized recommendations and a 90-day action outline.  
2. **Retained Fractional VP (ongoing)** — 10–20 hours/week embedded with leadership; own roadmap cadence, stakeholder alignment, and key customer conversations.  
3. **Interim Product Leadership** — Full transition coverage while you search for a permanent hire; run the org, mentor PMs, keep delivery moving.

---

## 8. Build plan — Step B (after you approve this doc)

| Phase | Deliverable | Preview |
|---|---|---|
| **B1** | Shared CSS + nav/hamburger + `index.html` (new design) | localhost:8765 |
| **B2** | `executive.html` + `fractional.html` | same |
| **B3** | `practice-areas.html` (accordion cards) + `about.html` | same |
| **B4** | `contact.html` + PHP form or placeholder | same |
| **B5** | Your review pass — copy, spacing, mobile | iterate |
| **B6** | Upload to cPanel `public_html` | live |

**Estimated files in v2:**
```
gabrielfontaine-site/
  index.html
  executive.html
  fractional.html
  practice-areas.html
  about.html
  contact.html
  contact.php          (if Option A)
  css/styles.css       (shared)
  assets/gabriel-headshot.png
  assets/Gabriel_Fontaine_Resume.pdf  (you add)
  DESIGN-FRAMEWORK.md  (this file)
```

---

## 9. Decisions for you to confirm (reply to unlock Step B)

| # | Decision | Default if no reply |
|---|---|---|
| 1 | Hero headline A, B, or C? | **A** (current) |
| 2 | Practice areas: **8 cards** or **6 cards**? | **8** with accordion |
| 3 | Contact: **PHP mail**, **cPanel Form Builder**, or **mailto only** for v1? | **PHP mail** placeholder |
| 4 | Headshot in **hero** (small) or **About only**? | About + small hero sidebar |
| 5 | Keep **Signal** section (industry links)? | Yes on Home, 2 items |

---

## 10. What changes vs v1 (so you know it will look new)

| v1 | v2 |
|---|---|
| Plus Jakarta + Newsreader | Inter + Instrument Serif |
| Light slate canvas everywhere | Dark hero bands + light content sections |
| Rounded bento cards | Full-width sections, thinner borders, more editorial spacing |
| 2 pages only | 6 pages + hamburger |
| JotForm embed | cPanel-native or PHP contact |
| Practice areas buried in disciplines | Dedicated page with expandable cards |

---

*Step A complete. Reply with approvals or edits to Section 9, then we proceed to Step B (build v2 locally for preview).*
