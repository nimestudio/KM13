function heroLoad() {
  const overlay = document.querySelector(".hero-reveal-overlay");
  if (!overlay) return;

  gsap.set(".hero-logo-wrap", { yPercent: -20, opacity: 0 });
  gsap.set(".nav-wrap.home-mobile", { yPercent: -100, opacity: 0 });
  gsap.set(".hero-slider-step", { yPercent: 180, scale: 0.5, opacity: 0 });
  gsap.set(".hero-slider-image-wrap", { scale: 0 });
  gsap.set(".hero-slider-step-texts", { yPercent: 20, opacity: 0 });
  gsap.set(".hero-slider-nav", { y: -10, opacity: 0 });

  gsap.timeline()
    .to(overlay, { autoAlpha: 0, duration: 2, ease: "power1.inOut" }, 0)
    .to(".hero-logo-wrap", { yPercent: 0, duration: 1, ease: "power2.out" }, 1.5)
    .to(".hero-logo-wrap", { opacity: 1, duration: 1.5, ease: "power1.out" }, 1.5)
    .to(".nav-wrap.home-mobile", { yPercent: 0, opacity: 1, duration: 1.5, ease: "power2.out" }, 1.6)
    .to(".nav-wrap.home-mobile", { opacity: 1, duration: 1.3, ease: "none" }, 1.8)
    .to(".hero-slider-step", { yPercent: 0, scale: 1, duration: 1.4, ease: "power3.out" }, 1.8)
    .to(".hero-slider-step", { opacity: 1, duration: 0.7, ease: "power1.out" }, 1.8)
    .to(".hero-slider-image-wrap", { scale: 1, duration: 1, ease: "power2.out" }, 2.2)
    .to(".hero-slider-step-texts", { yPercent: 0, duration: 1, ease: "power2.inOut" }, 2.2)
    .to(".hero-slider-step-texts", { opacity: 1, duration: 0.8, ease: "none" }, 2.5)
    .to(".hero-slider-nav", { y: 0, opacity: 1, duration: 1.2, ease: "power2.out" }, 2.8);
}

function heroSlider(lenisInstance) {
  const slider = document.querySelector(".hero-slider");
  if (!slider) return;

  const videos = [...slider.querySelectorAll(".bg-video")];
  const steps = [...slider.querySelectorAll(".hero-slider-step")];
  const bars = [...slider.querySelectorAll(".hero-slider-nav-step")];
  const dynamics = bars.map((b) => b.querySelector(".hero-slider-nav-step-dynamic"));
  const target = document.querySelector(".section-home-start");

  let current = -1;
  let finished = false;

  const scrollToTarget = () => {
    if (!target) return;
    const navHeight = window.innerWidth <= 767 ? 52 : 64;
    const targetPosition = Math.round(target.getBoundingClientRect().top + window.pageYOffset - navHeight);

    const activeLenis = lenisInstance || window.lenis;

    if (activeLenis) {
      activeLenis.scrollTo(targetPosition, {
        duration: 1,
        force: true
      });
    } else {
      window.scrollTo({ top: targetPosition, behavior: "smooth" });
    }
  };

  gsap.set(videos, { opacity: 0 });

  const stepData = steps.map((step) => {
    const textItems = [...step.querySelectorAll(".hero-slider-step-text")];
    const imageItems = [...step.querySelectorAll(".hero-slider-image")];
    
    gsap.set(textItems, { opacity: 0, y: "20%" });
    gsap.set(imageItems, { opacity: 0, y: "10%" });
    return { textItems, imageItems };
  });

  const goTo = (index) => {
    const prev = current;
    current = index;

    videos.forEach((v, i) => {
      gsap.to(v, { opacity: i === index ? 1 : 0, duration: 1.5, ease: "none" });
      if (i === index) {
        v.currentTime = 0;
        v.play().catch(() => {});
      } else if (i === prev && prev > -1) {
        gsap.delayedCall(1.5, () => v.pause());
      }
      if (i === index + 1) v.load();
    });

    stepData.forEach((data) => {
      data.textItems.forEach((textEl, itemIdx) => {
        gsap.killTweensOf(textEl);

        if (itemIdx === index) {
          gsap.fromTo(textEl, { y: "20%" }, { y: "0%", duration: 1, ease: "power2.inOut" });
          gsap.fromTo(textEl, { opacity: 0 }, { opacity: 1, duration: 1, ease: "power2.in" });
        } else if (itemIdx === prev && prev > -1) {
          gsap.to(textEl, { y: "-20%", duration: 1, ease: "power2.inOut", onComplete: () => gsap.set(textEl, { y: "30%" }) });
          gsap.to(textEl, { opacity: 0, duration: 0.8 });
        } else if (prev === -1 && itemIdx !== index) {
          gsap.set(textEl, { opacity: 0, y: "20%" });
        }
      });

      data.imageItems.forEach((imgEl, itemIdx) => {
        gsap.killTweensOf(imgEl);

        if (itemIdx === index) {
          gsap.fromTo(imgEl, { opacity: 0, y: "10%" }, { opacity: 1, y: "0%", duration: 0.8, ease: "power2.inOut" });
        } else if (itemIdx === prev && prev > -1) {
          gsap.to(imgEl, { opacity: 0, y: "-10%", duration: 0.8, ease: "power2.inOut", onComplete: () => gsap.set(imgEl, { y: "15%" }) });
        } else if (prev === -1 && itemIdx !== index) {
          gsap.set(imgEl, { opacity: 0, y: "10%" });
        }
      });
    });

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
        scrollToTarget();
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

  const activeLenis = lenisInstance || window.lenis;
  if (activeLenis) {
    activeLenis.on('scroll', ({ scroll, direction }) => {
      if (finished && direction === -1 && scroll < slider.offsetHeight) {
        finished = false;
        current = -1;
        goTo(0);
      }
    });
  }

  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      if (finished) {
        finished = false;
        current = -1;
        goTo(0);
      } else if (current > -1) {
        videos[current].play().catch(() => {});
      }
    } else {
      videos.forEach((v) => v.pause());
    }
  }).observe(slider);

  goTo(0);

  slider.addEventListener("click", (e) => {
    if (e.target.closest(".hero-slider-nav-step")) return;
    scrollToTarget();
  });
}
  
