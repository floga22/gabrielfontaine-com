// Cloudflare Pages Function — functions/api/profile.js
// Live "what a fraud-grade signal stack sees about your visit" panel on /projects.
// The browser sends only the Fingerprint eventId it already generated on page
// load (window.INSIGHTS_VISITOR.eventId, from the site-insights-kit agent
// that already runs on every page). This function calls Fingerprint's Server
// API for that one event, adds Cloudflare's own edge network context, and
// returns a rich, display-ready readout. Nothing here is stored server-side;
// it's shown only to the visitor who triggered it, for their own event.
//
// Secret required: FINGERPRINT_SECRET_KEY (Cloudflare Pages > Settings >
// Environment variables, added as a *secret*, Production + Preview).
// Auth: Fingerprint's v4 Server API uses Bearer token auth
// (Authorization: Bearer <secret key>), not the older Auth-API-Key header.
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

// Small, deliberately coarse ASN-name heuristic — the same kind of
// first-pass network classification fraud teams use before deeper review.
// Not a claim of certainty, just a label.
function classifyNetwork(orgName) {
  const org = (orgName || "").toLowerCase();
  if (!org) return "Unknown network";
  const hosting = ["amazon", "google", "microsoft", "azure", "digitalocean", "ovh", "hetzner", "linode", "vultr", "oracle cloud", "cloudflare"];
  const mobile = ["t-mobile", "verizon wireless", "at&t mobility", "cellco", "sprint"];
  if (hosting.some((h) => org.includes(h))) return "Hosting / datacenter network";
  if (mobile.some((m) => org.includes(m))) return "Mobile carrier network";
  return "Consumer ISP network";
}

function returningVisitorText(firstSeenMs) {
  if (!firstSeenMs) return "No visit history available for this device.";
  const first = new Date(firstSeenMs);
  const minutesSinceFirst = (Date.now() - first.getTime()) / 60000;
  const firstSeenStr = first.toISOString().slice(0, 10);
  if (minutesSinceFirst < 5) return "New device (first seen just now).";
  return `Returning device (first seen ${firstSeenStr}).`;
}

async function fetchEvent(secretKey, eventId) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${FP_API_BASE}/v4/events/${encodeURIComponent(eventId)}`, {
      headers: { "Authorization": `Bearer ${secretKey}` },
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
    return json({ ok: false, error: "upstream_error", message: "Couldn't reach the device-intelligence service. Try again in a moment." }, 200);
  }

  const ident = data.identification || {};
  const ipv4 = (data.ip_info && data.ip_info.v4) || {};
  const geo = ipv4.geolocation || {};
  const cf = request.cf || {};
  const asnName = ipv4.asn_name || null;

  const result = {
    ok: true,

    identity: {
      visitorId: ident.visitor_id || null,
      confidence: typeof ident.confidence?.score === "number" ? ident.confidence.score : null,
      confidenceVersion: ident.confidence?.version || null,
      visitorFound: !!ident.visitor_found,
      firstSeenAt: ident.first_seen_at || null,
      lastSeenAt: ident.last_seen_at || null,
      returning: returningVisitorText(ident.first_seen_at)
    },

    client: {
      device: data.device || "Unknown",
      os: data.os || "Unknown",
      osVersion: data.os_version || "",
      browser: (data.browser_details && data.browser_details.browser_name) || "Unknown",
      browserVersion: (data.browser_details && data.browser_details.browser_major_version) || ""
    },

    risk: {
      bot: data.bot || "unknown",
      incognito: typeof data.incognito === "boolean" ? data.incognito : null,
      vpn: typeof data.vpn === "boolean" ? data.vpn : null,
      vpnConfidence: data.vpn_confidence || null,
      vpnMethods: data.vpn_methods || null,
      vpnOriginCountry: data.vpn_origin_country || null,
      proxy: typeof data.proxy === "boolean" ? data.proxy : null,
      proxyConfidence: data.proxy_confidence || null,
      torNode: !!(data.ip_blocklist && data.ip_blocklist.tor_node),
      ipBlocklist: data.ip_blocklist || null,
      tampering: typeof data.tampering === "boolean" ? data.tampering : null,
      tamperingDetails: data.tampering_details || null,
      developerTools: !!data.developer_tools,
      virtualMachine: !!data.virtual_machine,
      privacySettings: !!data.privacy_settings,
      suspectScore: typeof data.suspect_score === "number" ? data.suspect_score : null,
      highActivityDevice: !!data.high_activity_device,
      rareDevice: !!data.rare_device,
      rareDevicePercentile: data.rare_device_percentile_bucket || null
    },

    network: {
      ip: data.ip_address || null,
      asn: ipv4.asn || null,
      asnName,
      asnType: ipv4.asn_type || null,
      datacenter: !!ipv4.datacenter_result,
      classification: classifyNetwork(asnName || cf.asOrganization),
      city: geo.city_name || cf.city || null,
      region: (geo.subdivisions && geo.subdivisions[0] && geo.subdivisions[0].name) || cf.region || null,
      country: geo.country_name || cf.country || "Unknown",
      countryCode: geo.country_code || cf.country || null,
      postalCode: geo.postal_code || cf.postalCode || null,
      latitude: typeof geo.latitude === "number" ? geo.latitude : (cf.latitude || null),
      longitude: typeof geo.longitude === "number" ? geo.longitude : (cf.longitude || null),
      timezone: geo.timezone || cf.timezone || null,
      accuracyRadiusKm: geo.accuracy_radius || null
    },

    edge: {
      colo: cf.colo || null,
      country: cf.country || null,
      city: cf.city || null,
      region: cf.region || null,
      postalCode: cf.postalCode || null,
      latitude: cf.latitude || null,
      longitude: cf.longitude || null,
      timezone: cf.timezone || null,
      asn: cf.asn || null,
      asOrganization: cf.asOrganization || null,
      isEUCountry: cf.isEUCountry || null,
      tlsVersion: cf.tlsVersion || null,
      tlsCipher: cf.tlsCipher || null,
      httpProtocol: cf.httpProtocol || null
    },

    velocity: data.velocity || null,

    raw: data
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
