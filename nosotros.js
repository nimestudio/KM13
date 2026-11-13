function backgroundColors() {
  ScrollTrigger.create({
    trigger: ".section-nosotros-about",
    start: "top 50%",
    end: "bottom 75%",
    onToggle: (self) => {
      document.body.style.backgroundColor = self.isActive ? "var(--color--blue)" : "";
      document.body.style.color = self.isActive ? "var(--color--white)" : "";
    },
  });
}

function galleryParallax() {
  const section = document.querySelector(".gallery-photos");
  if (!section) return;

  const parallax = 25;
  const CursorX = 0.1;
  const CursorY = 0.08;

  const wraps = [...section.querySelectorAll(".gallery-grid-image-wrap")];
  const logo = document.querySelector(".tree-logo");
  const aboutSection = document.querySelector(".section-nosotros-about");

  let mm = gsap.matchMedia();

  mm.add({
    isMobile: "(max-width: 767px)",
    isDesktop: "(min-width: 768px)"
  }, (context) => {
    let { isMobile } = context.conditions;

    wraps.forEach((wrap) => {
      if (wrap.dataset.parallax) {
        const dir = wrap.dataset.parallax === "down" ? -1 : 1;
        gsap.fromTo(wrap,
          { yPercent: dir * parallax },
          {
            yPercent: -dir * parallax,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: 1
            }
          }
        );
      }

      gsap.to(wrap, {
        opacity: 0,
        duration: 0.5,
        scrollTrigger: {
          trigger: wrap,
          start: isMobile ? "center 60%" : "center 20%",
          end: isMobile ? "center 30%" : "center top",
          scrub: 1
        }
      });
    });

    if (logo && aboutSection) {
      gsap.to(logo, {
        opacity: 0,
        scrollTrigger: {
          trigger: aboutSection,
          start: isMobile ? "top 65%" : "top 95%",
          end: isMobile ? "top 55%" : "top 85%",
          scrub: 1
        }
      });
    }
  });

  const movers = wraps.map((wrap) => ({
    wrap,
    xTo: gsap.quickTo(wrap, "x", { duration: 0.8, ease: "power3" }),
    yTo: gsap.quickTo(wrap, "y", { duration: 0.8, ease: "power3" })
  }));

  section.addEventListener("pointermove", (e) => {
    const rect = section.getBoundingClientRect();
    const dx = (rect.left + rect.width / 2 - e.clientX) / rect.width;
    const dy = (rect.top + rect.height / 2 - e.clientY) / rect.height;
    movers.forEach(({ wrap, xTo, yTo }) => {
      const w = wrap.getBoundingClientRect();
      xTo(dx * w.width * CursorX);
      yTo(dy * w.height * CursorY);
    });
  });

  const reset = () => movers.forEach(({ xTo, yTo }) => {
    xTo(0);
    yTo(0);
  });

  section.addEventListener("pointerleave", reset);
  window.addEventListener("pointerup", reset);
}

const initNosotros = () => {
  backgroundColors();
  galleryParallax();
};

document.addEventListener('DOMContentLoaded', initNosotros);