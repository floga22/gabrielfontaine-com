// Cloudflare Pages Function — functions/api/ip.js
// Returns the visitor's public IP (from Cloudflare's CF-Connecting-IP header)
// plus location/ISP context. Primary enrichment: ip-api.com (free tier is
// HTTP-only, so it is called here, server-side, never from the browser).
// Fallback: Cloudflare's own request.cf data. Nothing is stored.
const TIMEOUT_MS = 4000;
const buckets = new Map();
function limited(ip) {
  const now = Date.now(), e = buckets.get(ip);
  if (!e || now - e.t > 3600000) { buckets.set(ip, { t: now, n: 1 }); return false; }
  return ++e.n > 30;
}
export async function onRequestGet({ request }) {
  const ip = request.headers.get("CF-Connecting-IP") || "";
  const cf = request.cf || {};
  if (limited(ip)) return json({ ok: false, error: "rate_limited" }, 429);
  const out = {
    ok: true, ip: ip || null, source: "cloudflare",
    city: cf.city || null, region: cf.region || null, country: cf.country || null,
    postalCode: cf.postalCode || null, timezone: cf.timezone || null,
    latitude: cf.latitude ? Number(cf.latitude) : null, longitude: cf.longitude ? Number(cf.longitude) : null,
    isp: cf.asOrganization || null, org: null, asn: cf.asn ? "AS" + cf.asn : null,
    mobile: null, proxy: null, hosting: null
  };
  if (ip) {
    const c = new AbortController(), t = setTimeout(() => c.abort(), TIMEOUT_MS);
    try {
      const r = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,countryCode,regionName,city,zip,lat,lon,timezone,isp,org,as,asname,mobile,proxy,hosting`, { signal: c.signal });
      const d = await r.json();
      if (d && d.status === "success") {
        Object.assign(out, {
          source: "ip-api.com", city: d.city || out.city, region: d.regionName || out.region,
          country: d.country || out.country, postalCode: d.zip || out.postalCode, timezone: d.timezone || out.timezone,
          latitude: typeof d.lat === "number" ? d.lat : out.latitude, longitude: typeof d.lon === "number" ? d.lon : out.longitude,
          isp: d.isp || out.isp, org: d.org || null, asn: d.as || out.asn,
          mobile: d.mobile, proxy: d.proxy, hosting: d.hosting
        });
      }
    } catch (e) { /* keep Cloudflare fallback */ } finally { clearTimeout(t); }
  }
  return json(out);
}
function json(o, s = 200) {
  return new Response(JSON.stringify(o), { status: s, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}
