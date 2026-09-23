/* A To Z: navigation, quick-contact bar and the visit form (preview only) */

(function () {
  "use strict";

  const header = document.querySelector(".header");
  const navToggle = document.querySelector(".nav-toggle");
  const isDesktop = window.matchMedia("(min-width: 900px)");

  /* ---------- Mobile menu ---------- */

  function setNav(open) {
    header.classList.toggle("nav-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
  }

  navToggle.addEventListener("click", () => {
    setNav(!header.classList.contains("nav-open"));
  });

  // Close the menu after following a link, on Escape, or on a click outside the header
  header.querySelectorAll(".nav a").forEach((link) => {
    link.addEventListener("click", () => setNav(false));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && header.classList.contains("nav-open")) {
      setNav(false);
      navToggle.focus();
    }
  });

  document.addEventListener("click", (e) => {
    if (!header.contains(e.target)) setNav(false);
  });

  isDesktop.addEventListener("change", () => setNav(false));

  /* ---------- "Book a garden visit" links ---------- */

  const form = document.querySelector(".visit-form");
  const firstField = form && form.querySelector("input");

  document.querySelectorAll("[data-focus-form]").forEach((link) => {
    link.addEventListener("click", () => {
      // Focus the first field on desktop only, so phones don't pop the keyboard mid-scroll
      if (isDesktop.matches && firstField && !form.hidden) {
        // Let the anchor navigate before focusing, otherwise it takes focus back.
        requestAnimationFrame(() => firstField.focus({ preventScroll: true }));
      }
    });
  });

  /* ---------- Mobile quick-contact bar ----------
     Shown once the hero copy has scrolled away, hidden again while the form is on screen. */

  const bar = document.querySelector(".mobile-bar");
  const heroCopy = document.querySelector(".hero-copy");
  const visitCard = document.querySelector(".visit-card");

  if (bar && heroCopy && "IntersectionObserver" in window) {
    const inView = new Map();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => inView.set(entry.target, entry.isIntersecting));
      bar.classList.toggle("is-visible", !inView.get(heroCopy) && !inView.get(visitCard));
    });
    io.observe(heroCopy);
    if (visitCard) io.observe(visitCard);
  } else if (bar) {
    bar.classList.add("is-visible");
  }

  /* ---------- Visit form (preview only, nothing is sent) ---------- */

  if (!form) return;

  const messages = {
    name: "Please enter your name.",
    phone: "Please enter a valid phone number.",
    postcode: "Please enter a valid UK postcode.",
    service: "Please choose a service."
  };

  function validate(field) {
    const wrap = field.closest(".field");
    const error = wrap.querySelector(".field-error");
    if (field.tagName === "INPUT" && !field.value.trim()) field.value = ""; // whitespace-only counts as empty
    if (field.name === "phone") {
      // UK numbers have 10–11 digits, or 12–13 with the +44 prefix
      const digits = field.value.replace(/\D/g, "").length;
      field.setCustomValidity(field.value && (digits < 10 || digits > 13) ? messages.phone : "");
    }
    const ok = field.checkValidity();
    wrap.classList.toggle("is-invalid", !ok);
    field.setAttribute("aria-invalid", String(!ok));
    error.textContent = ok ? "" : messages[field.name] || "Please check this field.";
    return ok;
  }

  const fields = Array.from(form.querySelectorAll("input, select"));

  fields.forEach((field) => {
    const error = field.closest(".field").querySelector(".field-error");
    error.id = field.id + "-error";
    field.setAttribute("aria-describedby", error.id);

    // Validate on leaving a field, then live once it has shown an error
    field.addEventListener("blur", () => { if (field.value) validate(field); });
    ["input", "change"].forEach((type) => {
      field.addEventListener(type, () => {
        if (field.closest(".field").classList.contains("is-invalid")) validate(field);
      });
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const invalid = fields.filter((field) => !validate(field));
    if (invalid.length) {
      invalid[0].focus();
      return;
    }

    const name = form.elements.name.value.trim().split(/\s+/)[0];
    const success = form.parentElement.querySelector(".form-success");
    success.querySelector("[data-name]").textContent = name ? ", " + name : "";
    form.hidden = true;
    form.parentElement.querySelector(".visit-title").hidden = true;
    success.hidden = false;
    success.focus();
  });
})();
