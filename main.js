function mobileMenu() {
  gsap.matchMedia().add("(max-width: 991px)", () => {
    const menu = document.querySelector(".navmenu");
    const openBtn = document.querySelector(".nav-open-button");
    if (!menu || !openBtn) return;

    const buttons = menu.querySelectorAll(".navmenu-buttons-wrap .button");
    const contacts = menu.querySelectorAll(".navmenu-contact-block");
    const line = menu.querySelector(".border-line");
    const footers = menu.querySelectorAll(".text-mobile-footer");

    let open = false;
    let scrollY = 0;
    let tl = null;

    const lockScroll = () => {
      scrollY = window.scrollY || window.pageYOffset || 0;
      Object.assign(document.body.style, {
        position: "fixed", top: `-${scrollY}px`, left: "0", right: "0", width: "100%"
      });
      document.documentElement.style.overflow = "hidden";
    };

    const unlockScroll = () => {
      Object.assign(document.body.style, {
        position: "", top: "", left: "", right: "", width: ""
      });
      document.documentElement.style.overflow = "";
      window.scrollTo(0, scrollY);
    };

    const show = () => {
      gsap.set(menu, { display: "flex" });
      tl = gsap.timeline()
        .to(menu, { opacity: 1, duration: 0.8 })
        .fromTo(buttons, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 1.5, stagger: 0.2 }, 0.1)
        .fromTo(contacts, { opacity: 0, y: -15 }, { opacity: 1, y: 0, duration: 1.5, stagger: 0.2 }, 0.5)
        .fromTo(line, { width: 0 }, { width: "100%", duration: 1.5, ease: "power2.out" }, 0.5)
        .fromTo(footers, { opacity: 0 }, { opacity: 1, duration: 1.5, stagger: 0.2 }, 0.75);
    };

    const hide = () => {
      tl = gsap.timeline({ onComplete: () => gsap.set(menu, { display: "none" }) })
        .to(menu, { opacity: 0, duration: 0.8 }, 0)
        .to([buttons, contacts], { opacity: 0, y: -5, duration: 0.5, stagger: 0.02 }, 0)
        .to(line, { width: 0, duration: 0.5 }, 0)
        .to(footers, { opacity: 0, duration: 0.25, stagger: 0.02 }, 0);
    };

    openBtn.addEventListener("click", () => {
      if (tl) tl.kill();
      if (open) {
        unlockScroll();
        hide();
      } else {
        lockScroll();
        show();
      }
      open = !open;
    });

    const closeInstant = () => {
      if (tl) tl.kill();
      open = false;
      unlockScroll();
      gsap.set(menu, { display: "none", opacity: 0 });
      gsap.set(buttons, { opacity: 0, y: 0 });
      gsap.set(contacts, { opacity: 0, y: 0 });
      gsap.set(line, { width: 0 });
      gsap.set(footers, { opacity: 0 });
    };

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
      if (!open) return;
      if (link.getAttribute("href").startsWith("#")) {
        unlockScroll();
        open = false;
        hide();
      }
    });
});

window.addEventListener("transitionCovered", closeInstant);

window.addEventListener("pageshow", (e) => {
  if (e.persisted && open) closeInstant();
});

    return () => {
      if (tl) tl.kill();
      unlockScroll();
      gsap.set(menu, { display: "none", opacity: 0 });
    };
  });
}

