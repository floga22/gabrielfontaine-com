// Cloudflare Pages Function — functions/api/jev.js
// Serves the three Jev Decision Engine demo panels and the Job Fit Analyzer
// on /projects. All demo content (context, item text, questions) lives here,
// server-side. The browser only ever sends {"demo": 1|2|3|4, "posting": 0|1|2}
// and never sees the OpenRouter key.
//
// Secret required: OPENROUTER_API_KEY (Cloudflare Pages > Settings > Environment variables,
// added as a *secret*, Production + Preview).

const MODEL = "typesafe/jev-1.13";
const OPENROUTER_URL = "https://openrouter.ai/api/alpha/decisions";
const FALLBACK_DATE = "Sep 26, 2026";
const TIMEOUT_MS = 10000;
const RATE_LIMIT_PER_HOUR = 10;

// ---------------------------------------------------------------------------
// Demo content
// ---------------------------------------------------------------------------

const DEMO_1 = {
  context:
    "Today is Monday, 9:00 AM. You are helping a busy department manager decide which work emails to handle first. The manager's priorities this week: close the quarterly budget by Wednesday and support a key client renewal on Friday.",
  questions: {
    today: { type: "noul", instructions: "Does this email need the manager's personal action today?" },
    priority: {
      type: "score",
      instructions: "How important is this email to the manager's goals this week?",
      criteria: ["Low", "Medium", "High", "Critical"]
    },
    type: {
      type: "choice",
      instructions: "What kind of email is this?",
      criteria: {
        decision: "the manager must make a decision or approve something",
        delegate: "someone on the team could handle it",
        fyi: "information only, no action needed",
        noise: "promotional, automated or not relevant"
      }
    }
  },
  items: [
    { id: "1", label: "CFO — Budget numbers", text: "From: CFO. Subject: Budget numbers. “Need your final department numbers by Tuesday noon so I can consolidate before Wednesday's review.”" },
    { id: "2", label: "Vendor sales rep — URGENT!!!", text: "From: Vendor sales rep. Subject: URGENT!!! LAST CHANCE: 40% off our analytics platform ends TODAY!" },
    { id: "3", label: "Account manager — Client renewal", text: "From: Account manager on your team. Subject: Client renewal. “The client asked if we can extend the pilot pricing. I need your yes/no before I reply tomorrow.”" },
    { id: "4", label: "IT Department — Scheduled maintenance", text: "From: IT Department (automated). Subject: Scheduled maintenance Saturday 2-4 AM. No action required." },
    { id: "5", label: "Team member — Quick question", text: "From: Team member. Subject: Quick question. “Where is the template for the monthly status report?”" },
    { id: "6", label: "HR — Open enrollment reminder", text: "From: HR. Subject: Reminder: open enrollment closes in 3 weeks." },
    { id: "7", label: "Your manager — (no subject)", text: "From: Your direct manager. Subject: (no subject). “Can we talk today about the client renewal? I have concerns.”" },
    { id: "8", label: "Company newsletter", text: "From: Company newsletter. Subject: This month's employee spotlight and upcoming potluck!" },
    { id: "9", label: "Finance analyst — Budget discrepancy", text: "From: Finance analyst. Subject: Budget discrepancy. “Your Q3 travel line is $18K over the forecast. Can you confirm before I submit to the CFO?”" },
    { id: "10", label: "Colleague — FYI, all-hands slides", text: "From: Colleague in another department. Subject: FYI. “Sharing the slides from last week's all-hands in case you missed them.”" }
  ],
  fallbackOrder: ["1", "9", "3", "7", "5", "6", "10", "4", "8", "2"],
  fallback: {
    "1": { today: "Unclear, leaning no (0.45)", priority: "Critical (0.93)", type: "Decision or delegate, toss-up" },
    "9": { today: "Yes (0.73)", priority: "Critical (0.85)", type: "Decision (1.00)" },
    "3": { today: "Unclear, leaning yes (0.65)", priority: "Leaning High, Critical possible (0.56)", type: "Decision (1.00)" },
    "7": { today: "Yes (0.72)", priority: "Leaning High, Critical possible (0.56)", type: "Leaning decision (0.63)" },
    "5": { today: "No (0.22)", priority: "Low (0.89)", type: "Delegate (0.95)" },
    "6": { today: "No (0.12)", priority: "Low (0.97)", type: "FYI (0.74)" },
    "10": { today: "No (0.12)", priority: "Low (1.00)", type: "FYI (0.99)" },
    "4": { today: "No (0.03)", priority: "Low (1.00)", type: "FYI (0.74)" },
    "8": { today: "No (0.06)", priority: "Low (1.00)", type: "Noise (0.76)" },
    "2": { today: "No (0.13)", priority: "Low (0.96)", type: "Noise (0.99)" }
  }
};

