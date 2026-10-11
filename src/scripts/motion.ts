// Motion layer. Loaded only when the visitor has not asked for reduced motion.
// Every tween animates transform or opacity; the journey line (stroke-dashoffset) is the one
// deliberate exception, because a drawn line has no transform equivalent.
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {SplitText} from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

const root = document.documentElement;
const EASE = 'expo.out';            // long, settling deceleration; never overshoots
const EASE_SWAP = 'power3.inOut';   // for crossfades where two states trade places
const fine = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;
let lenis: Lenis | null = null;

export function start() {
 // If the static failsafe already revealed everything, keep it static: no late entrances.
 const late = root.classList.contains('motion-off');
 root.classList.add('motion-ready');
 try {
  setupLenis();
  setupMasthead();
  setupHero(late);
  setupSpecular();
  setupShowcase();
  setupCursor();
  setupJourney(late);
  const fonts = document.fonts?.ready ?? Promise.resolve();
  Promise.race([fonts, new Promise(r => setTimeout(r, 1200))]).then(() => {
   if (!late) setupReveals();
   ScrollTrigger.refresh();
  });
 } catch (error) {
  root.classList.add('motion-off');
  console.error(error);
 }
}

function setupLenis() {
 // Touch devices keep native scrolling; Lenis only smooths wheel and trackpad input.
 if (!fine()) return;
 lenis = new Lenis({lerp: 0.085, wheelMultiplier: 0.9, prevent: node => !!node.closest('dialog')});
 lenis.on('scroll', ScrollTrigger.update);
 gsap.ticker.add(time => lenis!.raf(time * 1000));
 gsap.ticker.lagSmoothing(0);
 const sync = () => document.querySelector('dialog:modal') ? lenis!.stop() : lenis!.start();
 new MutationObserver(sync).observe(document.body, {subtree: true, attributes: true, attributeFilter: ['open']});
 window.addEventListener('autocass:scroll-to', event => {
  const {target} = (event as CustomEvent<{target: HTMLElement | number}>).detail;
  lenis!.scrollTo(target, {duration: 1.4, offset: 0});
 });
}

function setupMasthead() {
 const masthead = document.querySelector<HTMLElement>('[data-masthead]');
 if (!masthead) return;
 let focused = false;
 masthead.addEventListener('focusin', () => { focused = true; root.classList.remove('masthead-hidden'); });
 masthead.addEventListener('focusout', () => { focused = false; });
 ScrollTrigger.create({
  start: 0, end: 'max',
  onUpdate(self) {
   const hide = self.direction === 1 && self.scroll() > 240 && !focused;
   root.classList.toggle('masthead-hidden', hide);
  },
 });
}

function setupReveals() {
 document.querySelectorAll<HTMLElement>('[data-reveal="lines"]').forEach(element => {
  let done = false;
  const immediate = element.closest('[data-hero]') !== null;
  SplitText.create(element, {
   type: 'lines', mask: 'lines', linesClass: 'split-line', autoSplit: true,
   onSplit(self) {
    gsap.set(element, {opacity: 1});
    if (done) return;
    return gsap.from(self.lines, {
     yPercent: 110, duration: 1.3, ease: EASE, stagger: 0.09, delay: immediate ? 0.45 : 0,
     onComplete: () => { done = true; },
     scrollTrigger: immediate ? undefined : {trigger: element, start: 'top 88%', once: true},
    });
   },
  });
 });
 const fades = gsap.utils.toArray<HTMLElement>('[data-reveal]:not([data-reveal="lines"])');
 const inHero = fades.filter(el => el.closest('[data-hero]'));
 gsap.fromTo(inHero, {opacity: 0, y: 24}, {opacity: 1, y: 0, duration: 1.2, ease: EASE, stagger: 0.12, delay: 0.85});
 ScrollTrigger.batch(fades.filter(el => !inHero.includes(el)), {
  start: 'top 90%', once: true,
  onEnter: batch => gsap.fromTo(batch, {opacity: 0, y: 32}, {opacity: 1, y: 0, duration: 1.2, ease: EASE, stagger: 0.1, overwrite: true}),
 });
}

