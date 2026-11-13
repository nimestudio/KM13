function initLenis() {
  const lenis = new Lenis({
    lerp: 0.1,
    smoothWheel: true,
  });

  window.lenis = lenis;

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);
}
  
function lazyVideos() {
  const lazyVideos = document.querySelectorAll("video.lazy-bg-video");

  if (lazyVideos.length === 0) return;

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const video = entry.target;
        const src = video.getAttribute("data-src");
        if (src) {
          video.src = src;
          video.load();
          video.play().catch(() => {});
          observer.unobserve(video);
        }
      }
    });
  }, { rootMargin: "200px 0px" });

  lazyVideos.forEach(video => observer.observe(video));
}

function mobileMenu() {
  const menu = document.querySelector(".navmenu");
  const openBtn = document.querySelector(".nav-open-button");
  if (!menu || !openBtn) return;

  const stickyNavWrap = document.querySelector(".nav-wrap");
  const iconLines = openBtn.querySelectorAll(".nav-open-button-line");
  const buttons = menu.querySelectorAll(".navmenu-buttons-wrap .button-menu");
  const contacts = menu.querySelectorAll(".navmenu-contact-block");
  const line = menu.querySelector(".border-line");
  const footers = menu.querySelectorAll(".text-mobile-footer");
  const links = menu.querySelectorAll("a");

  let open = false;
  let tl = null;

  const show = () => {
    stickyNavWrap?.classList.add("nav-open");
    gsap.set(menu, { display: "flex" });
    tl = gsap.timeline()
      .to(menu, { opacity: 1, duration: 0.3 })
      .to(iconLines[1], { scaleX: 0, duration: 0.3 }, 0)
      .to(iconLines[0], { rotation: -38, y: 5, duration: 0.3 }, 0.2)
      .to(iconLines[2], { rotation: 38, y: -6, duration: 0.3 }, 0.2)
      .fromTo(buttons, { y: -10 }, { y: 0, duration: 0.8, stagger: 0.1, ease: "power2.out" }, 0.1)
      .fromTo(buttons, { opacity: 0 }, { opacity: 1, duration: 2, stagger: 0.1 }, 0.1)
      .fromTo(contacts, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 1, stagger: 0.1, ease: "power2.out" }, 0.3)
      .fromTo(line, { width: 0 }, { width: "100%", duration: 1, ease: "power2.out" }, 0.75)
      .fromTo(footers, { opacity: 0 }, { opacity: 1, duration: 1, stagger: 0.2, ease: "power2.out" }, 1);
  };

  const hide = () => {
    stickyNavWrap?.classList.remove("nav-open");
    tl = gsap.timeline({
      onComplete: () => gsap.set(menu, { display: "none" }),
    })
      .to(menu, { opacity: 0, duration: 0.5 }, 0)
      .to(iconLines[0], { rotation: 0, y: 0, duration: 0.4 }, 0)
      .to(iconLines[1], { scaleX: 1, duration: 0.4 }, 0)
      .to(iconLines[2], { rotation: 0, y: 0, duration: 0.4 }, 0)
      .to([buttons, contacts], { opacity: 0, y: -5, duration: 0.4, stagger: 0.02 }, 0)
      .to(line, { width: 0, duration: 0.4 }, 0)
      .to(footers, { opacity: 0, duration: 0.25, stagger: 0.02 }, 0);
  };

  const closeInstant = () => {
    if (tl) tl.kill(true);
    open = false;
    stickyNavWrap?.classList.remove("nav-open");
    gsap.set(menu, { display: "none", opacity: 0 });
    gsap.set(buttons, { opacity: 0, y: 0 });
    gsap.set(contacts, { opacity: 0, y: 0 });
    gsap.set(line, { width: 0 });
    gsap.set(footers, { opacity: 0 });
    gsap.set(iconLines[0], { rotation: 0, y: 0 });
    gsap.set(iconLines[1], { scaleX: 1 });
    gsap.set(iconLines[2], { rotation: 0, y: 0 });
  };

  const handleToggle = () => {
    if (tl) tl.kill(true);
    if (open) {
      hide();
    } else {
      show();
    }
    open = !open;
  };

  const handleLinkClick = (link) => {
    if (!open) return;
    if (link.getAttribute("href")?.startsWith("#")) {
      open = false;
      hide();
    }
  };

  const handlePageShow = (e) => {
    if (e.persisted && open) closeInstant();
  };

  gsap.matchMedia().add("(max-width: 991px)", () => {
    openBtn.addEventListener("click", handleToggle);
    links.forEach((link) => link.addEventListener("click", () => handleLinkClick(link)));
    window.addEventListener("transitionCovered", closeInstant);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      if (tl) tl.kill(true);
      openBtn.removeEventListener("click", handleToggle);
      links.forEach((link) => link.removeEventListener("click", () => handleLinkClick(link)));
      window.removeEventListener("transitionCovered", closeInstant);
      window.removeEventListener("pageshow", handlePageShow);
      closeInstant();
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

      gsap.delayedCall(DURATION + (HOLD * 0.1), () => {
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

function initLinesReveal() {
  document.fonts.ready.then(() => {
    document.querySelectorAll('[data-animation="lines"]').forEach((el) => {
      el.dataset.initialHtml ||= el.innerHTML;
      gsap.set(el, { visibility: 'visible' });

      const split = new SplitText(el, { type: 'lines', linesClass: 'single-line-inner' });
      split.lines.forEach((line) => {
        const mask = document.createElement('div');
        mask.className = 'single-line';
        line.parentNode.insertBefore(mask, line);
        mask.appendChild(line);
      });

      gsap.fromTo(split.lines,
  		{ yPercent: 100, opacity: 0, display: 'block' },
  		{
    		yPercent: 0,
    		opacity: 1,
    		duration: 1.5,
    		stagger: 0.1,
    		ease: 'power3.out',
    		scrollTrigger: { trigger: el, start: el.classList.contains("text-with-video") ? "top 45%" : "top 80%" }
  		}
	  );
    });
  });

if (!initLinesReveal.added) {
 initLinesReveal.added = true;
  let lastWidth = window.innerWidth;

  window.addEventListener('resize', () => {
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;

    clearTimeout(initLinesReveal.timer);
    initLinesReveal.timer = setTimeout(() => {
      document.querySelectorAll('[data-animation="lines"]').forEach((el) => {
        ScrollTrigger.getAll()
          .filter((st) => el.contains(st.trigger))
          .forEach((st) => st.kill());
        if (el.dataset.initialHtml) el.innerHTML = el.dataset.initialHtml;
        gsap.set(el, { clearProps: 'all' });
      });
      initLinesReveal();
    }, 250);
  });
}
}

function fadeReveal() {
  document.querySelectorAll('[data-animation="fade"]').forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      duration: 2,
      ease: "power1.out",
      scrollTrigger: { trigger: el, start: "top 85%" }
    });
  });
}

