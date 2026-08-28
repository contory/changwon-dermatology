const header = document.querySelector('.site-header');
const updateHeaderState = () => {
  if (!header) return;
  header.classList.toggle('is-scrolled', window.scrollY > 42);
};
updateHeaderState();
window.addEventListener('scroll', updateHeaderState, { passive: true });

const menuButton = document.querySelector('[data-menu-toggle]');
const menu = document.querySelector('[data-main-nav]');

if (menuButton && menu) {
  const closeMenu = () => {
    menu.classList.remove('open');
    document.body.classList.remove('menu-open');
    menuButton.setAttribute('aria-expanded', 'false');
  };

  menuButton.addEventListener('click', () => {
    const open = !menu.classList.contains('open');
    menu.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
  });

  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => {
    if (window.innerWidth > 860) closeMenu();
  });
}

document.querySelectorAll('.faq-question').forEach((button) => {
  button.addEventListener('click', () => {
    const item = button.closest('.faq-item');
    const open = item.classList.toggle('open');
    button.setAttribute('aria-expanded', String(open));
  });
});

// Add a light query parameter so clicks can be grouped without collecting form data.
document.querySelectorAll('[data-consult]').forEach((link) => {
  link.addEventListener('click', () => {
    try {
      const url = new URL(link.href);
      url.searchParams.set('utm_source', 'changwon_dermatology');
      url.searchParams.set('utm_medium', 'website');
      url.searchParams.set('utm_content', link.dataset.consult || 'consult');
      link.href = url.toString();
    } catch {
      // Keep the original link when URL parsing is unavailable.
    }
  });
});


// Keep the fixed mobile inquiry button out of the full-bleed hero.
const mobileConsult = document.querySelector('.mobile-consult');
const landingHero = document.querySelector('.hero');
if (mobileConsult) {
  const updateMobileConsult = () => {
    if (window.innerWidth > 860) {
      mobileConsult.classList.remove('is-visible');
      return;
    }
    if (!landingHero) {
      mobileConsult.classList.add('is-visible');
      return;
    }
    mobileConsult.classList.toggle('is-visible', landingHero.getBoundingClientRect().bottom <= 90);
  };
  updateMobileConsult();
  window.addEventListener('scroll', updateMobileConsult, { passive: true });
  window.addEventListener('resize', updateMobileConsult, { passive: true });
}
