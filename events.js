function backgroundColors() {
  const sections = [
    [".section-events-particulares", "--color--green", "--color--white", "top bottom"],
    [".section-events-empresa", "--color--orange", "--color--white"],
    [".section-events-faq", "--color--background"],
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

const initEvents = () => {
  backgroundColors();
  faqAccordion();
};

document.addEventListener('DOMContentLoaded', initEvents);