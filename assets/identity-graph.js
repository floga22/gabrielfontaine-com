/* Identity graph teaser + explorer for gabrielfontaine.com
   Self-contained: finds every [data-identity-graph] mount, renders an animated teaser card,
   and opens a full interactive explorer in a modal. d3 (selection, force, drag, zoom) loads
   lazily from /assets/d3-graph.min.js the first time a card scrolls into view.
   All people, emails, phones, addresses, tokens and SSNs are fictional.
   Icons: Tabler Icons (c) Pawel Kuna, MIT License, https://tabler.io/icons */
(function () {
  "use strict";
  var ICONS = {"user":"<path d=\"M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0\" /> <path d=\"M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2\" />","mail":"<path d=\"M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z\" /> <path d=\"M3 7l9 6l9 -6\" />","phone":"<path d=\"M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2\" />","world":"<path d=\"M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0\" /> <path d=\"M3.6 9h16.8\" /> <path d=\"M3.6 15h16.8\" /> <path d=\"M11.5 3a17 17 0 0 0 0 18\" /> <path d=\"M12.5 3a17 17 0 0 1 0 18\" />","home":"<path d=\"M5 12l-2 0l9 -9l9 9l-2 0\" /> <path d=\"M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7\" /> <path d=\"M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6\" />","building":"<path d=\"M3 21l18 0\" /> <path d=\"M9 8l1 0\" /> <path d=\"M9 12l1 0\" /> <path d=\"M9 16l1 0\" /> <path d=\"M14 8l1 0\" /> <path d=\"M14 12l1 0\" /> <path d=\"M14 16l1 0\" /> <path d=\"M5 21v-16a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v16\" />","mailbox":"<path d=\"M10 21v-6.5a3.5 3.5 0 0 0 -7 0v6.5h18v-6a4 4 0 0 0 -4 -4h-10.5\" /> <path d=\"M12 11v-8h4l2 2l-2 2h-4\" /> <path d=\"M6 15h1\" />","package":"<path d=\"M12 3l8 4.5l0 9l-8 4.5l-8 -4.5l0 -9l8 -4.5\" /> <path d=\"M12 12l8 -4.5\" /> <path d=\"M12 12l0 9\" /> <path d=\"M12 12l-8 -4.5\" /> <path d=\"M16 5.25l-8 4.5\" />","credit-card":"<path d=\"M3 5m0 3a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3z\" /> <path d=\"M3 10l18 0\" /> <path d=\"M7 15l.01 0\" /> <path d=\"M11 15l2 0\" />","cake":"<path d=\"M3 20h18v-8a3 3 0 0 0 -3 -3h-12a3 3 0 0 0 -3 3v8z\" /> <path d=\"M3 14.803c.312 .135 .654 .204 1 .197a2.4 2.4 0 0 0 2 -1a2.4 2.4 0 0 1 2 -1a2.4 2.4 0 0 1 2 1a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1a2.4 2.4 0 0 1 2 -1a2.4 2.4 0 0 1 2 1a2.4 2.4 0 0 0 2 1c.35 .007 .692 -.062 1 -.197\" /> <path d=\"M12 4l1.465 1.638a2 2 0 1 1 -3.015 .099l1.55 -1.737z\" />","id":"<path d=\"M3 4m0 3a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v10a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3z\" /> <path d=\"M9 10m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" /> <path d=\"M15 8l2 0\" /> <path d=\"M15 12l2 0\" /> <path d=\"M7 16l10 0\" />","building-bank":"<path d=\"M3 21l18 0\" /> <path d=\"M3 10l18 0\" /> <path d=\"M5 6l7 -3l7 3\" /> <path d=\"M4 10l0 11\" /> <path d=\"M20 10l0 11\" /> <path d=\"M8 14l0 3\" /> <path d=\"M12 14l0 3\" /> <path d=\"M16 14l0 3\" />","coins":"<path d=\"M9 14c0 1.657 2.686 3 6 3s6 -1.343 6 -3s-2.686 -3 -6 -3s-6 1.343 -6 3z\" /> <path d=\"M9 14v4c0 1.656 2.686 3 6 3s6 -1.344 6 -3v-4\" /> <path d=\"M3 6c0 1.072 1.144 2.062 3 2.598s4.144 .536 6 0c1.856 -.536 3 -1.526 3 -2.598c0 -1.072 -1.144 -2.062 -3 -2.598s-4.144 -.536 -6 0c-1.856 .536 -3 1.526 -3 2.598z\" /> <path d=\"M3 6v10c0 .888 .772 1.45 2 2\" /> <path d=\"M3 11c0 .888 .772 1.45 2 2\" />","fingerprint":"<path d=\"M18.9 7a8 8 0 0 1 1.1 5v1a6 6 0 0 0 .8 3\" /> <path d=\"M8 11a4 4 0 0 1 8 0v1a10 10 0 0 0 2 6\" /> <path d=\"M12 11v2a14 14 0 0 0 2.5 8\" /> <path d=\"M8 15a18 18 0 0 0 1.8 6\" /> <path d=\"M4.9 19a22 22 0 0 1 -.9 -7v-1a8 8 0 0 1 12 -6.95\" />","alert-triangle":"<path d=\"M12 9v4\" /> <path d=\"M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z\" /> <path d=\"M12 16h.01\" />","database":"<path d=\"M12 6m-8 0a8 3 0 1 0 16 0a8 3 0 1 0 -16 0\" /> <path d=\"M4 6v6a8 3 0 0 0 16 0v-6\" /> <path d=\"M4 12v6a8 3 0 0 0 16 0v-6\" />","scale":"<path d=\"M7 20l10 0\" /> <path d=\"M6 6l6 -1l6 1\" /> <path d=\"M12 3l0 17\" /> <path d=\"M9 12l-3 -6l-3 6a3 3 0 0 0 6 0\" /> <path d=\"M21 12l-3 -6l-3 6a3 3 0 0 0 6 0\" />","arrows-maximize":"<path d=\"M16 4l4 0l0 4\" /> <path d=\"M14 10l6 -6\" /> <path d=\"M8 20l-4 0l0 -4\" /> <path d=\"M4 20l6 -6\" /> <path d=\"M16 20l4 0l0 -4\" /> <path d=\"M14 14l6 6\" /> <path d=\"M8 4l-4 0l0 4\" /> <path d=\"M4 4l6 6\" />","x":"<path d=\"M18 6l-12 12\" /> <path d=\"M6 6l12 12\" />","arrow-right":"<path d=\"M5 12l14 0\" /> <path d=\"M13 18l6 -6\" /> <path d=\"M13 6l6 6\" />","device-mobile":"<path d=\"M6 5a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2v-14z\" /> <path d=\"M11 4h2\" /> <path d=\"M12 17v.01\" />","link":"<path d=\"M9 15l6 -6\" /> <path d=\"M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464\" /> <path d=\"M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463\" />","shield-check":"<path d=\"M11.46 20.846a12 12 0 0 1 -7.96 -14.846a12 12 0 0 0 8.5 -3a12 12 0 0 0 8.5 3a12 12 0 0 1 -.09 7.06\" /> <path d=\"M15 19l2 2l4 -4\" />","message-circle":"<path d=\"M3 20l1.3 -3.9c-2.324 -3.437 -1.426 -7.872 2.1 -10.374c3.526 -2.501 8.59 -2.296 11.845 .48c3.255 2.777 3.695 7.266 1.029 10.501c-2.666 3.235 -7.615 4.215 -11.574 2.293l-4.7 1\" />"};
  var D3_SRC = "/assets/d3-graph.min.js?v=5094cf9c";
  var mounts = document.querySelectorAll("[data-identity-graph]");
  if (!mounts.length) return;

  function ico(name, size, sw) {
    return '<svg class="idg-i" viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="' + (sw || 2) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + ICONS[name] + "</svg>";
  }
  function track(name, params) {
    try { if (typeof window.gtag === "function") window.gtag("event", name, params || {}); } catch (e) {}
    try { if (typeof window.clarity === "function") window.clarity("event", name); } catch (e) {}
  }

  /* ---------- copy you may want to edit ---------- */
  var CFG = {
    patterns: {
      good: { title: "Good actor", look: "Small and mostly self-contained. Email, phone, date of birth and SSN are unique to the person. Any sharing is ordinary: a household address, a home IP, a joint card, a workplace network. Activity is steady and spread across a few merchants and banks. This is the baseline everything else is compared against.", tags: ["Unique identifiers", "Household overlap only", "Steady volume"] },
      fraud: { title: "Fraudster", look: "Hub and spoke. Several supposedly different people converge on the same mail drop, reship address and proxy IP, and pass card tokens between them. Emails and phones are all distinct, so field-level checks pass. The heaviest lines sit on attributes that are hard to share legitimately.", tags: ["Shared mail drop", "Proxy IP", "Card token swapping", "Reship address"] },
      bust: { title: "Bust-out", look: "Looks like a good customer first: normal logins, several cards, healthy spend. The tell is velocity and control: thick dashed lines to several lenders at once, a shared freight drop, and an authorized-user card tied to a partner. The accounts are built to be maxed out and abandoned.", tags: ["Lender application burst", "Multiple cards", "Shared drop point", "Looks clean early"] },
      syn: { title: "Synthetic ID", look: "Thin and stitched together. Very little real activity (thin e-commerce lines) but a lot of credit applications. One commercial mailbox, a phone, an SSN fragment and a date of birth are reused across supposedly separate people, each with a fresh email.", tags: ["SSN / DOB reuse", "Commercial mailbox", "Few transactions", "Many applications"] }
    },
    lenses: {
      idv: { icon: "fingerprint", label: "Identity verification", title: "Identity verification",
        text: "Every field here passes its own check: valid emails, working phone numbers, plausible birth dates and SSNs. Verification asks whether the data is genuine and consistent. The graph asks the second question: who else is using it?",
        proof: [{ t: "Directed the USIS Credit Header API and Purpose View governance framework; led DIT 1.0/2.0 and the RAE risk engine." }],
        note: "Dots are gray on purpose: identity checks alone cannot tell these people apart. Faded icons are attributes outside this lens.",
        preset: { mode: "neutral", shared: false, focus: ["em", "ph", "db", "ss"] } },
      fraud: { icon: "alert-triangle", label: "Fraud detection", title: "Fraud detection and prevention",
        text: "Strip out everything unshared and the rings, synthetic clusters and bust-out pairs surface. Each field looks clean; what gives them away is how they are shared: a mail drop, a proxy IP, a passed-around card token.",
        proof: [{ t: "Directed the RAE risk engine, which served 11 tenants across 17 identity-verification, device-assessment and authentication workflows." }],
        note: "Colors show who is who. Only attributes shared by two or more people are drawn.",
        preset: { mode: "class", shared: true, focus: null } },
      aml: { icon: "building-bank", label: "AML / KYC", title: "AML, KYC and compliance",
        text: "Follow who controls the accounts and where activity lands: common addresses, shared control points, and the same identities touching multiple banks and lenders. This is where onboarding, monitoring and investigation meet.",
        proof: [{ t: "Fluent in FCRA, GLBA, KYC, KYB and AML, including the identity-versus-creditworthiness line most fraud teams miss." }],
        note: "Colors show each group. Bright icons are banks, lenders and addresses, where money and control show up. Everything else is faded.",
        preset: { mode: "class", shared: false, focus: ["bk", "ld", "ma", "sa"] } },
      data: { icon: "database", label: "Data", title: "Data quality and entity resolution",
        text: "Messy records collapse into households, clusters and rings. The colors here are connected components: groups of people linked by at least one shared attribute, the same idea behind entity resolution and network features fed to models.",
        proof: [{ t: "Built FReD (Frequency, Recency, Duration), a patent-pending model that turns many timestamped, as-entered addresses, phones and emails into a ranked, scored list of true uniques." }, { t: "Set the standards that cleaned and validated PII before it reached the discovery service." }],
        note: "Colors mark connected clusters: people linked by a shared attribute share a color.",
        preset: { mode: "cluster", shared: true, focus: null } },
      risk: { icon: "scale", label: "Risk decisioning", title: "Risk assessment and decisioning",
        text: "Network signals become features and a score, and the score becomes an action: approve, review or decline. Notice who lands in Review. Bust-out accounts look fine until lender velocity is added, which is why decisioning blends network and behavior signals.",
        proof: [{ t: "Built Jev, a fast, explainable AI decision engine, with three live demos.", href: "/projects#jev", a: "Try Jev" }],
        note: "Colors show the decision: green Approve, amber Review, red Decline.",
        preset: { mode: "decision", shared: false, focus: null } }
    },
    next: { good: ["fraud", "Fraudster"], fraud: ["bust", "Bust-out"], bust: ["syn", "Synthetic ID"], syn: ["all", "everyone together"] }
  };

  /* ---------- data (fictional) ---------- */
  var CL = { good: ["#9FE1CB", "#0F6E56", "Good actor"], fraud: ["#F7C1C1", "#A32D2D", "Fraudster"], bust: ["#FAC775", "#854F0B", "Bust-out"], syn: ["#CECBF6", "#534AB7", "Synthetic ID"] };
  var DC = { approve: ["#9FE1CB", "#0F6E56", "Approve"], review: ["#FAC775", "#854F0B", "Review"], decline: ["#F7C1C1", "#A32D2D", "Decline"] };
  var PAL = [["#F5C4B3", "#993C1D"], ["#B5D4F4", "#185FA5"], ["#C0DD97", "#3B6D11"], ["#FAC775", "#854F0B"], ["#CECBF6", "#534AB7"]];
  var NEU = ["#D3D1C7", "#5F5E5A"];
  var TN = { dv: "Device", em: "Email", ph: "Phone", ip: "IP address", ma: "Mailing address", sa: "Shipping address", cd: "Payment token", bk: "", ld: "", db: "Date of birth", ss: "SSN" };
  var SHT = { dv: 1, em: 1, ph: 1, ip: 1, ma: 1, sa: 1, cd: 1, db: 1, ss: 1 };
  var WT = { em: 4, ph: 3, ss: 6, db: 1, cd: 2, ip: 0.5, ma: 0.5, sa: 0.75 };
  var ET = { e: "e-commerce", a: "credit app", l: "bank login", c: "step-up challenge" };
  var DASH = { e: null, a: "7 4", l: "2 4", c: "10 3 2 3" };
  var METH = { doc: ["id", "License scan", 3], passkey: ["fingerprint", "Passkey", 4], link: ["link", "Email link", 2], otp: ["message-circle", "Text or email code", 1] };
  var AS = { high: ["#85B7EB", "#0C447C", "High"], medium: ["#B5D4F4", "#185FA5", "Medium"], low: ["#E6F1FB", "#378ADD", "Low", "#185FA5"] };
  function iconName(d) {
    if (d.t === "p") return "user";
    if (d.t === "ma") return /PO Box/.test(d.lb) ? "mailbox" : /Plaza|Suite/.test(d.lb) ? "building" : "home";
    return { dv: "device-mobile", em: "mail", ph: "phone", ip: "world", sa: "package", cd: "credit-card", bk: "building-bank", ld: "coins", db: "cake", ss: "id" }[d.t];
  }
  var R = {
    Mary: ["good", [["em:mary@gmail.com", "a", 1], ["ph:404-555-0142", "a", 1], ["db:1984-06-12", "a", 1], ["ss:***-**-3381", "a", 1], ["ma:12 Oak Ln", "a", 1], ["sa:12 Oak Ln", "e", 14], ["ip:198.51.100.21", "e", 30], ["cd:tok_7c21ab9f", "e", 18], ["cd:tok_1de904a3", "e", 22], ["bk:Bank A", "l", 20], ["bk:Bank B", "l", 5], ["ld:Lender A", "a", 1]]],
    Tom: ["good", [["em:tom.h@outlook.com", "a", 1], ["ph:404-555-0177", "a", 1], ["db:1982-11-03", "a", 1], ["ss:***-**-7720", "a", 1], ["ma:12 Oak Ln", "a", 1], ["sa:12 Oak Ln", "e", 9], ["ip:198.51.100.21", "e", 22], ["cd:tok_7c21ab9f", "e", 12], ["bk:Bank A", "l", 6]]],
    Amy: ["good", [["em:amy_r@gmail.com", "a", 1], ["ph:678-555-0119", "a", 1], ["db:1990-02-27", "a", 1], ["ss:***-**-5094", "a", 1], ["ma:300 Elm St", "a", 1], ["sa:300 Elm St", "e", 11], ["ip:192.0.2.44", "e", 19], ["cd:tok_a4402f6e", "e", 16], ["bk:Bank A", "l", 14], ["bk:Bank C", "l", 9], ["ld:Lender B", "a", 1]]],
    Grace: ["good", [["em:grace.l@yahoo.com", "a", 1], ["ph:770-555-0163", "a", 1], ["db:1978-09-15", "a", 1], ["ss:***-**-2266", "a", 1], ["ma:55 Pine Ct", "a", 1], ["sa:55 Pine Ct", "e", 8], ["sa:Work Suite 200", "e", 5], ["ip:192.0.2.90", "e", 12], ["ip:203.0.113.7", "l", 10], ["cd:tok_3b8e71d2", "e", 10], ["bk:Bank B", "l", 18]]],
    Paul: ["good", [["em:paul.w@gmail.com", "a", 1], ["ph:404-555-0188", "a", 1], ["db:1969-01-30", "a", 1], ["ss:***-**-8843", "a", 1], ["ma:9 Birch Rd", "a", 1], ["sa:9 Birch Rd", "e", 6], ["ip:192.0.2.57", "e", 9], ["cd:tok_e19c05b7", "e", 7], ["bk:Bank C", "l", 11]]],
    Carlos: ["good", [["em:cmartin@hotmail.com", "a", 1], ["ph:470-555-0125", "a", 1], ["db:1986-07-21", "a", 1], ["ss:***-**-1907", "a", 1], ["ma:41 Lake Dr", "a", 1], ["sa:41 Lake Dr", "e", 15], ["ip:198.51.100.77", "e", 24], ["ip:203.0.113.7", "l", 8], ["cd:tok_5a7d33c8", "e", 20], ["bk:Bank A", "l", 13], ["ld:Lender A", "a", 1]]],
    Rick: ["fraud", [["em:shopper32@hotmail.com", "a", 1], ["ph:404-555-0301", "a", 1], ["db:1988-04-02", "a", 1], ["ss:***-**-4417", "a", 1], ["ma:PO Box 4471", "a", 1], ["sa:88 Dock St", "e", 26], ["ip:203.0.113.50", "e", 40], ["ip:203.0.113.51", "l", 12], ["cd:tok_c0ffee01", "e", 30], ["cd:tok_bad11a22", "e", 28], ["bk:Bank A", "l", 4], ["bk:Bank B", "l", 6], ["ld:Lender B", "a", 1]]],
    Sam: ["fraud", [["em:s.kravets77@mail.ru", "a", 1], ["ph:678-555-0302", "a", 1], ["db:1988-04-02", "a", 1], ["ss:***-**-9052", "a", 1], ["ma:PO Box 4471", "a", 1], ["sa:88 Dock St", "e", 22], ["ip:203.0.113.50", "e", 33], ["ip:203.0.113.51", "l", 9], ["cd:tok_bad11a22", "e", 25], ["cd:tok_9e7f4d10", "e", 21], ["bk:Bank B", "l", 7], ["bk:Bank C", "l", 5]]],
    Omar: ["fraud", [["em:omar.deals@mail.ru", "a", 1], ["ph:404-555-0303", "a", 1], ["db:1993-12-19", "a", 1], ["ss:***-**-6638", "a", 1], ["ma:PO Box 4471", "a", 1], ["sa:88 Dock St", "e", 18], ["sa:17 Cargo Way", "e", 12], ["ip:203.0.113.50", "e", 28], ["ip:203.0.113.52", "l", 8], ["cd:tok_9e7f4d10", "e", 19], ["cd:tok_2a6b8c33", "e", 24], ["bk:Bank A", "l", 5], ["ld:Lender C", "a", 1]]],
    Joe: ["bust", [["em:joe.b@gmail.com", "a", 1], ["ph:470-555-0201", "a", 1], ["db:1985-05-08", "a", 1], ["ss:***-**-2419", "a", 1], ["ma:700 Ridge Blvd", "a", 1], ["sa:700 Ridge Blvd", "e", 12], ["sa:22 Freight Ln", "e", 20], ["ip:198.51.100.140", "e", 28], ["ip:192.0.2.150", "l", 14], ["cd:tok_11aa22bb", "e", 34], ["cd:tok_22bb33cc", "e", 31], ["cd:tok_33cc44dd", "e", 29], ["ld:Lender A", "a", 3], ["ld:Lender B", "a", 3], ["ld:Lender C", "a", 2], ["bk:Bank A", "l", 12], ["bk:Bank B", "l", 10]]],
    Dave: ["bust", [["em:dave.m@yahoo.com", "a", 1], ["ph:770-555-0202", "a", 1], ["db:1987-08-24", "a", 1], ["ss:***-**-3175", "a", 1], ["ma:700 Ridge Blvd", "a", 1], ["sa:22 Freight Ln", "e", 18], ["ip:192.0.2.150", "l", 11], ["ip:198.51.100.141", "e", 22], ["cd:tok_33cc44dd", "e", 17], ["cd:tok_44dd55ee", "e", 26], ["ld:Lender A", "a", 2], ["ld:Lender B", "a", 2], ["ld:Lender C", "a", 2], ["bk:Bank B", "l", 8]]],
    Lena: ["syn", [["em:lena.k91@gmail.com", "a", 1], ["ph:404-555-0401", "a", 2], ["db:1997-01-01", "a", 1], ["ss:***-**-6120", "a", 2], ["ma:2100 Peach Plaza #310", "a", 2], ["sa:2100 Peach Plaza #310", "e", 3], ["ip:203.0.113.90", "e", 4], ["cd:tok_5e0a11f4", "e", 5], ["ld:Lender A", "a", 4], ["ld:Lender B", "a", 3], ["ld:Lender C", "a", 3]]],
    Nina: ["syn", [["em:nina.p2024@outlook.com", "a", 1], ["ph:404-555-0401", "a", 2], ["db:1999-03-09", "a", 1], ["ss:***-**-6120", "a", 2], ["ma:2100 Peach Plaza #310", "a", 2], ["sa:2100 Peach Plaza #310", "e", 2], ["ip:192.0.2.201", "e", 3], ["cd:tok_5e0a11f4", "e", 4], ["ld:Lender A", "a", 3], ["ld:Lender B", "a", 2], ["bk:Bank C", "l", 2]]],
    Kim: ["syn", [["em:kim.tr4n@mail.ru", "a", 1], ["ph:678-555-0403", "a", 1], ["db:1997-01-01", "a", 1], ["ss:***-**-0784", "a", 1], ["ma:2100 Peach Plaza #310", "a", 2], ["sa:2100 Peach Plaza #310", "e", 2], ["ip:203.0.113.90", "e", 3], ["cd:tok_71f4d0a9", "e", 3], ["ld:Lender C", "a", 3], ["ld:Lender B", "a", 3], ["bk:Bank C", "l", 1]]]
  };

  /* Step-up challenges: [device, methods passed, days since the last pass]. Illustrative. */
  var CH = {
    Mary: [["Mary's phone", ["passkey"], 3]], Tom: [["Tom's laptop", ["passkey"], 10]], Amy: [["Amy's phone", ["doc", "passkey"], 5]],
    Grace: [["Grace's phone", ["link"], 60]], Paul: [["Paul's phone", ["otp"], 200]], Carlos: [["Carlos's phone", ["passkey"], 7]],
    Rick: [["Ring device 1", ["link", "otp"], 2]], Sam: [["Ring device 1", ["otp"], 3]], Omar: [["Ring device 1", ["otp"], 5]],
    Joe: [["Joe's phone", ["doc", "passkey"], 400]], Dave: [["Dave's phone", ["doc"], 420]],
    Lena: [["Ring device 2", ["doc"], 12]], Nina: [["Ring device 2", ["doc"], 22]], Kim: [["Ring device 2", ["link"], 35]]
  };
  /* First and last seen, in days ago. Deterministic pseudo-random within a range per kind of actor. */
  function hs(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; }
  var RNG = { good: [500, 3500, 0, 20], fraud: [12, 110, 0, 4], bust: [350, 1100, 0, 10], syn: [25, 200, 2, 40] };
  var OV = { "fraud:ss": [900, 3000, 0, 4], "bust:ld": [5, 30, 0, 10], "syn:ss": [60, 200, 2, 40] };
  function seenFor(cls, who, key, t) {
    if (t === "db") return null;
    var r = OV[cls + ":" + t] || RNG[cls], f = Math.round(r[0] + hs(who + key + "f") * (r[1] - r[0])), l = Math.round(r[2] + hs(who + key + "l") * (r[3] - r[2]));
    return { first: f, last: Math.min(l, f) };
  }
  function ago(d) { if (d <= 0) return "today"; if (d < 45) return d + "d ago"; if (d < 730) return Math.round(d / 30) + " mo ago"; return (d / 365).toFixed(1) + " yr ago"; }

  function build() {
    var people = [], attrs = {}, links = [];
    Object.keys(R).forEach(function (name) {
      var v = R[name], p = { id: name, t: "p", cls: v[0], lb: name };
      people.push(p);
      v[1].forEach(function (r) {
        var key = r[0];
        if (!attrs[key]) attrs[key] = { id: key, t: key.slice(0, 2), lb: key.slice(3), ppl: [] };
        attrs[key].ppl.push(p);
        var sn = seenFor(v[0], name, key, key.slice(0, 2));
        links.push({ source: p, target: attrs[key], k: r[1], c: r[2], first: sn ? sn.first : null, last: sn ? sn.last : null });
      });
      (CH[name] || []).forEach(function (ch) {
        var key = "dv:" + ch[0];
        if (!attrs[key]) attrs[key] = { id: key, t: "dv", lb: ch[0], ppl: [] };
        attrs[key].ppl.push(p);
        links.push({ source: p, target: attrs[key], k: "c", c: ch[1].length, ms: ch[1], first: ch[2], last: ch[2] });
      });
    });
    var al = Object.keys(attrs).map(function (k) { return attrs[k]; });
    al.forEach(function (a) { a.shared = !!SHT[a.t] && a.ppl.length >= 2; });
    links.forEach(function (l) {
      var t = l.target; if (l.first == null) return;
      t.first = t.first == null ? l.first : Math.max(t.first, l.first);
      t.last = t.last == null ? l.last : Math.min(t.last, l.last);
    });
    var par = new Map(); people.forEach(function (p) { par.set(p, p); });
    function f(x) { while (par.get(x) !== x) { par.set(x, par.get(par.get(x))); x = par.get(x); } return x; }
    al.filter(function (a) { return a.shared && a.t !== "dv"; }).forEach(function (a) { a.ppl.slice(1).forEach(function (q) { par.set(f(q), f(a.ppl[0])); }); });
    var sizes = new Map(); people.forEach(function (p) { var r = f(p); sizes.set(r, (sizes.get(r) || 0) + 1); });
    var roots = []; sizes.forEach(function (n, r) { if (n > 1) roots.push(r); });
    people.forEach(function (p) {
      var r = f(p); p.csize = sizes.get(r); p.comp = p.csize > 1 ? roots.indexOf(r) : -1;
      var s = 0, lv = 0;
      links.forEach(function (l) {
        if (l.source !== p || l.k === "c") return;
        if (l.target.shared) s += WT[l.target.t] * (l.target.ppl.length - 1);
        if (l.target.t === "ld") lv += l.c;
      });
      if (lv >= 6) s += 4;
      if (p.csize >= 3) s += 3;
      p.score = s; p.dec = s >= 10 ? "decline" : s >= 5 ? "review" : "approve";
      var best = null, sd = false;
      links.forEach(function (l) {
        if (l.source !== p || l.k !== "c") return;
        if (l.target.ppl.length >= 2) sd = true;
        l.ms.forEach(function (m) {
          var v = METH[m][2] * (l.first <= 30 ? 1 : l.first <= 90 ? 0.7 : l.first <= 180 ? 0.4 : 0.2);
          if (!best || v > best.v) best = { v: v, m: m, d: l.first };
        });
      });
      p.as = null;
      if (best) { var sc = best.v - (sd ? 2 : 0); p.as = { v: sc, lvl: sc >= 2.5 ? "high" : sc >= 1.2 ? "medium" : "low", best: best.m, d: best.d, flag: sd }; }
    });
    return { people: people, al: al, links: links, all: people.concat(al) };
  }

  /* ---------- graph engine (teaser and explorer) ---------- */
  function createGraph(svgEl, o) {
    var d3 = window.IDG3, mini = !!o.mini;
    var svg = d3.select(svgEl); svg.selectAll("*").remove();
    var W = svgEl.clientWidth || 380, H = svgEl.clientHeight || 300;
    var sc = mini ? 0.45 : Math.max(0.6, Math.min(1, W / 720));
    var D = build(), people = D.people, al = D.al, links = D.links, all = D.all;
    function jit() { return { x: W / 2 + (Math.random() - 0.5) * W * 0.7, y: H / 2 + (Math.random() - 0.5) * H * 0.7 }; }
    all.forEach(function (n) { Object.assign(n, jit()); });
    var S = { e: true, a: true, l: true, shared: false, mode: "neutral", cls: { good: true, fraud: true, bust: true, syn: true }, min: 1, focus: null, sel: null, c: false, recent: false, fresh: false };
    function sw(c) { return (1 + Math.min(Math.sqrt(c) * 0.8, 6)) * (mini ? 0.5 : 1); }
    var root = svg.append("g"), lg = root.append("g"), ng = root.append("g");
    if (!mini) svg.call(d3.zoom().scaleExtent([0.4, 4]).on("zoom", function (ev) { root.attr("transform", ev.transform); })).on("dblclick.zoom", null);
    var lk = lg.selectAll("line"), nd = ng.selectAll("g.idg-node"), vis = [], vl = [];
    var sim = d3.forceSimulation(all)
      .force("link", d3.forceLink().distance(function (d) { return (75 - Math.min(d.c, 40) * 0.6) * sc; }).strength(function (d) { return 0.3 + Math.min(d.c, 40) / 100; }))
      .force("charge", d3.forceManyBody().strength(-150 * sc * sc))
      .force("x", d3.forceX(W / 2).strength(0.09)).force("y", d3.forceY(H / 2).strength(0.11))
      .force("collide", d3.forceCollide(mini ? 6 : 15 * Math.max(sc, 0.8))).on("tick", tick);

    function pcol(d) {
      if (S.mode === "class") return CL[d.cls];
      if (S.mode === "decision") return DC[d.dec];
      if (S.mode === "assurance") return d.as ? AS[d.as.lvl] : NEU;
      if (S.mode === "cluster") return d.comp < 0 ? NEU : PAL[d.comp % PAL.length];
      return NEU;
    }
    function update() {
      var pOn = new Set(people.filter(function (p) { return S.cls[p.cls]; }));
      var act = links.filter(function (l) { return S[l.k] && l.c >= S.min && pOn.has(l.source) && (!S.recent || (l.last != null && l.last <= 30)) && (!S.fresh || (l.first != null && l.first <= 90)); });
      var dg = new Map(); act.forEach(function (l) { if (!dg.has(l.target)) dg.set(l.target, new Set()); dg.get(l.target).add(l.source); });
      var va = new Set(al.filter(function (a) { return dg.has(a) && dg.get(a).size >= (S.shared ? 2 : 1) && (!S.shared || SHT[a.t]); }));
      vl = act.filter(function (l) { return va.has(l.target); });
      var vp = new Set(vl.map(function (l) { return l.source; }));
      vis = people.filter(function (p) { return vp.has(p); }).concat(Array.from(va));
      lk = lg.selectAll("line").data(vl, function (d) { return d.source.id + "|" + d.target.id; });
      lk.exit().remove();
      lk = lk.enter().append("line").merge(lk).attr("stroke", function (d) { return d.k === "c" ? "#378ADD" : "#888780"; }).attr("stroke-width", function (d) { return sw(d.c); }).attr("stroke-dasharray", function (d) { return mini ? null : DASH[d.k]; });
      nd = ng.selectAll("g.idg-node").data(vis, function (d) { return d.id; });
      nd.exit().remove();
      var e = nd.enter().append("g").attr("class", "idg-node");
      e.append("circle");
      if (!mini) {
        e.style("cursor", "grab")
          .call(d3.drag().on("start", function (ev, d) { if (!ev.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
            .on("drag", function (ev, d) { d.fx = ev.x; d.fy = ev.y; })
            .on("end", function (ev, d) { if (!ev.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }))
          .on("click", function (ev, d) { ev.stopPropagation(); select(d); });
        e.append("g").attr("class", "idg-nico").style("pointer-events", "none");
        e.append("text").attr("class", "lb").attr("text-anchor", "middle").style("pointer-events", "none").style("paint-order", "stroke").style("stroke", "#faf9f6").style("stroke-width", "3px").attr("fill", "#12212e");
      }
      nd = e.merge(nd);
      restyle();
      sim.nodes(vis); sim.force("link").links(vl);
      sim.alpha(mini ? 0.4 : 0.8).restart();
    }
    function flag(d) { return S.mode === "assurance" && d.t === "p" && d.as && d.as.flag; }
    function restyle() {
      nd.select("circle")
        .attr("r", function (d) { return mini ? (d.t === "p" ? 5.5 : d.shared ? 4 : 2.5) : (d.t === "p" ? 16 : d.shared ? 12 : 9); })
        .attr("fill", function (d) { return d.t === "p" ? pcol(d)[0] : d.t === "dv" ? (d.shared ? "#85B7EB" : "#E6F1FB") : (d.shared ? "#B4B2A9" : "#F1EFE8"); })
        .attr("stroke", function (d) { return d.t === "p" ? (flag(d) ? "#BA7517" : pcol(d)[1]) : d.t === "dv" ? "#185FA5" : (d.shared ? "#444441" : "#888780"); })
        .attr("stroke-width", function (d) { return mini ? 1 : flag(d) ? 3.5 : (d.t === "p" || d.shared ? 2 : 1); });
      nd.style("opacity", function (d) {
        var op = (d.t === "p" || d.shared) ? 1 : (mini ? 0.85 : 0.78);
        if (S.focus && d.t !== "p" && !S.focus.has(d.t)) op = 0.14;
        return op;
      });
      lk.attr("opacity", function (l) {
        if (S.sel) return (l.source === S.sel || l.target === S.sel) ? 1 : 0.07;
        if (S.focus && !S.focus.has(l.target.t)) return 0.05;
        return mini ? 0.4 : 0.55;
      });
      if (!mini) {
        nd.select(".idg-nico").each(function (d) {
          var s = d.t === "p" ? 17 : d.shared ? 15 : 12, nm = iconName(d), col = d.t === "p" ? pcol(d)[1] : d.t === "dv" ? "#0C447C" : (d.shared ? "#2C2C2A" : "#5F5E5A");
          this.setAttribute("transform", "translate(" + (-s / 2) + "," + (-s / 2) + ") scale(" + (s / 24) + ")");
          this.setAttribute("fill", "none"); this.setAttribute("stroke", col); this.setAttribute("stroke-width", "2.2");
          this.setAttribute("stroke-linecap", "round"); this.setAttribute("stroke-linejoin", "round");
          if (d._ic !== nm) { this.innerHTML = ICONS[nm]; d._ic = nm; }
        });
        nd.select(".lb").attr("y", function (d) { return d.t === "p" ? 29 : 21; }).attr("font-weight", function (d) { return d.t === "p" ? 600 : 400; }).attr("font-size", function (d) { return d.t === "p" ? 12 : 11; })
          .text(function (d) { return d.t === "p" || d.t === "dv" ? d.lb : (S.shared && d.shared ? d.lb : ""); });
      }
    }
    function select(d) {
      S.sel = d; restyle();
      var c = links.filter(function (l) { return (l.source === d || l.target === d) && (l.k !== "c" || S.c); }), t;
      if (d.t === "p") {
        var sa = c.filter(function (l) { return l.target.shared && l.target.t !== "dv"; }), others = {};
        sa.forEach(function (l) { l.target.ppl.forEach(function (p) { if (p !== d) others[p.id] = 1; }); });
        var on = Object.keys(others);
        t = d.lb + (S.mode === "class" ? " (" + CL[d.cls][2] + ")" : "") + (S.mode === "decision" ? ", score " + d.score.toFixed(1) + ": " + DC[d.dec][2] : "") + ". " + c.length + " links, " + sa.length + " shared attributes with " + on.length + " other " + (on.length === 1 ? "person" : "people") + (on.length ? " (" + on.join(", ") + ")" : "") + ".";
        var nw = null; c.forEach(function (l) { if (l.k !== "c" && l.first != null && (!nw || l.first < nw.first)) nw = l; });
        if (nw) t += " Newest identifier: " + (TN[nw.target.t] ? TN[nw.target.t] + " " : "") + nw.target.lb + ", first seen " + ago(nw.first) + ".";
        if (S.c && d.as) t += " Step-up: " + AS[d.as.lvl][2].toLowerCase() + " assurance (" + METH[d.as.best][1].toLowerCase() + ", " + ago(d.as.d) + ")" + (d.as.flag ? ", on a device shared with others" : "") + ".";
      } else if (d.t === "dv") {
        t = d.lb + ": step-up challenges passed by " + d.ppl.length + " " + (d.ppl.length > 1 ? "people" : "person") + ". " + c.map(function (l) { return l.source.id + " via " + l.ms.map(function (m) { return METH[m][1].toLowerCase(); }).join(" + ") + ", " + ago(l.first); }).join("; ") + "." + (d.ppl.length > 1 ? " One device clearing challenges for several supposedly separate people is a red flag." : "");
      } else {
        var nm = TN[d.t] ? TN[d.t] + " " + d.lb : d.lb;
        t = nm + ": " + d.ppl.length + " " + (d.ppl.length > 1 ? "people" : "person") + ". " + c.map(function (l) { return l.source.id + " " + ET[l.k] + " " + l.c; }).join(", ") + "." + (d.first != null ? " First seen " + ago(d.first) + ", last seen " + ago(d.last) + "." : "");
      }
      if (o.onInfo) o.onInfo(t);
    }
    function clearSel() { S.sel = null; restyle(); if (o.onInfo) o.onInfo(o.hint || ""); }
    if (!mini) svg.on("click", clearSel);
    function tick() {
      var pad = mini ? 10 : 26;
      vis.forEach(function (d) { d.x = Math.max(pad, Math.min(W - pad, d.x)); d.y = Math.max(pad, Math.min(H - pad, d.y)); });
      lk.attr("x1", function (d) { return d.source.x; }).attr("y1", function (d) { return d.source.y; }).attr("x2", function (d) { return d.target.x; }).attr("y2", function (d) { return d.target.y; });
      nd.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });
    }
    function resize() { W = svgEl.clientWidth || W; H = svgEl.clientHeight || H; sim.force("x").x(W / 2); sim.force("y").y(H / 2); sim.alpha(0.4).restart(); }
    function reshuffle() { all.forEach(function (n) { Object.assign(n, jit()); }); sim.alpha(1).restart(); }
    update();
    return { S: S, update: update, restyle: restyle, resize: resize, reshuffle: reshuffle, sim: sim, tick: tick, people: people, clearSel: clearSel };
  }

  /* ---------- lazy d3 ---------- */
  var d3p = null;
  function loadD3() {
    if (window.IDG3) return Promise.resolve();
    if (d3p) return d3p;
    d3p = new Promise(function (res, rej) {
      var s = document.createElement("script"); s.src = D3_SRC; s.async = true;
      s.onload = res; s.onerror = function () { d3p = null; rej(new Error("d3 failed to load")); };
      document.head.appendChild(s);
    });
    return d3p;
  }

  /* ---------- teasers ---------- */
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var STEPS = [{ mode: "neutral", shared: false, ms: 3200 }, { mode: "class", shared: false, ms: 2600 }, { mode: "class", shared: true, ms: 3400 }];
  var teasers = [], modalEl = null, fg = null, curCta = null, lastFocus = null;

  function mountTeaser(host) {
    var cta = { href: host.getAttribute("data-cta-href") || "/contact", text: host.getAttribute("data-cta-text") || "Get in touch", track: host.getAttribute("data-cta-track") || "idg_cta" };
    host.innerHTML =
      '<button class="idg-card" type="button" aria-haspopup="dialog" data-track="idg_open" aria-label="Open the interactive identity graph">' +
      '<svg class="idg-mini" role="img" aria-label="Animated network of people and the data points they share"></svg>' +
      '<span class="idg-cap"><span class="idg-eyebrow">Interactive</span><span class="idg-h">Follow the connections</span>' +
      '<span class="idg-sub">Every field passes on its own. The network tells the real story.</span>' +
      '<span class="idg-open">Tap to explore ' + ico("arrows-maximize", 16) + "</span></span></button>";
    var card = host.firstChild, svgEl = card.querySelector(".idg-mini");
    var T = { card: card, svgEl: svgEl, cta: cta, g: null, timer: null, running: false, step: 0, visible: false };
    teasers.push(T);
    card.addEventListener("click", function () { openModal(T); });
    function cycle() {
      if (!T.running) return;
      var s = STEPS[T.step % STEPS.length]; T.step++;
      T.g.S.mode = s.mode; T.g.S.shared = s.shared; T.g.update();
      T.timer = setTimeout(cycle, s.ms);
    }
    T.start = function () { if (T.running || reduced || !T.g) return; T.running = true; T.g.sim.alphaTarget(0.02).restart(); cycle(); };
    T.stop = function () { T.running = false; clearTimeout(T.timer); if (T.g) T.g.sim.alphaTarget(0); };
    function init() {
      loadD3().then(function () {
        if (T.g) return;
        T.g = createGraph(svgEl, { mini: true });
        if (reduced) {
          T.g.S.mode = "class"; T.g.S.shared = true; T.g.update(); T.g.sim.stop();
          for (var i = 0; i < 300; i++) T.g.sim.tick();
          T.g.tick();
        } else if (T.visible) T.start();
      }).catch(function () { svgEl.style.display = "none"; });
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          T.visible = e.isIntersecting;
          if (e.isIntersecting) { if (!T.g) init(); else T.start(); } else T.stop();
        });
      }, { rootMargin: "120px" }).observe(card);
    } else { T.visible = true; init(); }
  }

  /* ---------- explorer modal ---------- */
  var PICKS = [["good", "Good actor"], ["fraud", "Fraudster"], ["bust", "Bust-out"], ["syn", "Synthetic ID"], ["all", "Everyone, labeled"], ["none", "Everyone, raw"]];
  var LEGEND = [["user", "Person"], ["mail", "Email"], ["phone", "Phone"], ["world", "IP"], ["home", "Home"], ["building", "Office"], ["mailbox", "PO box / drop"], ["package", "Shipping"], ["credit-card", "Card token"], ["cake", "DOB"], ["id", "SSN"], ["building-bank", "Bank"], ["coins", "Lender"], ["device-mobile", "Device"]];
  var HINT = "Tap any dot for details.";
  var cur = { lens: null, pick: null };

  function q(s) { return modalEl.querySelector(s); }
  function qa(s) { return modalEl.querySelectorAll(s); }
  function buildModal() {
    modalEl = document.createElement("div");
    modalEl.className = "idg-modal"; modalEl.hidden = true;
    modalEl.setAttribute("role", "dialog"); modalEl.setAttribute("aria-modal", "true"); modalEl.setAttribute("aria-labelledby", "idg-title");
    modalEl.innerHTML =
      '<div class="idg-panel">' +
      '<div class="idg-head"><div><div class="idg-eyebrow">Interactive</div><h2 class="idg-title" id="idg-title">Follow the connections</h2></div>' +
      '<button class="idg-x" type="button" aria-label="Close">' + ico("x", 20) + "</button></div>" +
      '<p class="idg-how">Start with a good actor, then compare the shapes the bad actors make. Drag any dot, scroll or pinch to zoom, tap for details. All data is fictional.</p>' +
      '<div class="idg-stage"><svg class="idg-full" role="img" aria-label="Interactive force-directed identity graph"></svg><div class="idg-info" aria-live="polite"></div></div>' +
      '<div class="idg-steps"><div class="idg-step"><span class="idg-lbl"><b>1</b> Who are we looking at?</span><div class="idg-row" data-role="picks"></div></div>' +
      '<div class="idg-step"><span class="idg-lbl"><b>2</b> How does each discipline read it?</span><div class="idg-row" data-role="lenses"></div></div></div>' +
      '<div class="idg-lower"><div class="idg-body"></div><div class="idg-aside">' +
      '<div class="idg-legend">' + LEGEND.map(function (l) { return "<span>" + ico(l[0], 15) + l[1] + "</span>"; }).join("") + "</div>" +
      '<p class="idg-fine">Line thickness = number of transactions or events. Solid = e-commerce, dashed = credit application, dotted = bank login, blue dash-dot = step-up challenge. Large ringed dots are shared by two or more people. First and last seen dates are illustrative.</p>' +
      '<details class="idg-filters"><summary>Filters</summary><div class="idg-row">' +
      '<button class="idg-chip" data-f="e" type="button">E-commerce</button><button class="idg-chip" data-f="a" type="button">Credit app</button><button class="idg-chip" data-f="l" type="button">Bank login</button>' +
      '<button class="idg-chip" data-f="recent" type="button">Seen in last 30 days</button><button class="idg-chip" data-f="fresh" type="button">New in last 90 days</button><button class="idg-chip" data-f="shared" type="button">Shared only</button><button class="idg-chip" data-f="reshuffle" type="button">Reshuffle</button></div>' +
      '<label class="idg-slider"><span>Min count per link</span><input type="range" min="1" max="40" value="1" data-f="min"><span class="idg-sv">1</span></label></details>' +
      "</div></div></div>";
    document.body.appendChild(modalEl);
    var pr = q('[data-role="picks"]');
    PICKS.forEach(function (p) {
      var b = document.createElement("button"); b.type = "button"; b.className = "idg-chip"; b.setAttribute("data-pick", p[0]);
      b.innerHTML = (CL[p[0]] ? '<span class="idg-dot" style="background:' + CL[p[0]][0] + ";border-color:" + CL[p[0]][1] + '"></span>' : "") + p[1];
      b.addEventListener("click", function () { applyPick(p[0], true); }); pr.appendChild(b);
    });
    var lr = q('[data-role="lenses"]');
    Object.keys(CFG.lenses).forEach(function (k) {
      var L = CFG.lenses[k], b = document.createElement("button"); b.type = "button"; b.className = "idg-chip"; b.setAttribute("data-lens", k);
      b.innerHTML = ico(L.icon, 15) + L.label; b.addEventListener("click", function () { applyLens(k); }); lr.appendChild(b);
    });
    q(".idg-x").addEventListener("click", closeModal);
    modalEl.addEventListener("click", function (e) { if (e.target === modalEl) closeModal(); });
    modalEl.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { closeModal(); return; }
      if (e.key !== "Tab") return;
      var f = Array.prototype.filter.call(modalEl.querySelectorAll("button,summary,input,a[href]"), function (n) { return n.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    qa("[data-f]").forEach(function (el) {
      var f = el.getAttribute("data-f");
      if (f === "min") { el.addEventListener("input", function () { fg.S.min = +el.value; fg.update(); syncUI(); }); return; }
      el.addEventListener("click", function () {
        if (f === "reshuffle") { fg.reshuffle(); return; }
        fg.S[f] = !fg.S[f]; fg.update(); syncUI();
      });
    });
    q(".idg-body").addEventListener("click", function (e) {
      var n = e.target.closest("[data-next]");
      if (n) { applyPick(n.getAttribute("data-next"), true); return; }
      if (e.target.closest('[data-act="challenge"]')) applyChallenge(!fg.S.c);
    });
  }
  function syncUI() {
    var S = fg.S;
    qa("[data-pick]").forEach(function (b) { b.classList.toggle("on", cur.pick === b.getAttribute("data-pick")); });
    qa("[data-lens]").forEach(function (b) { b.classList.toggle("on", cur.lens === b.getAttribute("data-lens")); });
    ["e", "a", "l"].forEach(function (k) { q('[data-f="' + k + '"]').classList.toggle("off", !S[k]); });
    ["shared", "recent", "fresh"].forEach(function (k) { q('[data-f="' + k + '"]').classList.toggle("on", !!S[k]); });
    q('[data-f="min"]').value = S.min; q(".idg-sv").textContent = S.min;
  }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
  function ctaHtml() { return '<a class="idg-cta" href="' + curCta.href + '" data-track="' + curCta.track + '">' + esc(curCta.text) + " " + ico("arrow-right", 16) + "</a>"; }
  function setBody(html) { q(".idg-body").innerHTML = html; }
  function renderPick(k) {
    var h;
    if (k === "none") h = "<h3>Everyone, raw</h3><p>Fourteen people, no labels. Emails, phones, birth dates and SSNs are unique to each person, so a field-by-field check passes almost everyone. Pick a type of person above to see the shape it makes.</p>";
    else if (k === "all") h = "<h3>Everyone, labeled</h3><p>Green is a good actor, red a fraudster, amber a bust-out, purple a synthetic identity. Now switch to a discipline lens in step 2 to see how each one reads this same picture.</p>";
    else {
      var P = CFG.patterns[k], n = fg.people.filter(function (p) { return p.cls === k; }).length, nx = CFG.next[k];
      h = "<h3>" + P.title + ' <small>' + n + " in this sample</small></h3><p>" + P.look + '</p><div class="idg-tags">' + P.tags.map(function (t) { return '<span class="idg-tag">' + t + "</span>"; }).join("") + "</div>" +
        '<button class="idg-next" type="button" data-next="' + nx[0] + '">Next: ' + (nx[0] === "all" ? "see " : "what a ") + nx[1] + (nx[0] === "all" ? "" : " looks like") + " " + ico("arrow-right", 16) + "</button>";
    }
    setBody(h + '<div class="idg-ctarow">' + ctaHtml() + "</div>");
  }
  function renderLens(k) {
    var L = CFG.lenses[k], h = "<h3>" + L.title + "</h3><p>" + L.text + "</p>";
    if (L.note && !(k === "idv" && fg.S.c)) h += '<p class="idg-note">' + L.note + "</p>";
    if (L.proof && L.proof.length) {
      h += '<div class="idg-proof"><span class="idg-lbl">From my work</span><ul>' + L.proof.map(function (x) { return "<li>" + esc(x.t) + (x.href ? ' <a href="' + x.href + '" data-track="idg_proof_link">' + esc(x.a) + "</a>" : "") + "</li>"; }).join("") + "</ul></div>";
    }
    if (k === "idv") {
      var on = fg.S.c;
      h += '<button class="idg-next" type="button" data-act="challenge">' + ico("shield-check", 16) + (on ? "Remove the step-up challenge" : "Add a step-up challenge") + "</button>";
      if (on) {
        h += '<p class="idg-note">A passed challenge is fresh evidence that a real person controls the identity right now. Trust depends on the method (passkey on a trusted device, then license scan, email link, code) and fades with age. A device that clears challenges for several supposedly different people lowers trust instead.</p>' +
          '<span class="idg-lbl">Illustrative assurance level</span>';
        fg.people.slice().sort(function (a, b) { return b.as.v - a.as.v; }).forEach(function (p) {
          var a = p.as, c = AS[a.lvl], t = CL[p.cls];
          h += '<div class="idg-as"><span>' + p.lb + '</span><span class="idg-asm">' + ico(METH[a.best][0], 14) + METH[a.best][1] + ", " + ago(a.d) + (a.flag ? ' <em class="idg-flag">shared device</em>' : "") + '</span><span class="idg-pill" style="background:' + c[0] + ";color:" + (c[3] || c[1]) + '">' + c[2] + '</span></div>';
        });
        h += '<p class="idg-fine">Bust-out accounts drop to low because their last challenge is a year old. Ring and synthetic identities drop because one device passed challenges for several of them. Amber outline = shared device.</p>';
      }
    }
    if (k === "risk") {
      h += '<span class="idg-lbl">Illustrative score: shared attributes, lender velocity, cluster size</span>';
      fg.people.slice().sort(function (a, b) { return b.score - a.score; }).forEach(function (p) {
        var c = DC[p.dec], w = Math.min(p.score / 22, 1) * 100, t = CL[p.cls];
        h += '<div class="idg-score"><span>' + p.lb + '</span><span class="idg-bar"><b style="width:' + w + "%;background:" + c[1] + '"></b></span><span class="idg-pill" style="background:' + c[0] + ";color:" + c[1] + '">' + c[2] + '</span><span class="idg-dot" style="background:' + t[0] + ";border-color:" + t[1] + '" title="Ground truth: ' + t[2] + '"></span></div>';
      });
      h += '<p class="idg-fine">Small dot = ground truth. Bust-out accounts land in Review, not Decline: the network alone under-scores them until behavior is added.</p>';
    }
    setBody(h + '<div class="idg-ctarow">' + ctaHtml() + "</div>");
  }
  function applyPick(k, user) {
    var S = fg.S;
    Object.assign(S, { e: true, a: true, l: true, min: 1, focus: null, sel: null, shared: false, c: false, recent: false, fresh: false });
    Object.keys(S.cls).forEach(function (c) { S.cls[c] = (k === "none" || k === "all" || c === k); });
    S.mode = k === "none" ? "neutral" : "class";
    cur.pick = k; cur.lens = null;
    fg.update(); syncUI(); renderPick(k); q(".idg-info").textContent = HINT;
    if (user) track("idg_pick_" + k);
  }
  function applyLens(k) {
    var S = fg.S, P = CFG.lenses[k].preset;
    Object.assign(S, { e: true, a: true, l: true, min: 1, shared: P.shared, mode: P.mode, focus: P.focus ? new Set(P.focus) : null, sel: null, c: false, recent: false, fresh: false });
    Object.keys(S.cls).forEach(function (c) { S.cls[c] = true; });
    cur.lens = k; cur.pick = P.mode === "class" ? "all" : null;
    fg.update(); syncUI(); renderLens(k); q(".idg-info").textContent = HINT;
    track("idg_lens_" + k);
  }
  function applyChallenge(on) {
    var S = fg.S, P = CFG.lenses.idv.preset;
    S.c = on; S.mode = on ? "assurance" : P.mode; S.focus = new Set(P.focus.concat(on ? ["dv"] : [])); S.sel = null;
    fg.update(); syncUI(); renderLens("idv");
    q(".idg-info").textContent = on ? "Blue dash-dot lines are step-up challenges. Tap a device or a person for details." : HINT;
    track("idg_challenge_" + (on ? "on" : "off"));
  }
  function openModal(T) {
    curCta = T.cta; lastFocus = document.activeElement;
    teasers.forEach(function (t) { t.stop(); });
    if (!modalEl) buildModal();
    modalEl.hidden = false; document.body.style.overflow = "hidden";
    q(".idg-x").focus();
    track("idg_open_modal");
    loadD3().then(function () {
      if (!fg) {
        fg = createGraph(q(".idg-full"), { onInfo: function (t) { q(".idg-info").textContent = t; }, hint: HINT });
        applyPick("good", false);
      } else { fg.resize(); if (cur.pick === "good" || cur.pick === null && !cur.lens) syncUI(); }
      var cta = q(".idg-cta"); if (cta) { cta.setAttribute("href", curCta.href); cta.setAttribute("data-track", curCta.track); cta.firstChild.nodeValue = curCta.text + " "; }
    }).catch(function () { q(".idg-info").textContent = "The graph could not load. Please refresh and try again."; });
  }
  function closeModal() {
    modalEl.hidden = true; document.body.style.overflow = "";
    teasers.forEach(function (t) { if (t.visible) t.start(); });
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  window.addEventListener("resize", function () { if (fg && modalEl && !modalEl.hidden) fg.resize(); });

  Array.prototype.forEach.call(mounts, mountTeaser);
})();
