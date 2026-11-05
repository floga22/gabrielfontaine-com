/* Projects page: "On this page" navigation with focus, Stack Landscape preview card, and the detected-vendor list.
   Vendor names and counts come from /assets/rollup.js, the same file the Stack Landscape page uses. */
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var esc = function (s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); };

  // ---------- table of contents + focus ----------
  var toc = document.getElementById("pnToc");
  var links = toc ? Array.prototype.slice.call(toc.querySelectorAll("a[data-target]")) : [];
  var articles = Array.prototype.slice.call(document.querySelectorAll("article.proj"));

  // The project you are in is the active TOC link; the other projects are softened so it is obvious where you are.
  function setActive(id) {
    links.forEach(function (a) {
      var on = a.getAttribute("data-target") === id;
      a.classList.toggle("on", on);
      if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
    });
    articles.forEach(function (art) {
      art.classList.toggle("pn-dim", !!id && art.id !== id);
      art.classList.toggle("pn-focus", !!id && art.id === id);
    });
  }

  function focusProject(id) {
    var target = document.getElementById(id);
    if (!target) return;
    articles.forEach(function (art) {
      var panels = art.querySelectorAll("details.tryd");
      panels.forEach(function (d, i) {
        if (art === target) { d.open = (i === 0); } else { d.open = false; }
      });
    });
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    setActive(id);
    try { history.replaceState(null, "", "#" + id); } catch (e) {}
  }

  links.forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      focusProject(a.getAttribute("data-target"));
    });
  });

  if ("IntersectionObserver" in window && articles.length) {
    var visible = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { visible[en.target.id] = en.isIntersecting; });
      var any = false;
      for (var i = 0; i < articles.length; i++) {
        if (visible[articles[i].id]) { setActive(articles[i].id); any = true; break; }
      }
      if (!any) setActive(null);
    }, { rootMargin: "-25% 0px -60% 0px", threshold: 0 });
    articles.forEach(function (a) { io.observe(a); });
  }

  // Opening a "Try it" bar inside a project closes the other bars in that same project, so one thing is open at a time.
  articles.forEach(function (art) {
    var panels = Array.prototype.slice.call(art.querySelectorAll("details.tryd"));
    panels.forEach(function (d) {
      d.addEventListener("toggle", function () {
        if (!d.open) return;
        panels.forEach(function (o) { if (o !== d) o.open = false; });
      });
    });
  });

  // ---------- Stack Landscape card + vendor list ----------
  var R = window.ROLLUP;
  if (!R) return;
  var set = function (id, v) { var el = document.getElementById(id); if (el) el.textContent = v; };
  set("pnSites", R.totalSites.toLocaleString());
  set("pnVendorsN", R.vendors.length);
  set("pnCatsN", R.buckets.length);

  var host = document.getElementById("pnVendors");
  if (!host) return;
  var order = ["Bot & Traffic Management", "Challenge / CAPTCHA", "Device & Behavioral Intelligence", "Fraud & Risk Platforms", "Identity & Account Linking"];
  var html = "";
  order.forEach(function (name) {
    var b = R.buckets.filter(function (x) { return x.name === name; })[0];
    if (!b) return;
    var vs = R.vendors.filter(function (v) { return v.bucket === name; }).sort(function (x, y) { return y.siteCount - x.siteCount; });
    html += '<details class="pn-vc"><summary><span class="pn-dot" style="background:' + b.color + '"></span><b>' + esc(name) +
      '</b><em>' + vs.length + ' vendors · ' + b.siteCount + ' sites</em><span class="chev"></span></summary><ul>' +
      vs.map(function (v) { return '<li><span>' + esc(v.shortName) + '</span><i>' + v.siteCount + '</i></li>'; }).join("") +
      '</ul></details>';
  });
  host.innerHTML = html;
})();
