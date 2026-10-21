const toggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('#mobile-menu');

function closeMenu() {
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'メニューを開く');
  menu.hidden = true;
}

toggle.addEventListener('click', () => {
  const isOpen = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!isOpen));
  toggle.setAttribute('aria-label', isOpen ? 'メニューを開く' : 'メニューを閉じる');
  menu.hidden = isOpen;
});
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !menu.hidden) {
    closeMenu();
    toggle.focus();
  }
});
window.matchMedia('(min-width: 901px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});

const dialog = document.querySelector('#reservation-dialog');
document.querySelectorAll('[data-reservation]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelector('#reservation-title').textContent = `${button.dataset.reservation}は準備中です`;
    dialog.showModal();
  });
});
dialog.querySelectorAll('button').forEach(button => button.addEventListener('click', () => dialog.close()));
dialog.addEventListener('click', event => {
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});
document.querySelector('#year').textContent = String(new Date().getFullYear());