const DEMO_2 = {
  context:
    "These are text messages received on a personal phone this week. The person banks with a large national bank, has a package on the way from an online store, and just tried to log in to their email.",
  questions: {
    scam: { type: "noul", instructions: "Is this message likely a scam?" },
    action: {
      type: "choice",
      instructions: "What is the safest thing to do?",
      criteria: {
        safe_to_use: "the message is legitimate and safe to act on",
        verify_first: "do not click; check directly in the official app or by calling the number on the back of your card",
        delete_block: "delete and block the sender"
      }
    }
  },
  items: [
    { id: "F", label: "Gift card giveaway", text: "“Congratulations! You've been selected for a $1,000 gift card from a major retailer. Claim it now before it expires tonight: claim-reward-now.net”" },
    { id: "A", label: "Bank account locked", text: "“BANK ALERT: Your account has been locked due to suspicious activity. Verify your identity within 24 hours to avoid permanent closure: bank-secure-verify.co/login”" },
    { id: "C", label: "Package redelivery fee", text: "“USPS: Your package could not be delivered due to an incomplete address. Update your details here within 12 hours: usps-redelivery-help.com (a $1.99 fee applies)”" },
    { id: "D", label: "“Hi Mom” new number", text: "“Hi Mom, I dropped my phone in the toilet, this is my new number. Can you send me $400 on Zelle? I'll explain later, it's urgent.”" },
    { id: "B", label: "Login verification code", text: "“Your verification code is 482913. Do not share this code with anyone. We will never call you to ask for it.” (Received seconds after you tried to log in to your email.)" },
    { id: "E", label: "Order shipped notice", text: "“Your order #88213 has shipped and arrives Thursday. Track it in the app or on our website.” (From the online store you ordered from, no link included.)" }
  ],
  fallbackOrder: ["F", "A", "C", "D", "B", "E"],
  fallback: {
    F: { scam: "Yes (0.98)", action: "Leaning delete and block, verify possible (0.56)" },
    A: { scam: "Yes (0.95)", action: "Verify first, in the official app (1.00)" },
    C: { scam: "Yes (0.95)", action: "Verify first (0.94)" },
    D: { scam: "Yes (0.93)", action: "Verify first, call the old number (0.80)" },
    B: { scam: "Unclear, leaning no (0.27)", action: "Leaning verify first, safe to use possible (0.60)" },
    E: { scam: "No (0.16)", action: "Verify first (0.77)" }
  }
};

