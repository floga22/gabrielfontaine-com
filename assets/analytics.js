/* Loads the site-insights-kit (GA4, Clarity, Fingerprint, Thumbmark) and tags every visit with its audience.
   Dev/preview hosts (*.pages.dev, localhost) skip tracking so test visits don't pollute production data;
   add ?insights=on to a dev URL to test it. Public IDs only. */
(function () {
  "use strict";
  var aud = document.documentElement.getAttribute("data-audience") || "candidate";
  var host = location.hostname, qs = new URLSearchParams(location.search);
  var dev = /\.pages\.dev$/.test(host) || host === "localhost" || host === "127.0.0.1";
  if (dev && qs.get("insights") !== "on") { window.INSIGHTS_DEV = true; return; }
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag("set", "user_properties", { audience: aud });
  window.INSIGHTS_CONFIG = {
    site: "gabrielfontaine.com",
    ownerName: "Gabriel Fontaine",
    contactEmail: "privacy@gabrielfontaine.com",
    consent: "none",
    ga4: "G-Z56L1BHZS1",
    clarity: "yo1qncaepu",
    fingerprint: { key: "71BAprWdJzzeJSgcyPcL", region: "us", endpoint: "https://metrics.gabrielfontaine.com" },
    thumbmark: { key: "da8fe149e77a5fdd9a0f5847f85e64ee" }, // public key; locked to gabrielfontaine.com in the Thumbmark console
    worker: "https://site-insights.gabrielfontaine.workers.dev",
    clickstream: true,
    debug: false
  };
  var s = document.createElement("script");
  s.src = "https://cdn.jsdelivr.net/gh/floga22/site-insights-kit@v1.3.0/src/insights.js";
  s.async = true;
  document.head.appendChild(s);
  // Tag Clarity sessions with the audience and landing path once Clarity is up
  var n = 0, t = setInterval(function () {
    if (typeof window.clarity === "function") {
      window.clarity("set", "audience", aud);
      window.clarity("set", "page_path", location.pathname);
      clearInterval(t);
    } else if (++n > 60) clearInterval(t);
  }, 250);
})();