function pageTransitions() {
  const overlay = document.querySelector(".page-transition-overlay");
  const images = [...document.querySelectorAll(".page-transition-image")];
  const colors = ["var(--color--blue)", "var(--color--yellow)", "var(--color--green)", "var(--color--orange)"];

  const DURATION = 1.2;
  const INTERVAL = 0.3;
  const HOLD = images.length * INTERVAL;

  const dispatchReveal = () => window.dispatchEvent(new CustomEvent("pageReveal"));

  if (!overlay || !images.length) {
    document.documentElement.classList.remove("is-transitioning");
    setTimeout(dispatchReveal, 0);
    return;
  }

  const slideshow = gsap.timeline({ repeat: -1, paused: true });
  images.forEach((img, i) => {
    const others = images.filter((item) => item !== img);
    slideshow.set(others, { autoAlpha: 0 }, i * INTERVAL);
    slideshow.set(img, { autoAlpha: 1 }, i * INTERVAL);
  });
  slideshow.to({}, { duration: INTERVAL });

  const showStaticImage = (index) => {
    gsap.set(images, { autoAlpha: 0 });
    gsap.set(images[index], { autoAlpha: 1 });
  };

  const savedColor = sessionStorage.getItem("transitionColor");
  const savedImage = sessionStorage.getItem("transitionImage");
  const navEntry = performance.getEntriesByType("navigation")[0];
  const isBack = navEntry && navEntry.type === "back_forward";

  if (isBack || !savedColor) {
    document.documentElement.classList.remove("is-transitioning");
    gsap.set(overlay, { display: "none" });
    setTimeout(dispatchReveal, 0);
  } else {
    overlay.style.background = savedColor;
    const startIndex = savedImage !== null ? Number(savedImage) : 0;
    showStaticImage(startIndex);
    gsap.set(overlay, { display: "flex", yPercent: 0 });

    slideshow.play(startIndex * INTERVAL);

    let pageLoaded = document.readyState === "complete";
    let minTimeElapsed = false;

    const tryExit = () => {
      if (pageLoaded && minTimeElapsed) {
        gsap.to(overlay, {
          yPercent: -100,
          duration: DURATION,
          ease: "power3.inOut",
          onComplete: () => {
            slideshow.pause();
            document.documentElement.classList.remove("is-transitioning");
            gsap.set(overlay, { display: "none" });
            sessionStorage.removeItem("transitionColor");
            sessionStorage.removeItem("transitionImage");
            document.documentElement.removeAttribute("data-transition-image");
          }
        });
        dispatchReveal();
      }
    };

    gsap.delayedCall(HOLD, () => {
      minTimeElapsed = true;
      tryExit();
    });

    if (pageLoaded) {
      minTimeElapsed = true;
      tryExit();
    } else {
      window.addEventListener("load", () => {
        pageLoaded = true;
        tryExit();
      });
    }
  }

  document.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (link.hasAttribute("no-transition")) return;
      if (!href || href.startsWith("#") || link.target === "_blank" || link.hostname !== window.location.hostname) return;

      e.preventDefault();
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      sessionStorage.setItem("transitionColor", randomColor);
      overlay.style.background = randomColor;

      showStaticImage(0);
      slideshow.repeat(0);

      gsap.set(overlay, { display: "flex", yPercent: 100 });
      gsap.to(overlay, {
        yPercent: 0,
        duration: DURATION,
        ease: "power3.inOut"
      });

      gsap.delayedCall(DURATION - 0.4, () => {
        slideshow.play(0);
      });

      gsap.delayedCall(DURATION + (HOLD * 0.5), () => {
        slideshow.pause();
        const finalIndex = Math.round(slideshow.time() / INTERVAL) % images.length;
        sessionStorage.setItem("transitionImage", finalIndex);
        window.dispatchEvent(new CustomEvent("transitionCovered"));
        window.location.href = href;
      });
    });
  });

  window.addEventListener("pageshow", (e) => {
    if (e.persisted) {
      slideshow.pause(0);
      document.documentElement.classList.remove("is-transitioning");
      gsap.set(overlay, { display: "none" });
      sessionStorage.removeItem("transitionColor");
      sessionStorage.removeItem("transitionImage");
      document.documentElement.removeAttribute("data-transition-image");
    }
  });
}