function floatingButtons() {
  gsap.matchMedia().add("(hover: hover)", () => {
    document.querySelectorAll(".floating-hero, .floating-gallery, .floating-close-gallery").forEach((btn) => {
      gsap.set(btn, { opacity: 0, xPercent: -50, yPercent: -50 });
      const xTo = gsap.quickTo(btn, "x", { duration: 1.0, ease: "power3" });
      const yTo = gsap.quickTo(btn, "y", { duration: 1.0, ease: "power3" });

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
    const hero = document.querySelector(".section-home-hero");
    if (!logoWrap || !textWrap || !hero) return;

    let heroInView = false;
    const stickyNavWrap = document.querySelector(".nav-wrap");
    let menuOpen = stickyNavWrap?.classList.contains("nav-open") ?? false;
    const updateNav = () => {
      const showText = heroInView && !menuOpen;
      gsap.to(logoWrap, { opacity: showText ? 0 : 1, duration: 0.5, overwrite: true });
      gsap.to(textWrap, { opacity: showText ? 1 : 0, duration: 0.5, overwrite: true });
    };
    const observer = new IntersectionObserver(([entry]) => {
      heroInView = entry.isIntersecting;
      updateNav();
    });
    const menuObserver = stickyNavWrap && new MutationObserver(() => {
      menuOpen = stickyNavWrap.classList.contains("nav-open");
      updateNav();
    });

    observer.observe(hero);
    menuObserver?.observe(stickyNavWrap, { attributes: true, attributeFilter: ["class"] });

    return () => {
      observer.disconnect();
      menuObserver?.disconnect();
      gsap.killTweensOf([logoWrap, textWrap]);
    };
  });
}

function heroScrollAway() {
  const logoWrap = document.querySelector(".hero-logo-wrap");
  const logoDesktop = document.querySelector(".hero-logo-desktop");
  const logoMobile = document.querySelector(".hero-logo-mobile");
  const steps = document.querySelector(".hero-slider-step");
  const sliderNav = document.querySelector(".hero-slider-nav");

  if (!logoDesktop || !logoMobile) return;

  const logoRestWidth = (logo) => {
    const parent = logo.parentElement;
    const cs = getComputedStyle(parent);
    return parent.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  };

  gsap.fromTo(logoDesktop,
    { width: () => logoRestWidth(logoDesktop) },
    {
      width: 188,
      ease: "none",
      immediateRender: false,
      scrollTrigger: {
        trigger: ".section-home-hero",
        start: "bottom 99%",
        end: "bottom 55%",
        scrub: 1,
        invalidateOnRefresh: true
      }
    }
  );

  gsap.to(logoDesktop, {
    y: "-150%",
    ease: "none",
    scrollTrigger: {
      trigger: ".section-home-hero",
      start: "bottom 65%",
      end: "bottom 30%",
      scrub: 1,
    }
  });

  gsap.fromTo(logoMobile,
    { width: () => logoRestWidth(logoMobile) },
    {
      width: 82,
      ease: "none",
      immediateRender: false,
      scrollTrigger: {
        trigger: ".section-home-hero",
        start: "bottom 80%",
        end: "bottom 50%",
        scrub: 1,
        invalidateOnRefresh: true
      }
    }
  );
  
  gsap.to(logoMobile, {
    y: "-150%",
    ease: "none",
    scrollTrigger: {
      trigger: ".section-home-hero",
      start: "bottom 70%",
      end: "bottom 45%",
      scrub: 1,
    }
  });

  if (logoWrap) {
    gsap.fromTo(logoWrap,
      { autoAlpha: 1 },
      {
        autoAlpha: 0,
        ease: "none",
        immediateRender: false,
        scrollTrigger: {
          trigger: ".section-home-hero",
          start: "bottom 1%",
          end: "bottom top",
          scrub: 1
        }
      }
    );
  }

  if (steps) {
    gsap.fromTo(steps,
      { opacity: 1 },
      {
        opacity: 0,
        ease: "none",
        immediateRender: false,
        scrollTrigger: {
          trigger: ".section-home-hero",
          start: "bottom 80%",
          end: "bottom 40%",
          scrub: 1
        }
      }
    );
  }

  if (sliderNav) {
    gsap.fromTo(sliderNav,
      { opacity: 1 },
      {
        opacity: 0,
        ease: "none",
        immediateRender: false,
        scrollTrigger: {
          trigger: ".section-home-hero",
          start: "bottom 80%",
          end: "bottom 40%",
          scrub: 1
        }
      }
    );
  }
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

  const slideElements = swiperContainer.querySelectorAll('.swiper-slide');
  const totalSlides = slideElements.length;
  const formatNumber = (num) => String(num).padStart(2, '0');

  const getOffset = (width) => {
    if (width < 768) return 0;
    return (width / 4) + 10;
  };

  const getOffsetAfter = (width, slideWidth) => {
    if (width < 768) return 0;
    const offsetBefore = getOffset(width);
    const remainingSpace = width - offsetBefore - slideWidth;
    return remainingSpace > 0 ? remainingSpace : 0;
  };

  const currentWidth = window.innerWidth;
  const sampleSlideWidth = slideElements[0] ? slideElements[0].offsetWidth : 0;

  const swiper = new Swiper('.testimonial-swiper', {
    loop: false,
    grabCursor: true,
    speed: 1000,
    slidesOffsetBefore: getOffset(currentWidth),
    slidesOffsetAfter: getOffsetAfter(currentWidth, sampleSlideWidth),
    breakpoints: {
      768: {
        slidesPerView: 1,
        spaceBetween: 48,
        slidesOffsetBefore: getOffset(window.innerWidth),
        slidesOffsetAfter: getOffsetAfter(window.innerWidth, slideElements[0] ? slideElements[0].offsetWidth : 0)
      },
      992: {
        slidesPerView: 'auto',
        spaceBetween: 80,
        slidesOffsetBefore: getOffset(window.innerWidth),
        slidesOffsetAfter: getOffsetAfter(window.innerWidth, slideElements[0] ? slideElements[0].offsetWidth : 0)
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

  window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const sWidth = slideElements[0] ? slideElements[0].offsetWidth : 0;
    swiper.params.slidesOffsetBefore = getOffset(w);
    swiper.params.slidesOffsetAfter = getOffsetAfter(w, sWidth);
    swiper.update();
  });
}

function galleryTrigger() {
  const isHover = window.matchMedia("(hover: hover)").matches;

  document.querySelectorAll(".gallery-block").forEach((block) => {
    const lightbox = block.querySelector(".gallery-thumbnails");
    if (!lightbox) return;

    if (isHover) {
      block.addEventListener("click", () => {
        lightbox.click();
      });
    } else {
      block.querySelectorAll(".button").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          lightbox.click();
        });
      });
    }
  });
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
  heroLoad();
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