const DEMO_3 = {
  context:
    "You are screening new online account applications at a US digital lender. Signals are summarized from identity and device checks. This is an illustrative demo with fictional applicants.",
  questions: {
    route: {
      type: "choice",
      instructions: "What should happen to this application?",
      criteria: {
        approve: "signals are consistent and low risk",
        step_up: "ask for extra verification such as document and selfie check",
        decline: "strong fraud indicators"
      }
    },
    synthetic: { type: "noul", instructions: "Are the signals consistent with a synthetic identity (a fabricated identity mixing real and fake data)?" }
  },
  items: [
    { id: "1", label: "Applicant 1", text: "Applicant 1: email address 9 years old, phone number in carrier records 6 years under the same name, device seen before only on this person's own account, SSN issuance date consistent with date of birth, credit file 11 years old, address matches utility records." },
    { id: "2", label: "Applicant 2", text: "Applicant 2: email created 3 days ago, phone is a prepaid line activated last week, device fingerprint already linked to 7 other new applications this month with different names, SSN issued recently but applicant claims age 41, thin credit file created 5 months ago with an authorized-user tradeline only." },
    { id: "3", label: "Applicant 3", text: "Applicant 3: email 2 years old, phone 1 year old under the same name, new device never seen before, SSN consistent with date of birth, credit file 4 years old, but the shipping address differs from the address on the credit file." }
  ],
  fallbackOrder: ["1", "2", "3"],
  fallback: {
    "1": { route: "Approve (0.99)", synthetic: "No (0.11)" },
    "2": { route: "Decline (0.99)", synthetic: "Yes (0.90)" },
    "3": { route: "Step up verification (0.95)", synthetic: "Unclear, leaning no (0.45)" }
  }
};

// Demo 4: Job Fit Analyzer. Same engine, a persona instead of an inbox.
// Three different fictional personas, one per job family, so the tool
// demonstrates range rather than just re-running one candidate.
const PERSONAS = {
  "0": "Candidate profile: Alex Rivera, 9 years in product management, most recently leading a 6-person team on a mid-market B2B SaaS platform. Strengths: roadmapping, stakeholder alignment, data-informed prioritization, cross-functional leadership, vendor evaluation, agile delivery, basic SQL. No direct payments or regulated-fintech experience. No formal people-management title beyond team lead.",
  "1": "Candidate profile: Jordan Lee, 5 years as a Business Analyst supporting sales and customer-success teams. Strengths: SQL queries against a data warehouse, Salesforce reporting and dashboards, Tableau dashboard design, Excel and Google Sheets modeling, gathering requirements from non-technical stakeholders. No formal 'Revenue Operations' title yet, and only basic exposure to NetSuite reporting.",
  "2": "Candidate profile: Priya Nair, 6 years in FP&A and pricing analysis. Strengths: advanced Excel financial modeling, SAP reporting, competitive pricing analysis, quarterly forecasting, presenting analysis to leadership. Has executed pricing frameworks set by others, but has not owned pricing strategy end-to-end."
};

const JOB_POSTINGS = [
  {
    id: "0",
    company: "Brightleaf Software",
    role: "Senior Product Manager, Platform",
    text: "Brightleaf Software is hiring a Senior Product Manager to own our core platform roadmap: API surface, integrations, and internal developer tools. You'll work directly with engineering leads and enterprise customers to prioritize what ships next. 6+ years of B2B SaaS product management required. Comfortable running a small, senior team."
  },
  {
    id: "1",
    company: "Alder Logistics",
    role: "Business Analyst, Revenue Operations",
    text: "Alder Logistics is hiring a Business Analyst for Revenue Operations to own reporting on pipeline, renewals, and account health across our sales and customer-success teams. You'll build and maintain Salesforce and Tableau dashboards, write SQL queries against our data warehouse, and turn ad hoc stakeholder requests into repeatable reports. 5+ years in a business analyst or revenue operations role required."
  },
  {
    id: "2",
    company: "Vantage Point Analytics",
    role: "Senior Pricing Analyst",
    text: "Vantage Point Analytics is hiring a Senior Pricing Analyst to own competitive pricing analysis and quarterly forecasting for our enterprise analytics product line. You'll build and maintain Excel-based pricing models, report through SAP, and partner with sales leadership on deal-desk pricing exceptions. 6+ years in FP&A or pricing strategy required, including experience setting, not just executing, pricing frameworks."
  }
];

const JOB_QUESTIONS = {
  fit: {
    type: "score",
    instructions: "How well does this candidate's experience match the role as posted?",
    criteria: ["Weak", "Partial", "Strong", "Excellent"]
  },
  recommend: {
    type: "choice",
    instructions: "What should the candidate do about this posting?",
    criteria: {
      apply_now: "strong match, apply with a tailored resume",
      apply_with_note: "decent match, apply but address the gap directly in a cover letter",
      skip: "weak match, look elsewhere"
    }
  },
  stretch: { type: "noul", instructions: "Is this a stretch role relative to the candidate's current level?" }
};