function setupHero(late: boolean) {
 const hero = document.querySelector<HTMLElement>('[data-hero]');
 if (!hero) return;
 const frame = hero.querySelector('[data-hero-frame]');
 const media = hero.querySelector('[data-hero-media]');
 const depth = hero.querySelector('[data-hero-depth]');
 const copy = hero.querySelector('[data-hero-copy]');
 if (!late && frame && media) {
  // Curtain mask: the frame rises while the photograph counter-moves, so the car appears to be unveiled.
  gsap.timeline({defaults: {duration: 1.4, ease: 'expo.inOut'}})
   .fromTo(frame, {y: 0, yPercent: 100}, {yPercent: 0})
   .fromTo(media, {y: 0, yPercent: -100, scale: 1.14}, {yPercent: 0, scale: 1.04}, 0);
 }
 const mm = gsap.matchMedia();
 mm.add('(min-width: 900px)', () => {
  const trigger = {trigger: hero, start: 'top top', end: 'bottom top', scrub: true};
  gsap.to(depth, {yPercent: 12, ease: 'none', scrollTrigger: trigger});
  gsap.to(copy, {yPercent: -18, opacity: 0.2, ease: 'none', scrollTrigger: trigger});
 });
 mm.add('(max-width: 899px)', () => {
  gsap.to(depth, {yPercent: 5, ease: 'none', scrollTrigger: {trigger: hero, start: 'top top', end: 'bottom top', scrub: true}});
 });
}

function setupSpecular() {
 const zone = document.querySelector<HTMLElement>('[data-specular]');
 const glint = zone?.querySelector<HTMLElement>('[data-specular-glint]');
 const hero = document.querySelector<HTMLElement>('[data-hero]');
 if (!zone || !glint || !hero) return;
 const mm = gsap.matchMedia();
 mm.add('(hover: hover) and (pointer: fine) and (min-width: 900px)', () => {
  const xTo = gsap.quickTo(glint, 'x', {duration: 1.1, ease: 'power3.out'});
  const yTo = gsap.quickTo(glint, 'y', {duration: 1.1, ease: 'power3.out'});
  let lit = false;
  const show = () => { lit = true; gsap.to(glint, {autoAlpha: 1, duration: 0.9, ease: 'power2.out'}); };
  const hide = () => { lit = false; gsap.to(glint, {autoAlpha: 0, duration: 1.2, ease: 'power2.out'}); };
  const move = (event: PointerEvent) => {
   const box = zone.getBoundingClientRect();
   xTo(event.clientX - box.left); yTo(event.clientY - box.top);
   if (!lit) show();
  };
  hero.addEventListener('pointermove', move, {passive: true});
  hero.addEventListener('pointerenter', show);
  hero.addEventListener('pointerleave', hide);
  return () => {
   hero.removeEventListener('pointermove', move);
   hero.removeEventListener('pointerenter', show);
   hero.removeEventListener('pointerleave', hide);
  };
 });
}

