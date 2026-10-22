// Cloudflare Pages middleware: reports known AI and search crawlers to the site-insights Worker.
// Crawlers don't run JavaScript, so the page tracker never sees them; this is the only place they show up.
// Off unless the CRAWLER_TOKEN secret is set (same value as the Worker's CRAWLER_TOKEN secret).
// The cheap regex below only decides whether to call the Worker; the Worker does the real classification
// and ignores anything it doesn't recognize, so a false positive here costs one tiny request.
const CRAWLER_RE = /gptbot|oai-searchbot|chatgpt-user|claudebot|claude-searchbot|claude-user|anthropic-ai|perplexity|mistralai-user|duckassistbot|youbot|applebot|bytespider|ccbot|amazonbot|cohere-ai|diffbot|imagesiftbot|timpibot|omgilibot|meta-external|facebookbot|facebookexternalhit|googleother|googlebot|bingbot|duckduckbot|yandexbot|baiduspider|petalbot|semrushbot|ahrefsbot|mj12bot|dotbot/i;
const STATIC_RE = /\.(css|js|map|png|jpe?g|gif|svg|ico|webp|avif|woff2?|ttf)$/i;
const DEFAULT_WORKER = "https://site-insights.gabrielfontaine.workers.dev";

export async function onRequest(context) {
  const { request, env, next, waitUntil } = context;
  const ua = request.headers.get("User-Agent") || "";
  if (!env.CRAWLER_TOKEN || !CRAWLER_RE.test(ua)) return next();

  const url = new URL(request.url);
  const response = await next();
  if (STATIC_RE.test(url.pathname)) return response;

  const cf = request.cf || {};
  const report = fetch((env.INSIGHTS_WORKER_URL || DEFAULT_WORKER).replace(/\/$/, "") + "/crawler", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + env.CRAWLER_TOKEN },
    body: JSON.stringify({
      ua,
      path: url.pathname,
      ip: request.headers.get("CF-Connecting-IP") || null,
      asn: cf.asn || null,
      asOrg: cf.asOrganization || null,
      country: cf.country || null,
      site: url.hostname,
      status: response.status
    })
  }).catch(() => {});
  if (waitUntil) waitUntil(report);
  return response;
}