const JOB_FALLBACK = {
  "0": {
    fit: "Excellent (0.91)",
    recommend: "Apply now (0.95)",
    stretch: "No (0.20)",
    strengths: [
      "Direct match on company stage (mid-market B2B SaaS) and the exact discipline (platform/API roadmap).",
      "9 years of experience comfortably covers the 6+ year bar, including leading a similarly sized team."
    ],
    gaps: ["No listed gap of note for this posting."]
  },
  "1": {
    fit: "Strong (0.78)",
    recommend: "Apply now (0.74)",
    stretch: "Unclear, leaning no (0.40)",
    strengths: [
      "5 years directly matches the posting's required minimum, with hands-on SQL and Salesforce reporting experience.",
      "Tableau dashboard work lines up closely with the role's day-to-day deliverables."
    ],
    gaps: ["No formal “Revenue Operations” title yet, though the underlying analytical work overlaps closely."]
  },
  "2": {
    fit: "Leaning Partial, Strong possible (0.55)",
    recommend: "Leaning apply with a note (0.62)",
    stretch: "Yes (0.71)",
    strengths: [
      "6 years of hands-on Excel modeling and SAP reporting matches the tooling the role expects.",
      "Comfortable presenting pricing analysis to leadership from prior forecasting work."
    ],
    gaps: ["Has executed existing pricing frameworks but hasn't owned pricing strategy end-to-end, which the posting calls out as the core of the role."]
  }
};

// ---------------------------------------------------------------------------
// Rate limiting (best-effort, per warm isolate — not durable across cold
// starts or multiple edge locations, but enough to blunt casual abuse of a
// low-traffic demo endpoint without provisioning KV/D1 for it).
// ---------------------------------------------------------------------------
const rateBuckets = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const entry = rateBuckets.get(ip);
  if (!entry || now - entry.windowStart > windowMs) {
    rateBuckets.set(ip, { windowStart: now, count: 1 });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_PER_HOUR;
}

