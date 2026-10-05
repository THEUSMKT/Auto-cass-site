const menu = document.querySelector<HTMLDialogElement>('[data-menu]');
const opener = document.querySelector<HTMLButtonElement>('[data-menu-open]');
opener?.addEventListener('click', () => { menu?.showModal(); });
document.querySelector('[data-menu-close]')?.addEventListener('click', () => menu?.close());
menu?.addEventListener('click', event => {if (event.target === menu) menu.close();});
menu?.addEventListener('close', () => opener?.focus());
// Analytics remains disabled. Integrators may explicitly listen after obtaining any required consent.
export function track(name: string, properties: Record<string, string | number> = {}) {
 if (document.documentElement.dataset.analyticsEnabled !== 'true') return;
 window.dispatchEvent(new CustomEvent('autocass:analytics', {detail:{name, properties}}));
}
document.querySelectorAll<HTMLElement>('[data-track]').forEach(element => {
 element.addEventListener('click', () => track(element.dataset.track!, {position: element.dataset.position ?? 'navigation'}));
});