function buttonHoverArrows() {
  gsap.matchMedia().add("(min-width: 992px)", () => {
    document.querySelectorAll(".button-arrow").forEach((btn) => {
      const left = btn.querySelector(".button-arrow-left");
      const right = btn.querySelector(".button-arrow-right");
      const text = btn.querySelector(".button-text");

      const val = btn.classList.contains("fw-button") ? 95 : 50;

      if (left) gsap.set(left, { x: -val });

      const hover = (scale, rX, lX, tX) => {
        gsap.to(btn, { scale, duration: 0.2, ease: "power2.Out", overwrite: true });
        if (right) gsap.to(right, { x: rX, duration: 1, ease: "power3.inOut", overwrite: true });
        if (left) gsap.to(left, { x: lX, duration: 1, ease: "power3.inOut", overwrite: true });
        if (text) gsap.to(text, { x: tX, duration: 1, ease: "power3.inOut", overwrite: true });
      };

      btn.addEventListener("mouseenter", () => hover(1.03, val, 0, 21));
      btn.addEventListener("mouseleave", () => hover(1, 0, -val, 0));
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
      toggleActions: "play none none reverse"
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
  const threshold = 250;

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
  initLenis();
  lazyVideos();
  mobileMenu();
  buttonHoverArrows();
  initYear();
  borderLines();
  pageTransitions();
  initParallax();
  initFooterAnimation();
  initFooterImages();
  initLinesReveal();
  fadeReveal();
};

document.addEventListener('DOMContentLoaded', initMain);
