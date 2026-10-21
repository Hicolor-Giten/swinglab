// Set the confirmed reservation URLs here when booking opens.
// null keeps the preparation notice; no booking or personal data is submitted.
const RESERVATION_URLS = Object.freeze({ member: null, visitor: null });

const toggle = document.querySelector(".menu-toggle");
const menu = document.querySelector("#mobile-menu");
function closeMenu() {
  toggle.setAttribute("aria-expanded", "false");
  toggle.querySelector(".menu-label").textContent = "メニュー";
  menu.hidden = true;
}
toggle.addEventListener("click", () => {
  const isOpen = toggle.getAttribute("aria-expanded") === "true";
  toggle.setAttribute("aria-expanded", String(!isOpen));
  toggle.querySelector(".menu-label").textContent = isOpen
    ? "メニュー"
    : "閉じる";
  menu.hidden = isOpen;
});
menu
  .querySelectorAll("a")
  .forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !menu.hidden) {
    closeMenu();
    toggle.focus();
  }
});
window.matchMedia("(min-width: 901px)").addEventListener("change", (event) => {
  if (event.matches) closeMenu();
});

const dialog = document.querySelector("#reservation-dialog");
document.querySelectorAll("[data-reservation]").forEach((link) => {
  const type = link.dataset.reservation;
  const url = RESERVATION_URLS[type];
  if (url) {
    link.href = url;
    link.querySelector("small")?.remove();
    return;
  }
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const label = type === "member" ? "会員予約" : "ビジター予約";
    document.querySelector("#reservation-title").textContent =
      `${label}は準備中です`;
    dialog.showModal();
  });
});
dialog
  .querySelectorAll("button")
  .forEach((button) => button.addEventListener("click", () => dialog.close()));
dialog.addEventListener("click", (event) => {
  const bounds = dialog.getBoundingClientRect();
  if (
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom
  )
    dialog.close();
});

const slides = [
  {
    src: "assets/studio-concept.png",
    alt: "完全個室の3打席をイメージした生成画像。実際の施設ではありません。",
    className: "",
  },
  {
    src: "assets/studio-concept.png",
    alt: "シミュレーターのイメージ（生成画像）。FlightScope Range Gen2の実機写真ではありません。",
    className: "screen-crop",
  },
  {
    src: "assets/golf-concept.png",
    alt: "芝生の上のゴルフボールのイメージ（生成画像）。レンタル用品の写真ではありません。",
    className: "",
  },
];
const galleryImage = document.querySelector("#gallery-image");
const thumbnails = document.querySelectorAll("[data-slide]");
let currentSlide = 0;
function showSlide(index) {
  currentSlide = (index + slides.length) % slides.length;
  const slide = slides[currentSlide];
  galleryImage.src = slide.src;
  galleryImage.alt = slide.alt;
  galleryImage.className = slide.className;
  thumbnails.forEach((button, i) => {
    button.classList.toggle("is-active", i === currentSlide);
    button.setAttribute("aria-pressed", String(i === currentSlide));
  });
  document.querySelector("#gallery-counter").textContent =
    `${currentSlide + 1} / ${slides.length}`;
}
thumbnails.forEach((button) =>
  button.addEventListener("click", () =>
    showSlide(Number(button.dataset.slide)),
  ),
);
document
  .querySelector(".gallery-arrow.previous")
  .addEventListener("click", () => showSlide(currentSlide - 1));
document
  .querySelector(".gallery-arrow.next")
  .addEventListener("click", () => showSlide(currentSlide + 1));
document.querySelector(".gallery").addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    event.preventDefault();
    showSlide(currentSlide + (event.key === "ArrowRight" ? 1 : -1));
  }
});
document.querySelector("#year").textContent = String(new Date().getFullYear());
