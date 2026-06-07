const brand = document.querySelector("[data-brand-signal]");

if (brand) {
  const mark = brand.querySelector(".brand-mark");

  brand.addEventListener("click", (event) => {
    event.preventDefault();
    if (!mark) return;

    mark.classList.remove("is-tracing");
    window.requestAnimationFrame(() => {
      mark.classList.add("is-tracing");
    });
  });

  mark?.addEventListener("animationend", () => {
    mark.classList.remove("is-tracing");
  });
}
