function heroSlider() {
  const slider = document.querySelector(".hero-slider");
  if (!slider) return;

  const videos = [...slider.querySelectorAll(".bg-video")];
  const steps = [...slider.querySelectorAll(".hero-slider-step")];
  const bars = [...slider.querySelectorAll(".hero-slider-nav-step")];
  const dynamics = bars.map((b) => b.querySelector(".hero-slider-nav-step-dynamic"));
  const target = document.querySelector(".section-home-start");

  let current = -1;
  let finished = false;

  gsap.set(videos, { opacity: 0 });
  gsap.set(steps, { opacity: 0 });

  const goTo = (index) => {
    const prev = current;
    current = index;

    videos.forEach((v, i) => {
      gsap.to(v, { opacity: i === index ? 1 : 0, duration: 0.5 });
      if (i === index) {
        v.currentTime = 0;
        v.play();
      } else if (i === prev) {
        gsap.delayedCall(0.5, () => v.pause());
      }
      if (i === index + 1) v.load();
    });

    steps.forEach((s, i) => gsap.to(s, { opacity: i === index ? 1 : 0, duration: 0.5 }));
    dynamics.forEach((d, i) => {
      if (i < index) d.style.width = "100%";
      else if (i > index) d.style.width = "0%";
    });
  };

  gsap.ticker.add(() => {
    const v = videos[current];
    const d = dynamics[current];
    if (v && d && v.duration) d.style.width = (v.currentTime / v.duration) * 100 + "%";
  });

  videos.forEach((v, i) =>
    v.addEventListener("ended", () => {
      if (i !== current) return;
      if (i === videos.length - 1) {
        finished = true;
        dynamics[i].style.width = "100%";
        if (target) target.scrollIntoView({ behavior: "smooth" });
      } else {
        goTo(i + 1);
      }
    })
  );

  bars.forEach((b, i) =>
    b.addEventListener("click", () => {
      finished = false;
      goTo(i);
    })
  );

  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      if (finished) {
        finished = false;
        goTo(0);
      } else if (current > -1) {
        videos[current].play();
      }
    } else {
      videos.forEach((v) => v.pause());
    }
  }).observe(slider);

  goTo(0);

  slider.addEventListener("click", (e) => {
  if (e.target.closest(".hero-slider-nav-step")) return;
  if (target) target.scrollIntoView({ behavior: "smooth" });
});

}

function floatingButtons() {
  gsap.matchMedia().add("(hover: hover)", () => {
    document.querySelectorAll(".floating-hero, .floating-gallery, .floating-close-gallery").forEach((btn) => {
      gsap.set(btn, { opacity: 0, xPercent: -50, yPercent: -50 });
      const xTo = gsap.quickTo(btn, "x", { duration: 0.4, ease: "power3" });
      const yTo = gsap.quickTo(btn, "y", { duration: 0.4, ease: "power3" });

      document.addEventListener("mousemove", (e) => {
        xTo(e.clientX);
        yTo(e.clientY);
      });

      const show = () => {
        document.body.style.cursor = "none";
        gsap.to(btn, { opacity: 1, duration: 0.3 });
      };
      const hide = () => {
        document.body.style.cursor = "";
        gsap.to(btn, { opacity: 0, duration: 0.3 });
      };

      if (btn.classList.contains("floating-close-gallery")) {
        const attach = () => {
          const view = document.querySelector(".w-lightbox-view");
          const backdrop = document.querySelector(".w-lightbox-backdrop");
          if (view && backdrop && !view.dataset.floatingInit) {
            view.dataset.floatingInit = "1";

            view.addEventListener("mouseover", (e) => {
              if (e.target.closest(".w-lightbox-image")) hide();
              else show();
            });
            view.addEventListener("mouseleave", hide);

            new MutationObserver(() => {
              if (backdrop.classList.contains("w-lightbox-hide")) hide();
            }).observe(backdrop, { attributes: true, attributeFilter: ["class"] });
          }
        };
        new MutationObserver(attach).observe(document.body, { childList: true, subtree: true });
        return;
      }

      const area = btn.classList.contains("floating-hero") ? ".section-home-hero" : ".gallery-block";
      const zones = document.querySelectorAll(area);

      zones.forEach((zone) => {
        zone.addEventListener("mouseenter", show);
        zone.addEventListener("mouseleave", (e) => {
          if (e.relatedTarget && e.relatedTarget.closest(area)) return;
          hide();
        });
      });

      if (btn.classList.contains("floating-hero")) {
        const nav = document.querySelector(".hero-slider-nav");
        if (nav) {
          nav.addEventListener("mouseenter", hide);
          nav.addEventListener("mouseleave", show);
        }
      }
    });
  });
}

function navSwap() {
  gsap.matchMedia().add("(max-width: 767px)", () => {
    const logoWrap = document.querySelector(".nav-logo-wrap");
    const textWrap = document.querySelector(".nav-text-wrap");
    if (!logoWrap || !textWrap) return;

    const st = {
      trigger: ".section-home-hero",
      start: "bottom 20%",
      end: "bottom top",
      scrub: true,
    };

    gsap.fromTo(logoWrap, { opacity: 0 }, { opacity: 1, ease: "none", scrollTrigger: st });
    gsap.fromTo(textWrap, { opacity: 1 }, { opacity: 0, ease: "none", scrollTrigger: st });
  });
}

