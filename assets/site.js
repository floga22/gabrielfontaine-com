(function () {
  "use strict";
  var burger = document.getElementById("burger"), nav = document.getElementById("nav");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) nav.classList.remove("open"); });
  }
  // Contact forms (Web3Forms)
  document.querySelectorAll("form[data-web3]").forEach(function (form) {
    var status = form.querySelector(".formnote"), btn = form.querySelector('button[type="submit"]');
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      btn.disabled = true; status.textContent = "Sending…";
      fetch("https://api.web3forms.com/submit", { method: "POST", headers: { Accept: "application/json" }, body: new FormData(form) })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d.success) {
            status.textContent = "Thanks, message sent. I'll get back to you soon.";
            var aud = (form.querySelector('[name="audience"]') || {}).value || "unknown";
            if (window.Insights && window.Insights.convert) window.Insights.convert("contact_submit_" + aud, { audience: aud });
            form.reset();
          } else status.textContent = d.message || "Something went wrong. Please try again.";
        })
        .catch(function () { status.textContent = "Something went wrong. Please try again, or email directly."; })
        .then(function () { btn.disabled = false; });
    });
  });
})();