// ---------------------------------------------------------------------------
// OpenRouter call
// ---------------------------------------------------------------------------
async function askJev(apiKey, state, questions) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ model: MODEL, state, questions }),
      signal: controller.signal
    });
    if (!res.ok) throw new Error(`OpenRouter ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

// Format one question's raw answer into the same banded, words-plus-number
// style used in the hand-written fallback copy.
function formatNoul(p) {
  if (p >= 0.7) return `Yes (${p.toFixed(2)})`;
  if (p < 0.3) return `No (${p.toFixed(2)})`;
  return `Unclear, leaning ${p >= 0.5 ? "yes" : "no"} (${p.toFixed(2)})`;
}

function topTwo(probabilities) {
  const entries = Object.entries(probabilities).sort((a, b) => b[1] - a[1]);
  return { top: entries[0], second: entries[1] };
}

function formatChoiceLike(topLabel, topP, secondLabel) {
  if (topP >= 0.7) return `${topLabel} (${topP.toFixed(2)})`;
  if (topP >= 0.5) return `Leaning ${topLabel}, ${secondLabel} possible (${topP.toFixed(2)})`;
  return `${topLabel} or ${secondLabel}, close call (${topP.toFixed(2)})`;
}

function formatAnswer(qType, answer, legend) {
  try {
    if (qType === "noul") {
      const p = typeof answer.noul === "number" ? answer.noul : answer.probability;
      return formatNoul(p);
    }
    if (qType === "choice") {
      const { top, second } = topTwo(answer.probabilities);
      return formatChoiceLike(capitalize(top[0]), top[1], second ? second[0] : "the alternative");
    }
    if (qType === "score") {
      const probs = answer.probabilities;
      const lg = answer.legend || legend || {};
      const { top, second } = topTwo(probs);
      const topLabel = lg[top[0]] || top[0];
      const secondLabel = second ? lg[second[0]] || second[0] : "the next band";
      return formatChoiceLike(topLabel, top[1], secondLabel);
    }
  } catch (e) {
    return null;
  }
  return null;
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ");
}

async function runDemo(apiKey, demo) {
  const started = Date.now();
  const results = await Promise.all(
    demo.items.map(async (item) => {
      const state = `${demo.context}\n\n${item.text}`;
      const raw = await askJev(apiKey, state, demo.questions);
      const cells = {};
      for (const qKey of Object.keys(demo.questions)) {
        const qType = demo.questions[qKey].type;
        const answer = raw[qKey] || (raw.answers && raw.answers[qKey]) || {};
        cells[qKey] = formatAnswer(qType, answer, answer.legend);
        if (cells[qKey] === null) throw new Error(`Unrecognized response shape for ${qKey}`);
      }
      return { id: item.id, cells };
    })
  );
  return { results, ms: Date.now() - started };
}

async function runJobPosting(apiKey, posting) {
  const started = Date.now();
  const persona = PERSONAS[posting.id] || PERSONAS["0"];
  const state = `${persona}\n\nJob posting — ${posting.company}, ${posting.role}: ${posting.text}`;
  const raw = await askJev(apiKey, state, JOB_QUESTIONS);
  const cells = {};
  for (const qKey of Object.keys(JOB_QUESTIONS)) {
    const qType = JOB_QUESTIONS[qKey].type;
    const answer = raw[qKey] || (raw.answers && raw.answers[qKey]) || {};
    cells[qKey] = formatAnswer(qType, answer, answer.legend);
    if (cells[qKey] === null) throw new Error(`Unrecognized response shape for ${qKey}`);
  }
  return { cells, ms: Date.now() - started };
}

function fallbackPayload(demo) {
  return {
    ok: true,
    fallback: true,
    label: `Showing results captured ${FALLBACK_DATE}.`,
    results: demo.fallbackOrder.map((id) => ({ id, cells: demo.fallback[id] }))
  };
}

function fallbackJobPayload(postingId) {
  const f = JOB_FALLBACK[postingId];
  return {
    ok: true,
    fallback: true,
    label: `Showing results captured ${FALLBACK_DATE}.`,
    cells: { fit: f.fit, recommend: f.recommend, stretch: f.stretch },
    strengths: f.strengths,
    gaps: f.gaps
  };
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
export async function onRequestPost(context) {
  const { request, env } = context;

  // Same-origin only.
  const origin = request.headers.get("Origin");
  const url = new URL(request.url);
  if (origin && new URL(origin).host !== url.host) {
    return json({ ok: false, error: "forbidden" }, 403);
  }

  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  if (isRateLimited(ip)) {
    return json({ ok: true, fallback: true, rateLimited: true, label: `Rate limit reached. Showing results captured ${FALLBACK_DATE}.` }, 200);
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ ok: false, error: "bad_request" }, 400);
  }

  const demoNum = body.demo;
  const apiKey = env.OPENROUTER_API_KEY;

  if (demoNum === 4) {
    const postingIdx = String(body.posting);
    const posting = JOB_POSTINGS.find((p) => p.id === postingIdx);
    if (!posting) return json({ ok: false, error: "bad_request" }, 400);
    if (!apiKey) return json(fallbackJobPayload(postingIdx));
    try {
      const { cells, ms } = await runJobPosting(apiKey, posting);
      const f = JOB_FALLBACK[postingIdx];
      return json({ ok: true, fallback: false, ms, cells, strengths: f.strengths, gaps: f.gaps });
    } catch (e) {
      return json(fallbackJobPayload(postingIdx));
    }
  }

  const demo = { 1: DEMO_1, 2: DEMO_2, 3: DEMO_3 }[demoNum];
  if (!demo) return json({ ok: false, error: "bad_request" }, 400);

  if (!apiKey) return json(fallbackPayload(demo));

  try {
    const { results, ms } = await runDemo(apiKey, demo);
    return json({ ok: true, fallback: false, ms, results });
  } catch (e) {
    return json(fallbackPayload(demo));
  }
}

export async function onRequestGet() {
  return json({ ok: false, error: "method_not_allowed" }, 405);
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
