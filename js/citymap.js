// NAV city map: district outlines, locations, your position, and mission markers (2D, tappable).
import { DISTRICTS, LOCATIONS, LOC } from './data/city.js';
import { isKnown } from './city.js';

const DEFS = `<defs><pattern id="cgrid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0H0V10" fill="none" stroke="#1a2733" stroke-width=".6"/></pattern>
  <filter id="cglow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`;

export function mapSvg(c, sel, missionLocs) {
  const here = LOC[c.location];
  const districts = Object.entries(DISTRICTS).map(([id, d]) => {
    const pts = d.poly.map(p => p.join(',')).join(' ');
    return `<g class="dist${sel === id ? ' on' : ''}" data-district="${id}" style="--c:${d.color}" role="button" aria-label="${d.name}">
      <polygon class="base" points="${pts}"/><polygon class="tint" points="${pts}"/>
      <text>${d.label.map((t, i) => `<tspan x="${d.lbl[0]}" y="${d.lbl[1] + i * 9}">${t}</tspan>`).join('')}</text></g>`;
  }).join('');
  const dots = LOCATIONS.map(l => {
    const known = isKnown(c, l.id);
    return `<circle class="ldot${known ? '' : ' unk'}" cx="${l.x}" cy="${l.y}" r="2.4"/>`
      + (known && (sel === l.district || l.id === c.location) ? `<text class="lname" x="${l.x}" y="${l.y + 9}">${l.name}</text>` : '');
  }).join('');
  const marks = [...missionLocs].map(id => `<g class="mk"><circle cx="${LOC[id].x + 7}" cy="${LOC[id].y - 7}" r="4.5"/><text x="${LOC[id].x + 7}" y="${LOC[id].y - 4.6}">!</text></g>`).join('');
  const you = `<g class="you"><path d="M${here.x} ${here.y - 6}L${here.x + 6} ${here.y}L${here.x} ${here.y + 6}L${here.x - 6} ${here.y}Z"/><text x="${here.x}" y="${here.y - 10}" text-anchor="middle">YOU</text></g>`;
  return `<svg viewBox="0 0 360 440" role="group" aria-label="City map">${DEFS}<rect width="360" height="440" fill="#05070a"/>
    <text class="water" x="18" y="40">OPEN WATER</text><text class="water" x="342" y="430" text-anchor="end">THE BADLANDS</text>
    ${districts}${dots}${marks}${you}</svg>`;
}
