// Analytics remains disabled. Integrators may explicitly listen after obtaining any required consent.
export function track(name: string, properties: Record<string, string | number> = {}) {
 if (document.documentElement.dataset.analyticsEnabled !== 'true') return;
 window.dispatchEvent(new CustomEvent('autocass:analytics', {detail:{name, properties}}));
}
document.querySelectorAll<HTMLElement>('[data-track]').forEach(element => {
 element.addEventListener('click', () => track(element.dataset.track!, {position: element.dataset.position ?? 'navigation'}));
});

const root = document.documentElement;
const menu = document.querySelector<HTMLDialogElement>('[data-menu]');
const opener = document.querySelector<HTMLButtonElement>('[data-menu-open]');
opener?.addEventListener('click', () => { menu?.showModal(); });
document.querySelector('[data-menu-close]')?.addEventListener('click', () => menu?.close());
menu?.addEventListener('click', event => {if (event.target === menu) menu.close();});
menu?.addEventListener('close', () => opener?.focus());

// Masthead height drives page offsets; the demo notice can wrap on narrow screens.
const masthead = document.querySelector<HTMLElement>('[data-masthead]');
const notice = document.querySelector<HTMLElement>('[data-demo-notice]');
if (masthead) {
 const measure = () => {
  root.style.setProperty('--demo-h', `${notice?.offsetHeight ?? 0}px`);
  root.style.setProperty('--masthead-h', `${masthead.offsetHeight}px`);
 };
 new ResizeObserver(measure).observe(masthead);
 measure();
 // "Scrolled" state (blurred background) from a sentinel, without a scroll listener.
 const sentinel = document.createElement('div');
 sentinel.className = 'scroll-sentinel';
 sentinel.setAttribute('aria-hidden', 'true');
 document.body.prepend(sentinel);
 new IntersectionObserver(([entry]) => root.classList.toggle('is-scrolled', !entry.isIntersecting)).observe(sentinel);
}

// Skip link, "Voltar ao topo" and other in-page anchors move focus as well as scroll.
export function focusTarget(target: HTMLElement) {
 if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
 target.focus({preventScroll: true});
}
document.addEventListener('click', event => {
 const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
 if (!link || link.hash.length < 2) return;
 const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
 if (!target) return;
 event.preventDefault();
 const top = link.hasAttribute('data-scroll-top');
 window.dispatchEvent(new CustomEvent('autocass:scroll-to', {detail: {target: top ? 0 : target}}));
 if (!root.classList.contains('lenis')) top ? window.scrollTo({top: 0}) : target.scrollIntoView();
 focusTarget(target);
});

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
if (reduce.matches) root.classList.add('motion-off');
else import('./motion').then(m => m.start()).catch(() => root.classList.add('motion-off'));