function setupShowcase() {
 const section = document.querySelector<HTMLElement>('[data-showcase]');
 if (!section) return;
 const stage = section.querySelector<HTMLElement>('[data-showcase-stage]')!;
 const items = gsap.utils.toArray<HTMLElement>('[data-showcase-item]', section);
 const tabs = gsap.utils.toArray<HTMLButtonElement>('[data-showcase-tab]', section);
 const bar = section.querySelector<HTMLElement>('[data-showcase-progress]');
 if (items.length < 2) return;
 const mm = gsap.matchMedia();
 mm.add('(min-width: 1024px) and (min-height: 700px)', () => {
  section.classList.add('is-pinned');
  let current = 0;
  let swap: gsap.core.Timeline | null = null;
  const parts = (item: HTMLElement) => ({
   media: item.querySelector('[data-showcase-media]'),
   info: item.querySelectorAll('[data-showcase-line]'),
  });
  const mark = (index: number) => {
   items.forEach((item, i) => { item.inert = i !== index; item.classList.toggle('is-active', i === index); });
   tabs.forEach((tab, i) => tab.setAttribute('aria-current', String(i === index)));
  };
  items.forEach((item, i) => {
   const {media, info} = parts(item);
   gsap.set(media, {autoAlpha: i === 0 ? 1 : 0});
   gsap.set(info, {autoAlpha: i === 0 ? 1 : 0});
  });
  mark(0);
  const go = (next: number) => {
   if (next === current) return;
   const direction = next > current ? 1 : -1;
   const from = parts(items[current]), to = parts(items[next]);
   swap?.progress(1).kill();
   swap = gsap.timeline({defaults: {ease: EASE_SWAP}})
    .to(from.media, {autoAlpha: 0, xPercent: -4 * direction, duration: 1.1}, 0)
    .to(from.info, {autoAlpha: 0, y: -18 * direction, duration: 0.6, stagger: 0.03}, 0)
    .fromTo(to.media, {autoAlpha: 0, xPercent: 6 * direction, scale: 1.05}, {autoAlpha: 1, xPercent: 0, scale: 1, duration: 1.3, ease: EASE}, 0.15)
    .fromTo(to.info, {autoAlpha: 0, y: 28 * direction}, {autoAlpha: 1, y: 0, duration: 1.1, ease: EASE, stagger: 0.06}, 0.4);
   current = next;
   mark(next);
  };
  const trigger = ScrollTrigger.create({
   trigger: stage, start: 'top top', pin: true, anticipatePin: 1,
   end: () => `+=${window.innerHeight * (items.length - 0.4)}`,
   onUpdate(self) {
    if (bar) gsap.set(bar, {scaleY: self.progress});
    go(Math.min(items.length - 1, Math.floor(self.progress * items.length)));
   },
  });
  const onTab = (event: Event) => {
   const index = tabs.indexOf(event.currentTarget as HTMLButtonElement);
   const y = trigger.start + (trigger.end - trigger.start) * ((index + 0.5) / items.length);
   lenis ? lenis.scrollTo(y, {duration: 1.4}) : window.scrollTo({top: y});
  };
  tabs.forEach(tab => tab.addEventListener('click', onTab));
  return () => {
   tabs.forEach(tab => tab.removeEventListener('click', onTab));
   section.classList.remove('is-pinned');
   items.forEach(item => { item.inert = false; item.classList.remove('is-active'); });
  };
 });
}

function setupCursor() {
 const label = document.querySelector<HTMLElement>('[data-cursor-label]');
 if (!label) return;
 const mm = gsap.matchMedia();
 mm.add('(hover: hover) and (pointer: fine)', () => {
  gsap.set(label, {xPercent: -50, yPercent: -50, autoAlpha: 0, scale: 0.6});
  const xTo = gsap.quickTo(label, 'x', {duration: 0.7, ease: 'power3.out'});
  const yTo = gsap.quickTo(label, 'y', {duration: 0.7, ease: 'power3.out'});
  let active: Element | null = null;
  const move = (event: PointerEvent) => {
   const target = (event.target as Element | null)?.closest('[data-cursor]') ?? null;
   if (target !== active) {
    active = target;
    gsap.to(label, {autoAlpha: target ? 1 : 0, scale: target ? 1 : 0.6, duration: 0.6, ease: EASE});
   }
   let x = event.clientX, y = event.clientY;
   if (target) {
    // Magnetic pull: the label leans slightly toward the centre of the card it is over.
    const box = target.getBoundingClientRect();
    x += (box.left + box.width / 2 - x) * 0.14;
    y += (box.top + box.height / 2 - y) * 0.14;
   }
   xTo(x); yTo(y);
  };
  document.addEventListener('pointermove', move, {passive: true});
  return () => document.removeEventListener('pointermove', move);
 });
}

function setupJourney(late: boolean) {
 const journey = document.querySelector<HTMLElement>('[data-journey]');
 const path = journey?.querySelector<SVGPathElement>('.journey-progress');
 if (!journey || !path) return;
 const nodes = gsap.utils.toArray<HTMLElement>('[data-journey-node]', journey);
 if (late) { nodes.forEach(node => node.classList.add('is-reached')); return; }
 gsap.fromTo(path, {strokeDashoffset: 1}, {
  strokeDashoffset: 0, ease: 'none',
  scrollTrigger: {trigger: journey, start: 'top 70%', end: 'bottom 70%', scrub: 1.2},
 });
 nodes.forEach(node => ScrollTrigger.create({
  trigger: node, start: 'top 70%',
  onEnter: () => node.classList.add('is-reached'),
  onLeaveBack: () => node.classList.remove('is-reached'),
 }));
}