function heroScrollAway() {
  const logoDesktop = document.querySelector(".hero-logo-desktop");
  const logoMobile = document.querySelector(".hero-logo-mobile");
  const steps = document.querySelectorAll(".hero-slider-steps");
  const nav = document.querySelector(".hero-slider-nav");
  if (!logoDesktop || !logoMobile) return;

  gsap.to(logoDesktop, {
    width: 188,
    ease: "none",
    scrollTrigger: {
      trigger: ".section-home-hero",
      start: "top top",
      end: "bottom 50%",
      scrub: true,
    },
  });

  gsap.to(logoDesktop, {
    y: -4,
    ease: "none",
    scrollTrigger: {
      trigger: ".section-home-hero",
      start: "top top",
      end: "bottom 50%",
      scrub: true,
    },
  });

  gsap.to(logoDesktop, {
    opacity: 0,
    ease: "none",
    scrollTrigger: {
      trigger: ".section-home-hero",
      start: "bottom -10%",
      end: "bottom -10%",
      scrub: true,
    },
  });

  gsap.to(logoMobile, {
    width: 82,
    ease: "none",
    scrollTrigger: {
      trigger: ".section-home-hero",
      start: "top top",
      end: "bottom 90%",
      scrub: true,
    },
  });

  gsap.to(logoMobile, {
    opacity: 0,
    ease: "none",
    scrollTrigger: {
      trigger: ".section-home-hero",
      start: "bottom 80%",
      end: "bottom 50%",
      scrub: true,
    },
  });

  gsap.to(steps, {
    opacity: 0,
    ease: "none",
    scrollTrigger: {
      trigger: ".section-home-hero",
      start: "bottom 80%",
      end: "bottom 50%",
      scrub: true,
    },
  });

  gsap.to(nav, {
    opacity: 0,
    ease: "none",
    scrollTrigger: {
      trigger: ".section-home-hero",
      start: "bottom 80%",
      end: "bottom 50%",
      scrub: true,
    },
  });
}

function faqAccordion() {
  const items = document.querySelectorAll(".faq-item");
  let open = null;

  const close = (item) => {
    gsap.to(item.querySelector(".faq-answer"), { height: 0, duration: 0.4, ease: "power2.inOut" });
    gsap.to(item.querySelector(".faq-icon-line-v"), { rotate: 0, duration: 0.3, ease: "power2.inOut" });
  };

  items.forEach((item) => {
    const answer = item.querySelector(".faq-answer");
    const body = item.querySelector(".body-s");
    gsap.set(answer, { height: 0 });
    if (body) gsap.set(body, { opacity: 0 });

    item.addEventListener("click", () => {
      if (open === item) {
        close(item);
        open = null;
        return;
      }
      if (open) close(open);
      gsap.to(answer, { height: "auto", duration: 0.5, ease: "power2.inOut" });
      gsap.to(item.querySelector(".faq-icon-line-v"), { rotate: 90, duration: 0.3, ease: "power2.inOut" });
      if (body) gsap.to(body, { opacity: 1, duration: 0.4, delay: 0.15 });
      open = item;
    });
  });
}

function initTestimonialSwiper() {
  const swiperContainer = document.querySelector('.testimonial-swiper');
  if (!swiperContainer) return;

  const containerWidth = window.innerWidth;
  const calculatedOffset = (containerWidth / 4) + 10;

  const wrapper = swiperContainer.querySelector('.swiper-wrapper');
  if (wrapper) {
    wrapper.style.paddingLeft = calculatedOffset + 'px';
  }

  const formatNumber = (num) => String(num).padStart(2, '0');
  const slideElements = swiperContainer.querySelectorAll('.swiper-slide');
  const totalSlides = slideElements.length;

  const swiper = new Swiper('.testimonial-swiper', {
    loop: true,
    grabCursor: true,
    breakpoints: {
      768: {
        slidesPerView: 1,
        spaceBetween: 48
      },
      992: {
        slidesPerView: 'auto',
        spaceBetween: 80
      }
    },
    navigation: {
      nextEl: '.testimonial-next',
      prevEl: '.testimonial-prev'
    },
    on: {
      init: function (s) {
        const currentEl = document.querySelector('.testimonial-current');
        const totalEl = document.querySelector('.testimonial-total');
        if (currentEl) currentEl.textContent = formatNumber(s.realIndex + 1);
        if (totalEl) totalEl.textContent = formatNumber(totalSlides);
      },
      slideChange: function (s) {
        const currentEl = document.querySelector('.testimonial-current');
        if (currentEl) currentEl.textContent = formatNumber(s.realIndex + 1);
      }
    }
  });
}

function galleryTrigger() {
  if (window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".gallery-block").forEach((block) => {
      const lightbox = block.querySelector(".gallery-thumbnails");
      if (lightbox) {
        block.addEventListener("click", () => lightbox.click());
      }
    });
  } else {
    document.querySelectorAll(".gallery-trigger").forEach((trigger) => {
      const lightbox = trigger.querySelector(".gallery-thumbnails");
      const btn = trigger.querySelector(".button");
      if (lightbox && btn) {
        btn.addEventListener("click", () => lightbox.click());
      }
    });
  }
}

function backgroundColors() {
  const sections = [
    [".section-home-start", "--color--background", "", "top bottom"],
    [".section-home-gallery", "--color--yellow"],
    [".section-home-slider", "--color--blue", "--color--white"],
    [".section-home-faq", "--color--background"],
  ];
  sections.forEach(([trigger, color, textColor, start = "top 50%"]) => {
    ScrollTrigger.create({
      trigger,
      start,
      end: "bottom 50%",
      onToggle: (self) => {
        document.body.style.backgroundColor = self.isActive ? `var(${color})` : "";
        document.body.style.color = textColor && self.isActive ? `var(${textColor})` : "";
      },
    });
  });
}

const initHome = () => {
  heroSlider();
  floatingButtons();
  navSwap();
  heroScrollAway();
  faqAccordion();
  initTestimonialSwiper();
  galleryTrigger();
  backgroundColors();
};

document.addEventListener('DOMContentLoaded', initHome);