// Cloudflare Pages Function — functions/api/profile.js
// Live "what a fraud-grade signal stack sees about your visit" panel on /projects.
// The browser sends only the Fingerprint eventId it already generated on page
// load (window.INSIGHTS_VISITOR.eventId, from the site-insights-kit agent
// that already runs on every page). This function calls Fingerprint's Server
// API for that one event, adds Cloudflare's own edge network context, and
// returns a compact, display-ready readout. Nothing here is stored; it's
// shown only to the visitor who triggered it.
//
// Secret required: FINGERPRINT_SECRET_KEY (Cloudflare Pages > Settings >
// Environment variables, added as a *secret*, Production + Preview).
// Region: same "us" region already used for the client agent, so the global
// endpoint (api.fpjs.io) is correct. If the Fingerprint workspace is ever
// moved to the EU or Asia-Pacific region, change FP_API_BASE below to match.

const FP_API_BASE = "https://api.fpjs.io";
const TIMEOUT_MS = 10000;
const RATE_LIMIT_PER_HOUR = 20;

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

// Small, deliberately coarse ASN heuristic — the same kind of first-pass
// network classification fraud teams use before deeper review. Not a claim
// of certainty, just a label.
function classifyNetwork(cf) {
  const org = (cf && cf.asOrganization ? cf.asOrganization : "").toLowerCase();
  if (!org) return "Unknown network";
  const hosting = ["amazon", "google", "microsoft", "azure", "digitalocean", "ovh", "hetzner", "linode", "vultr", "oracle cloud", "cloudflare"];
  const mobile = ["t-mobile", "verizon wireless", "at&t mobility", "cellco", "sprint"];
  if (hosting.some((h) => org.includes(h))) return "Hosting / datacenter network";
  if (mobile.some((m) => org.includes(m))) return "Mobile carrier network";
  return "Consumer ISP network";
}

function returningVisitorText(firstSeenIso, lastSeenIso) {
  if (!firstSeenIso) return "No visit history available for this device.";
  const first = new Date(firstSeenIso);
  const now = new Date();
  const minutesSinceFirst = (now - first) / 60000;
  const firstSeenStr = first.toISOString().slice(0, 10);
  if (minutesSinceFirst < 5) return `New device (first seen just now).`;
  return `Returning device (first seen ${firstSeenStr}).`;
}

async function fetchEvent(secretKey, eventId) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${FP_API_BASE}/v4/events/${encodeURIComponent(eventId)}`, {
      headers: { "Auth-API-Key": secretKey },
      signal: controller.signal
    });
    if (!res.ok) throw new Error(`Fingerprint API ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const origin = request.headers.get("Origin");
  const url = new URL(request.url);
  if (origin && new URL(origin).host !== url.host) {
    return json({ ok: false, error: "forbidden" }, 403);
  }

  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  if (isRateLimited(ip)) {
    return json({ ok: false, error: "rate_limited", message: "Too many checks from this connection. Try again in a bit." }, 429);
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ ok: false, error: "bad_request" }, 400);
  }

  const eventId = body.eventId;
  if (!eventId || typeof eventId !== "string") {
    return json({ ok: false, error: "bad_request", message: "No device signal yet — reload the page and try again." }, 400);
  }

  const secretKey = env.FINGERPRINT_SECRET_KEY;
  if (!secretKey) {
    return json({ ok: false, error: "not_configured", message: "This demo isn't wired up yet — the site owner needs to add a Fingerprint API key." }, 200);
  }

  let data;
  try {
    data = await fetchEvent(secretKey, eventId);
  } catch (e) {
    // TEMP DEBUG: surface the safe failure detail (error name/message only,
    // never the secret itself) so we can tell auth vs network vs timeout
    // apart. Remove once the upstream issue is diagnosed.
    return json({ ok: false, error: "upstream_error", message: "Couldn't reach the device-intelligence service. Try again in a moment.", debug: { name: e && e.name, message: e && e.message, keyLen: secretKey ? secretKey.length : 0 } }, 200);
  }

  const products = data.products || {};
  const ident = (products.identification && products.identification.data) || {};
  const bot = (products.botd && products.botd.data && products.botd.data.bot) || {};
  const vpn = (products.vpn && products.vpn.data) || {};
  const proxy = (products.proxy && products.proxy.data) || {};
  const tor = (products.tor && products.tor.data) || {};
  const incognitoVal = typeof ident.incognito === "boolean" ? ident.incognito : null;

  const cf = request.cf || {};

  const result = {
    ok: true,
    confidence: typeof ident.confidence?.score === "number" ? ident.confidence.score : null,
    incognito: incognitoVal === null ? "Unknown" : incognitoVal ? "Yes, private/incognito browsing" : "No",
    bot: bot.result ? (bot.result === "notDetected" ? "Not detected" : bot.result === "bad" ? "Automated tool detected" : "Possible automation") : "Unknown",
    vpn: typeof vpn.result === "boolean" ? (vpn.result ? `Yes (confidence: ${vpn.confidence || "n/a"})` : "No") : "Unknown",
    proxy: typeof proxy.result === "boolean" ? (proxy.result ? `Yes (confidence: ${proxy.confidence || "n/a"})` : "No") : "Unknown",
    tor: typeof tor.result === "boolean" ? (tor.result ? "Yes" : "No") : "Unknown",
    country: (ident.ipLocation && ident.ipLocation.country && ident.ipLocation.country.name) || cf.country || "Unknown",
    network: classifyNetwork(cf),
    returning: returningVisitorText(ident.firstSeenAt?.global, ident.lastSeenAt?.global)
  };

  return json(result);
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
