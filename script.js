(function () {
  "use strict";

  // Mark that JS is available. CSS uses this to arm the fade-and-rise
  // motion — without it, everything is visible by default (see style.css).
  document.documentElement.classList.add("js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------
     Scroll-in reveal — the entire motion budget (fade + 12px rise).
     --------------------------------------------------------------- */
  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    document.querySelectorAll(".reveal").forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ---------------------------------------------------------------
     Depth gutter — brighten the current section's label. The one
     permitted flourish beyond the base reveal (spec 2.7).
     --------------------------------------------------------------- */
  if ("IntersectionObserver" in window) {
    var marks = document.querySelectorAll(".depth-section");
    var depthObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var mark = entry.target.querySelector(".depth-mark");
          if (!mark) return;
          mark.classList.toggle("is-active", entry.isIntersecting);
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    marks.forEach(function (el) {
      depthObserver.observe(el);
    });
  }

  /* ---------------------------------------------------------------
     Join form — submits into a hidden same-page iframe (see the
     target="fathom-submit-frame" attribute in index.html), so the
     browser never navigates away — that guarantee comes from plain
     HTML and holds even if this script fails to run at all.

     With JS: we still want the branded "You're in" confirmation rather
     than nothing visibly happening. The iframe fires a "load" event
     once Google's response finishes loading inside it — that's our
     signal to swap in the confirmation panel.
  --------------------------------------------------------------- */
  var form = document.getElementById("join-form");
  var frame = document.getElementById("fathom-submit-frame");
  var formWasSubmitted = false;

  if (form && frame) {
    form.addEventListener("submit", function (event) {
      // novalidate is on the <form> so the browser doesn't do a plain
      // page-reload-style validation failure — but we still want the
      // native required-field checks (a <select> stuck on its disabled
      // placeholder, an empty required input, etc). Without this, a
      // half-filled form silently submits an incomplete request that
      // Google rejects, while the page still claims success. Do the
      // check ourselves and stop right here if anything's missing.
      if (!form.checkValidity()) {
        event.preventDefault();
        form.reportValidity();
        return;
      }

      formWasSubmitted = true;
      var submitBtn = form.querySelector(".btn-submit");
      if (submitBtn) submitBtn.textContent = "Sending…";
      // No preventDefault beyond the check above — let the browser
      // submit normally into the iframe.
    });

    frame.addEventListener("load", function () {
      // Every iframe fires an initial "load" for its blank starting
      // document too — only react once an actual submission happened.
      if (formWasSubmitted) {
        formWasSubmitted = false;
        showConfirmation();
      }
    });
  }

  function showConfirmation() {
    var panel = document.getElementById("join-panel");
    if (!panel) return;

    panel.innerHTML =
      '<div class="confirm-panel" style="display:block">' +
      "<p>You&rsquo;re in. First session is <strong>Wednesday, August 26</strong>.</p>" +
      "<p>Join the Discord now &mdash; that&rsquo;s where everything happens between sessions.</p>" +
      '<a class="btn btn-primary" href="https://discord.gg/pHgJ7Yzr9">Open Discord</a>' +
      "</div>";
  }
})();