function buttonHoverArrows() {
  gsap.matchMedia().add("(min-width: 992px)", () => {
    document.querySelectorAll(".button").forEach((btn) => {
      const left = btn.querySelector(".button-arrow-left");
      const right = btn.querySelector(".button-arrow-right");
      if (left) gsap.set(left, { x: -50 });

      const hover = (scale, rX, lX) => {
        gsap.to(btn, { scale, duration: 0.2, ease: "power2.Out", overwrite: true });
        if (right) gsap.to(right, { x: rX, duration: 1, ease: "power3.inOut", overwrite: true });
        if (left) gsap.to(left, { x: lX, duration: 1, ease: "power3.inOut", overwrite: true });
      };

      btn.addEventListener("mouseenter", () => hover(1.03, 50, 0));
      btn.addEventListener("mouseleave", () => hover(1, 0, -50));
    });
  });
}

function initYear() {
  document.querySelectorAll('.footer-year').forEach(year => year.textContent = new Date().getFullYear());
}

function borderLines() {
  gsap.utils.toArray(".border-line").forEach((line) => {
    gsap.from(line, {
      width: 0,
      duration: 1.5,
      ease: "power2.out",
      scrollTrigger: { trigger: line, start: "top 88%", once: true },
    });
  });
}

function initParallax() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray("img[data-image='parallax']").forEach((img) => {
    const parent = img.parentElement;

    gsap.fromTo(
      img,
      { yPercent: -10 },
      {
        yPercent: 10,
        ease: "none",
        scrollTrigger: {
          trigger: parent,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      }
    );
  });
}

function initFooterAnimation() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".footer",
      start: "top 50%",
      toggleActions: "play none none none"
    }
  });

  tl.from(".footer-logo-up", {
    yPercent: -100,
    duration: 1.5,
    ease: "power3.out"
  })
  .from(".footer-logo-down", {
    yPercent: 100,
    duration: 1.5,
    ease: "power3.out"
  }, "<");
}

function initFooterImages() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  const wrap = document.querySelector(".footer-images-wrap");
  if (!wrap) return;

  const images = [...wrap.querySelectorAll(".footer-image")];
  if (!images.length) return;

  let currentIndex = 0;
  let mobileTimer = null;
  let lastX = 0;
  let lastY = 0;
  let distanceMoved = 0;
  const threshold = 70;

  const showImage = (index) => {
    gsap.set(images, { autoAlpha: 0 });
    gsap.set(images[index], { autoAlpha: 1 });
    currentIndex = index;
  };

  showImage(0);

  const isTouch = window.matchMedia("(pointer: coarse)").matches;

  const handleMouseMove = (e) => {
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    distanceMoved += Math.sqrt(dx * dx + dy * dy);
    lastX = e.clientX;
    lastY = e.clientY;

    if (distanceMoved >= threshold) {
      distanceMoved = 0;
      let nextIndex;
      do {
        nextIndex = Math.floor(Math.random() * images.length);
      } while (nextIndex === currentIndex && images.length > 1);
      showImage(nextIndex);
    }
  };

  const startMobile = () => {
    if (mobileTimer) return;
    mobileTimer = setInterval(() => {
      let nextIndex = (currentIndex + 1) % images.length;
      showImage(nextIndex);
    }, 3500);
  };

  const stopMobile = () => {
    if (mobileTimer) {
      clearInterval(mobileTimer);
      mobileTimer = null;
    }
  };

  ScrollTrigger.create({
    trigger: wrap,
    start: "top bottom",
    end: "bottom top",
    onEnter: () => {
      if (isTouch) {
        startMobile();
      } else {
        window.addEventListener("mousemove", handleMouseMove);
      }
    },
    onLeave: () => {
      if (isTouch) {
        stopMobile();
      } else {
        window.removeEventListener("mousemove", handleMouseMove);
      }
    },
    onEnterBack: () => {
      if (isTouch) {
        startMobile();
      } else {
        window.addEventListener("mousemove", handleMouseMove);
      }
    },
    onLeaveBack: () => {
      if (isTouch) {
        stopMobile();
      } else {
        window.removeEventListener("mousemove", handleMouseMove);
      }
    }
  });
}

const initMain = () => {
  mobileMenu();
  buttonHoverArrows();
  initYear();
  borderLines();
  pageTransitions();
  initParallax();
  initFooterAnimation();
  initFooterImages();
};

document.addEventListener('DOMContentLoaded', initMain);