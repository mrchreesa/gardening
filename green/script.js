/* A To Z: navigation, quick-contact bar and Web3Forms enquiries. */

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
  const firstField = form && form.querySelector(".field input");

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
      const visible = !inView.get(heroCopy) && !inView.get(visitCard);
      bar.classList.toggle("is-visible", visible);
      bar.inert = !visible;
    });
    io.observe(heroCopy);
    if (visitCard) io.observe(visitCard);
  } else if (bar) {
    bar.classList.add("is-visible");
  }

  /* ---------- Visit form ---------- */

  if (!form) return;

  const configuredKey = window.ATOZ_CONTACT && window.ATOZ_CONTACT.accessKey;
  const accessKey = typeof configuredKey === "string" ? configuredKey.trim() : "";
  // Keep direct contact available when the service hasn't been configured.
  if (!accessKey || !/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(accessKey)) return;

  form.elements.access_key.value = accessKey;
  form.hidden = false;
  form.parentElement.querySelector(".contact-fallback").hidden = true;

  const captchaScript = document.createElement("script");
  captchaScript.src = "https://web3forms.com/client/script.js";
  captchaScript.async = true;
  captchaScript.onerror = () => {
    showError("The security check could not load. Please call 07424 940579 or email us to arrange a visit.");
  };
  document.body.appendChild(captchaScript);

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
    if (field.name === "postcode") field.value = field.value.trim().toUpperCase().replace(/\s+/g, " ");
    if (field.name === "phone") {
      field.value = field.value.trim();
      const digits = field.value.replace(/\D/g, "").length;
      field.setCustomValidity(field.value && (digits < 10 || digits > 15) ? messages.phone : "");
    }
    const ok = field.checkValidity();
    wrap.classList.toggle("is-invalid", !ok);
    field.setAttribute("aria-invalid", String(!ok));
    error.textContent = ok ? "" : messages[field.name] || "Please check this field.";
    return ok;
  }

  const fields = Array.from(form.querySelectorAll(".field input, .field select"));

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

  const submitButton = form.querySelector('[type="submit"]');
  const formError = form.querySelector(".form-error");
  const captchaError = form.querySelector(".captcha-error");
  let submitting = false;

  function showError(message) {
    formError.textContent = message;
    formError.hidden = false;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (submitting) return;
    formError.hidden = true;
    captchaError.hidden = true;
    const invalid = fields.filter((field) => !validate(field));
    if (invalid.length) {
      invalid[0].focus();
      return;
    }

    if (form.elements.botcheck.checked) {
      showError("Your request could not be sent. Please call 07424 940579 to arrange a visit.");
      formError.focus();
      return;
    }
    const captchaToken = form.querySelector('[name="h-captcha-response"]');
    if (!captchaToken || !captchaToken.value) {
      captchaError.textContent = "Please complete the security check before sending. If it doesn't load, call or email us.";
      captchaError.hidden = false;
      return;
    }

    const name = form.elements.name.value.trim().split(/\s+/)[0];
    const payload = Object.fromEntries(new FormData(form));
    payload.botcheck = false;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    submitting = true;
    submitButton.disabled = true;
    submitButton.textContent = "Sending…";
    form.setAttribute("aria-busy", "true");

    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error("Submission was not accepted");

      const success = form.parentElement.querySelector(".form-success");
      success.querySelector("[data-name]").textContent = name ? ", " + name : "";
      form.reset();
      form.hidden = true;
      form.parentElement.querySelector(".visit-title").hidden = true;
      success.hidden = false;
      success.focus();
    } catch {
      showError("We couldn’t confirm that your request was sent. Your details are still here. Please call 07424 940579 or email us before trying again.");
      formError.focus();
      if (window.hcaptcha) window.hcaptcha.reset();
    } finally {
      window.clearTimeout(timeout);
      submitting = false;
      submitButton.disabled = false;
      submitButton.textContent = "Request a visit";
      form.removeAttribute("aria-busy");
    }
  });
})();
