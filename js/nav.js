// NAV tab: city map, district details, travel, first-contract tutorial, mission scenes.
import { MISSIONS } from './data/missions.js';
import { DISTRICTS, LOC } from './data/city.js';
import { finishMission } from './missions.js';
import { travel, isKnown, locationsOf } from './city.js';
import { mapSvg } from './citymap.js';
import { esc } from './util.js';

const TUTORIAL = [
  'This is the city map. Your position is marked YOU. Tap a district to see what is there.',
  'Jobs from your contacts appear as cards under the map. Yours is highlighted.',
  'Tap the card to open your first contract.',
];
const ui = { sel: null, note: '', typed: -1 };   // view state, not saved

export function renderNav(state, view, rerender, persist) {
  const c = state.character, p = c.progress;
  const commit = () => { persist(); rerender(); };

  if (p.lastResult) {
    const r = p.lastResult;
    view.innerHTML = `<section class="panel"><div class="kicker">Contract complete</div><h2>${esc(r.title)}</h2>
      <p class="story" data-type>${esc(r.text)}</p>
      ${r.lines.map(l => `<div class="kv" data-seq><span>${esc(l)}</span></div>`).join('')}
      <div class="actions" data-seq><button class="primary" data-close>Return to NAV</button></div></section>`;
    view.onclick = e => { if (e.target.closest('[data-close]')) { p.lastResult = null; commit(); } };
    return;
  }

  if (p.active) {
    const m = MISSIONS[p.active.id], node = m.nodes[p.active.node];
    view.innerHTML = `<section class="panel"><div class="kicker">${esc(m.title)}</div>
      <p class="story" data-type>${esc(node.text)}</p>
      <div class="choices">${node.choices.map((ch, i) => `<button class="choice" data-seq data-choice="${i}">${esc(ch.label)}</button>`).join('')}</div></section>`;
    view.onclick = e => {
      const b = e.target.closest('[data-choice]'); if (!b) return;
      const ch = node.choices[+b.dataset.choice];
      if (ch.next) p.active.node = ch.next; else finishMission(c, p.active.id, m, ch.end);
      commit();
    };
    return;
  }

  const bg = c.original.background, t = p.tutorial, here = LOC[c.location];
  const open = Object.entries(MISSIONS).filter(([id, m]) => m.background === bg && !p.completed.includes(id));
  const nearby = open.filter(([, m]) => m.location === c.location);
  const typeCoach = ui.typed !== t; ui.typed = t;             // type the tutorial line once per step, not on every tap

  const coach = t < 3 ? `<section class="panel coach"><div class="kicker">Tutorial ${t + 1} of 3</div>
    <p class="story" ${typeCoach ? 'data-type' : ''}>${TUTORIAL[t]}</p>
    <div class="actions"><button data-skip>Skip</button>${t < 2 ? '<button class="primary" data-next>Next</button>' : ''}</div></section>` : '';

  let districtPanel = '';
  if (ui.sel) {
    const d = DISTRICTS[ui.sel], locs = locationsOf(ui.sel), unknown = locs.filter(l => !isKnown(c, l.id)).length;
    districtPanel = `<section class="panel" style="border-left-color:${d.color}"><div class="kicker" style="color:${d.color}">District</div><h2>${d.name}</h2><p>${esc(d.desc)}</p>
      ${locs.map(l => isKnown(c, l.id)
        ? `<div class="loc"><div><b>${esc(l.name)}</b><small>${l.tags.join(', ')}</small></div>${l.id === c.location ? '<small class="here">You are here</small>' : `<button data-travel="${l.id}">Travel</button>`}</div>`
        : '<div class="loc dim"><b>???</b></div>').join('')}
      ${unknown ? `<p class="note">${unknown} undiscovered. Visit this district to reveal them.</p>` : ''}</section>`;
  }

  view.innerHTML = `${coach}${ui.note ? `<p class="note flash">${esc(ui.note)}</p>` : ''}
    <div class="citymap${t === 0 ? ' hint' : ''}">${mapSvg(c, ui.sel, new Set(open.map(([, m]) => m.location)))}</div>
    ${districtPanel}
    <section class="panel"><div class="kicker">You are here</div><h2>${esc(here.name)}</h2><p>${esc(here.note)}</p>
      <p class="tags">${here.tags.map(x => `<span>${x}</span>`).join('')}</p></section>
    ${nearby.map(([id, m]) => `<button class="mission${t === 1 || t === 2 ? ' hint' : ''}" data-start="${id}">
      <b>${esc(m.title)}</b><small>${esc(m.type)} from ${esc(m.giver)}</small><span>${esc(m.brief)}</span></button>`).join('')}`;

  view.onclick = e => {
    const q = (a) => e.target.closest(`[${a}]`);
    ui.note = '';
    if (q('data-district')) { const d = q('data-district').dataset.district; ui.sel = ui.sel === d ? null : d; rerender(); return; }
    if (q('data-skip')) p.tutorial = 3;
    else if (q('data-next')) p.tutorial++;
    else if (q('data-travel')) { const id = q('data-travel').dataset.travel; if (travel(c, id)) { ui.note = `Arrived at ${LOC[id].name}.`; ui.sel = null; } }
    else if (q('data-start')) { const id = q('data-start').dataset.start; p.active = { id, node: MISSIONS[id].start }; p.tutorial = 3; }
    else return;
    commit();
  };
}
