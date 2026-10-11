// Builds the "road" that links the three steps. It is recomputed from the real position of each
// node, so the line always meets them whatever the text wraps to. Drawing it is the motion layer's job.
const journey = document.querySelector<HTMLElement>('[data-journey]');
const svg = journey?.querySelector<SVGSVGElement>('[data-journey-svg]');
const paths = svg ? [...svg.querySelectorAll<SVGPathElement>('[data-journey-path]')] : [];
if (journey && svg && paths.length) {
 const nodes = [...journey.querySelectorAll<HTMLElement>('[data-journey-node]')];
 const build = () => {
  const box = journey.getBoundingClientRect();
  if (!box.width || !box.height || !nodes.length) return;
  svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
  const points = nodes.map(node => {
   const r = node.getBoundingClientRect();
   return {x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2};
  });
  // A gentle sway keeps the line road-like when the nodes share a column (mobile).
  const sway = Math.min(64, box.width * 0.08);
  // Entry and exit lean away from the text, which always sits to the right of each node.
  const start = {x: Math.max(0, points[0].x - sway), y: 0};
  const end = {x: Math.max(0, points[points.length - 1].x - sway), y: box.height};
  const all = [start, ...points, end];
  let d = `M ${start.x} ${start.y}`;
  for (let i = 1; i < all.length; i++) {
   const a = all[i - 1], b = all[i], mid = (b.y - a.y) * 0.55;
   const bend = Math.abs(a.x - b.x) < 2 ? (i % 2 ? -sway : sway) * 0.5 : 0;
   d += ` C ${a.x + bend} ${a.y + mid}, ${b.x + bend} ${b.y - mid}, ${b.x} ${b.y}`;
  }
  paths.forEach(path => path.setAttribute('d', d));
 };
 new ResizeObserver(build).observe(journey);
 build();
}
