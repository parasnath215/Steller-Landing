(function () {
  "use strict";

  /* ---------- 1. Sticky header on scroll ---------- */
  const header = document.querySelector(".site-header");
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 12) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 2. Mobile menu toggle ---------- */
  const menuBtn = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");
  const menuOpenIcon = document.querySelector("[data-menu-open-icon]");
  const menuCloseIcon = document.querySelector("[data-menu-close-icon]");
  const mobileLinks = document.querySelectorAll("[data-mobile-menu] a");

  function setMenu(open) {
    if (!mobileMenu) return;
    mobileMenu.classList.toggle("hidden", !open);
    if (menuOpenIcon) menuOpenIcon.classList.toggle("hidden", open);
    if (menuCloseIcon) menuCloseIcon.classList.toggle("hidden", !open);
    if (menuBtn) menuBtn.setAttribute("aria-expanded", String(open));
  }
  if (menuBtn) {
    menuBtn.addEventListener("click", () => {
      const open = mobileMenu.classList.contains("hidden");
      setMenu(open);
    });
  }
  mobileLinks.forEach((a) => a.addEventListener("click", () => setMenu(false)));

  /* ---------- 3. Scroll reveal animations ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  const heroMotion = document.querySelector(".hero-motion");

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = parseFloat(el.dataset.delay || "0");
          el.style.transitionDelay = delay + "s";
          el.classList.add("in-view");
          revealObserver.unobserve(el);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  revealEls.forEach((el) => revealObserver.observe(el));
  if (heroMotion) heroMotion.classList.add("in-view");

  /* ---------- 4. Animated counters ---------- */
  const counters = document.querySelectorAll("[data-counter]");
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const value = el.getAttribute("data-counter");
        counterObserver.unobserve(el);
        if (el.dataset.star === "true") {
          el.textContent = value;
          return;
        }

        const isLeading = value.startsWith("<");
        const cleanVal = isLeading ? value.slice(1) : value;
        const prefix = isLeading ? "<" : "";
        const suffix = cleanVal.replace(/[0-9.]/g, "");
        const numeric = parseFloat(cleanVal.replace(/[^0-9.]/g, "")) || 0;
        const isDecimal = cleanVal.includes(".");

        const duration = 1600;
        const start = performance.now();
        function tick(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = numeric * eased;
          el.textContent =
            prefix +
            (isDecimal ? current.toFixed(1) : Math.round(current).toString()) +
            suffix;
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.3 }
  );
  counters.forEach((el) => counterObserver.observe(el));

  /* ---------- 5. Testimonials carousel (responsive slider) ---------- */
  const track = document.querySelector("[data-carousel-track]");
  const carouselDots = document.querySelectorAll("[data-carousel-dot]");
  let currentSlide = 0;
  let slidesPerView = 1;
  let autoTimer = null;

  function computeSlidesPerView() {
    const w = window.innerWidth;
    if (w >= 1024) return 3;
    if (w >= 640) return 2;
    return 1;
  }

  function updateCarousel(animate) {
    if (!track) return;
    const slidesArr = Array.from(track.children);
    if (!slidesArr.length) return;
    slidesPerView = computeSlidesPerView();
    const maxIndex = Math.max(0, slidesArr.length - slidesPerView);
    if (currentSlide > maxIndex) currentSlide = maxIndex;
    if (currentSlide < 0) currentSlide = 0;
    const target = slidesArr[currentSlide];
    const offset = target ? target.offsetLeft : 0;
    track.style.transition = animate
      ? "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)"
      : "none";
    track.style.transform = "translateX(-" + offset + "px)";

    carouselDots.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === currentSlide);
    });
  }

  function startAuto() {
    if (!track) return;
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = setInterval(() => {
      slidesPerView = computeSlidesPerView();
      const slidesArr = Array.from(track.children);
      const maxIndex = Math.max(0, slidesArr.length - slidesPerView);
      currentSlide = currentSlide >= maxIndex ? 0 : currentSlide + 1;
      updateCarousel(true);
    }, 4500);
  }

  function restartAuto() {
    if (autoTimer) clearInterval(autoTimer);
    startAuto();
  }

  carouselDots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      currentSlide = i;
      updateCarousel(true);
      restartAuto();
    });
  });

  window.addEventListener("resize", () => {
    if (track) updateCarousel(false);
  });

  if (track) {
    updateCarousel(false);
    startAuto();
  }

  /* ---------- 6. FAQ accordion ---------- */
  document.querySelectorAll("[data-accordion-trigger]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const item = trigger.closest(".accordion-item");
      const content = item.querySelector(".accordion-content");
      const isOpen = item.classList.contains("is-open");

      // close all others
      document.querySelectorAll(".accordion-item.is-open").forEach((other) => {
        if (other !== item) {
          other.classList.remove("is-open");
          const otherContent = other.querySelector(".accordion-content");
          if (otherContent) otherContent.style.maxHeight = null;
        }
      });

      if (!isOpen) {
        item.classList.add("is-open");
        content.style.maxHeight = content.scrollHeight + "px";
      } else {
        item.classList.remove("is-open");
        content.style.maxHeight = null;
      }
    });
  });

  /* ---------- 7. Quote dialog ---------- */
  const dialog = document.querySelector("[data-dialog]");
  const dialogCloseBtn = document.querySelector("[data-dialog-close]");
  const body = document.body;
  const lastFocused = { el: null };

  function openDialog() {
    if (!dialog) return;
    lastFocused.el = document.activeElement;
    dialog.classList.add("is-open");
    body.style.overflow = "hidden";
  }
  function closeDialog() {
    if (!dialog) return;
    dialog.classList.remove("is-open");
    body.style.overflow = "";
    if (lastFocused.el && typeof lastFocused.el.focus === "function") {
      lastFocused.el.focus();
    }
  }

  document.querySelectorAll("[data-open-quote]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openDialog();
    });
  });
  if (dialogCloseBtn) dialogCloseBtn.addEventListener("click", closeDialog);
  if (dialog) {
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) closeDialog();
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDialog();
  });

  /* ---------- 8. Quote form validation + Toast notification ---------- */
  const forms = document.querySelectorAll("[data-quote-form]");

  function getToastContainer() {
    let container = document.querySelector("[data-toast-container]");
    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container";
      container.setAttribute("data-toast-container", "");
      document.body.appendChild(container);
    }
    return container;
  }
  getToastContainer();

  function showToast(message, isError) {
    const toastContainer = getToastContainer();
    const toast = document.createElement("div");
    toast.className = "toast" + (isError ? " toast-error" : "");
    toast.setAttribute("role", "status");
    toast.innerHTML =
      '<i class="fa-solid ' +
      (isError ? "fa-circle-exclamation" : "fa-circle-check") +
      '" aria-hidden="true"></i><span></span>';
    toast.querySelector("span").textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("hide");
      setTimeout(() => toast.remove(), 350);
    }, isError ? 5000 : 4000);
  }

  function setFieldError(input, message) {
    const wrapper = input.closest(".form-field");
    if (!wrapper) return;
    const msg = wrapper.querySelector(".form-message");
    if (message) {
      wrapper.classList.add("has-error");
      if (msg) msg.textContent = message;
    } else {
      wrapper.classList.remove("has-error");
      if (msg) msg.textContent = "";
    }
  }

  function validateField(input) {
    if (!input || input.type === "hidden" || input.name === "website_url") {
      return true;
    }

    const name = input.name;
    const value = (input.value || "").trim();
    let error = "";

    if (name === "name" && value.length === 0) {
      error = "Full Name is required";
    }

    if (name === "email") {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (value.length === 0) error = "Email address is required";
      else if (value.length > 100) error = "Email must be max 100 characters";
      else if (!emailRegex.test(value)) error = "Enter a valid email address";
    }

    if (name === "phone") {
      const digits = value.replace(/\D/g, "");
      if (digits.length === 0) error = "Phone number is required";
      else if (digits.length !== 10) error = "Phone number must be exactly 10 digits";
      else if (!/^[6-9]\d{9}$/.test(digits)) error = "Enter a valid 10-digit mobile number";
    }

    if (name === "message" && value.length === 0) {
      error = "Project requirements description is required";
    }

    setFieldError(input, error);
    return !error;
  }

  function bindQuoteForm(form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const inputs = form.querySelectorAll(
        "input:not([type='hidden']):not([name='website_url']), select, textarea"
      );
      let valid = true;
      inputs.forEach((input) => {
        if (!validateField(input)) valid = false;
      });

      if (!valid) return;

      const submitBtn = form.querySelector("button[type='submit']");
      const originalText = submitBtn ? submitBtn.innerHTML : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Submitting...';
      }

      function onLeadSuccess() {
        if (typeof gtag === "function") {
          gtag("event", "conversion", {
            send_to: "AW-17868096089/xkDpCM3vqO4bENmElshC"
          });
        }
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
        form.reset();
        closeDialog();
        showToast("Success! Thank you. STELLAR's lead architect will connect with you within 24 business hours.", false);
      }

      function onLeadError(msg) {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
        showToast(msg || "Could not submit enquiry automatically. Please WhatsApp or call us directly at +91 90147 57379.", true);
      }

      // Step 1: Submit to PHP backend send-mail.php (delivers directly to contact@stellarweb.in)
      const formData = new FormData(form);

      fetch("send-mail.php", {
        method: "POST",
        body: formData,
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          "Accept": "application/json"
        }
      })
      .then((res) => {
        if (!res.ok) throw new Error("Server HTTP " + res.status);
        return res.json();
      })
      .then((data) => {
        if (data && data.status === "success") {
          onLeadSuccess();
        } else {
          throw new Error(data && data.message ? data.message : "Submission failed");
        }
      })
      .catch((err) => {
        console.warn("send-mail.php unavailable or failed, switching to direct delivery fallback:", err);

        // Step 2: Fallback to FormSubmit.co API directly sending to contact@stellarweb.in
        const fallbackData = {
          name: form.elements["name"] ? form.elements["name"].value : "",
          email: form.elements["email"] ? form.elements["email"].value : "",
          phone: form.elements["phone"] ? form.elements["phone"].value : "",
          message: form.elements["message"] ? form.elements["message"].value : "",
          form_source: form.elements["form_type"] ? form.elements["form_type"].value : (form.id === "popupQuoteForm" ? "Popup Modal Form" : "Hero Quote Form"),
          _subject: "New Project Enquiry from STELLAR Website - " + (form.elements["name"] ? form.elements["name"].value : ""),
          _template: "table",
          _captcha: "false"
        };

        fetch("https://formsubmit.co/ajax/contact@stellarweb.in", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(fallbackData)
        })
        .then((res) => res.json())
        .then((resData) => {
          if (resData && (resData.success === "true" || resData.success === true)) {
            onLeadSuccess();
          } else {
            throw new Error("Fallback failed");
          }
        })
        .catch((fbErr) => {
          console.error("All lead delivery mechanisms failed:", fbErr);
          onLeadError("Submission error. Please email contact@stellarweb.in or WhatsApp us directly at +91 90147 57379.");
        });
      });
    });

    form
      .querySelectorAll("input:not([type='hidden']):not([name='website_url']), select, textarea")
      .forEach((input) => {
        if (input.name === "phone") {
          input.setAttribute("maxlength", "10");
          input.setAttribute("inputmode", "numeric");
          input.addEventListener("input", () => {
            const digits = (input.value || "").replace(/\D/g, "").slice(0, 10);
            if (input.value !== digits) input.value = digits;
          });
        }
        input.addEventListener("blur", () => validateField(input));
        input.addEventListener("input", () => {
          if (input.closest(".form-field")?.classList.contains("has-error")) {
            validateField(input);
          }
        });
      });
  }
  forms.forEach(bindQuoteForm);

  /* ---------- 9. WhatsApp popup modal ---------- */
  const waPopup = document.querySelector("[data-wa-popup]");
  const waCloseBtn = waPopup ? waPopup.querySelector("[data-wa-popup-close]") : null;
  const waViews = waPopup ? waPopup.querySelectorAll("[data-wa-view]") : [];
  const WA_CAREER_URL = "mailto:support@stellarweb.in?subject=Career%20Application%20at%20STELLAR";
  const WA_SERVICE_URL = "https://wa.me/919014757379?text=Hello%20STELLAR%20team%2C%20I%20am%20interested%20in%20discussing%20a%20project.";

  function waShowView(name) {
    if (!waViews) return;
    waViews.forEach((view) => {
      const show = view.getAttribute("data-wa-view") === name;
      view.hidden = !show;
    });
  }

  function waOpenPopup() {
    if (!waPopup) return;
    waShowView("choice");
    waPopup.classList.add("is-open");
    body.style.overflow = "hidden";
  }

  function waClosePopup() {
    if (!waPopup) return;
    waPopup.classList.remove("is-open");
    body.style.overflow = "";
  }

  document.querySelectorAll('a[href*="wa.me"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      if (typeof gtag_report_conversion === "function") {
        gtag_report_conversion();
      }
      e.preventDefault();
      waOpenPopup();
    });
  });

  if (waPopup) {
    if (waCloseBtn) waCloseBtn.addEventListener("click", waClosePopup);
    waPopup.addEventListener("click", (e) => {
      if (e.target === waPopup) waClosePopup();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && waPopup.classList.contains("is-open")) {
        waClosePopup();
      }
    });
  }

  document.querySelectorAll("[data-wa-job]").forEach((btn) => {
    btn.addEventListener("click", () => waShowView("job"));
  });

  document.querySelectorAll("[data-wa-service]").forEach((btn) => {
    btn.addEventListener("click", () => {
      waClosePopup();
      if (typeof gtag_report_conversion === "function") {
        gtag_report_conversion();
      }
      window.open(WA_SERVICE_URL, "_blank");
    });
  });

  document.querySelectorAll("[data-wa-career]").forEach((btn) => {
    btn.addEventListener("click", () => {
      waClosePopup();
      window.open(WA_CAREER_URL, "_blank");
    });
  });

  document.querySelectorAll("[data-wa-back]").forEach((btn) => {
    btn.addEventListener("click", () => waShowView("choice"));
  });

  /* ---------- 10. Portfolio Load More Functionality ---------- */
  const grid = document.getElementById("projectGrid");
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  if (grid && loadMoreBtn) {
    const cards = Array.from(grid.children);
    const initialVisible = 6;
    const loadIncrement = 3;
    let currentlyVisible = initialVisible;

    for (let i = initialVisible; i < cards.length; i++) {
      cards[i].classList.add("hidden-card");
    }

    loadMoreBtn.addEventListener("click", function () {
      const nextVisible = Math.min(currentlyVisible + loadIncrement, cards.length);
      for (let i = currentlyVisible; i < nextVisible; i++) {
        cards[i].classList.remove("hidden-card");
        // trigger observer or reveal
        cards[i].classList.add("in-view");
      }
      currentlyVisible = nextVisible;
      if (currentlyVisible >= cards.length) {
        loadMoreBtn.style.display = "none";
      }
    });
  }

  /* ---------- 11. URL check for successful form redirect ---------- */
  try {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("sent") === "1" || urlParams.get("status") === "success") {
      showToast("Success! Thank you. STELLAR's lead architect will connect with you within 24 business hours.", false);
      if (typeof gtag === "function") {
        gtag("event", "conversion", {
          send_to: "AW-17868096089/xkDpCM3vqO4bENmElshC"
        });
      }
      // Clean URL parameter without reload
      if (window.history && window.history.replaceState) {
        const cleanUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    }
  } catch (e) {
    // ignore
  }
})();
