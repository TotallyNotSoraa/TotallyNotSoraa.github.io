// INV > Cyberware: a compact body schematic with slot groups on both sides. Detail stays hidden until you ask for it:
// tap a slot for its region, tap an implant row for its description, open the clinic only when you want to shop.
import { ITEMS } from './data/items.js';
import { REGIONS, stats, installedIds, install, uninstall, upgrade, buy, canInstall, upgradeProblem, clinicStock, fxText, slotsOf } from './cyberware.js';
import { reqText } from './progression.js';
import { esc } from './util.js';

const ui = { region: null, sel: null, clinic: null, confirm: null, note: '', netOpen: false };   // view state, not saved

// Stage is 360 x 400. Slot groups sit left and right of the body; ANCHOR is where each region points on the body (in body units).
const LEFT = { cortex: 10, neural: 92, arms: 174, skeleton: 256, skin: 338 };
const RIGHT = { optics: 10, os: 76, circ: 142, immune: 208, hands: 274, legs: 340 };
const ANCHOR = { cortex: [180, 44], neural: [180, 108], arms: [134, 200], skeleton: [170, 255], skin: [152, 300],
  optics: [186, 52], os: [192, 128], circ: [190, 150], immune: [196, 232], hands: [236, 262], legs: [206, 350] };
const EDGE_L = 116, EDGE_R = 244, SLOT_MID = 34, BS = 0.87;
const bx = (x) => 180 + (x - 180) * BS, by = (y) => y * BS;       // body units -> stage units

const BODY = `<defs><linearGradient id="cwg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff2bd6" stop-opacity=".45"/><stop offset=".5" stop-color="#7a5cff" stop-opacity=".2"/><stop offset="1" stop-color="#19e3ff" stop-opacity=".35"/></linearGradient>
  <filter id="cwglow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
  <g class="cw-body" transform="translate(23.4 0) scale(${BS})"><ellipse cx="180" cy="54" rx="17" ry="21"/>
  <path d="M170 92C150 96 138 100 134 112L126 190L120 262L128 266L138 200L148 150L152 218L148 252L152 340L156 440L172 440L176 350L180 290L184 350L188 440L204 440L208 340L212 252L208 218L212 150L222 200L232 266L240 262L234 190L226 112C222 100 210 96 190 92Z"/>
  <path class="inner" d="M180 96V290"/></g>`;

const esc2 = esc;
const nameOf = (it) => `<span class="n r-${it.rarity}">${esc2(it.name)}</span>`;
const costText = (it) => `${it.upgradeCost.credits} cr, ${Object.entries(it.upgradeCost.mats).map(([m, n]) => `${n} ${ITEMS[m].name}`).join(', ')}`;

// Thin side meters: left = load (red past the capacity mark), right = how much of the overload buffer is used.
const SEG = 30;
function meters(s) {
  const scale = s.capacity + 2 * s.tolerance, loadSeg = Math.round(Math.min(1, s.load / scale) * SEG), capSeg = Math.round((s.capacity / scale) * SEG);
  const over = Math.max(0, s.load - s.capacity), bufSeg = Math.round(Math.min(1, over / (2 * s.tolerance)) * SEG), y = (i) => 372 - i * 12;
  let h = '';
  for (let i = 0; i < SEG; i++) {
    h += `<rect class="seg${i < loadSeg ? (i >= capSeg ? ' over' : ' on') : ''}" x="4" y="${y(i)}" width="6" height="9"/>`;
    h += `<rect class="seg buf${i < bufSeg ? ' on' : ''}" x="350" y="${y(i)}" width="6" height="9"/>`;
  }
  return `${h}<path class="lockline" d="M2 ${y(capSeg) + 12}H12"/>`;
}

function stage(c, s) {
  const by_ = Object.fromEntries(REGIONS.map(r => [r.id, r]));
  const slots = (r) => { const ids = c.cyberware.installed[r.id] || [];
    return Array.from({ length: r.slots }, (_, i) => { const it = ids[i] && ITEMS[ids[i]];
      const code = it ? it.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '';
      return `<button class="cw-slot${it ? ` has r-${it.rarity}` : ''}" data-region="${r.id}" aria-label="${r.name}${it ? ': ' + esc(it.name) : ': empty'}">${code}</button>`; }).join(''); };
  const group = (id, top, side) => `<div class="cw-group ${side}${ui.region === id ? ' on' : ''}" style="top:${(top / 4).toFixed(2)}%;${side === 'l'
    ? `right:${(((360 - EDGE_L) / 360) * 100).toFixed(2)}%` : `left:${((EDGE_R / 360) * 100).toFixed(2)}%`}"><span class="cw-label">${by_[id].short}</span><div class="cw-slots">${slots(by_[id])}</div></div>`;
  let lead = '';
  if (ui.region) {
    const left = ui.region in LEFT, top = LEFT[ui.region] ?? RIGHT[ui.region], a = ANCHOR[ui.region];
    lead = `<path class="lead" d="M${left ? EDGE_L : EDGE_R} ${top + SLOT_MID}L${bx(a[0])} ${by(a[1])}"/><circle class="leadpt" cx="${bx(a[0])}" cy="${by(a[1])}" r="3.5"/>`;
  }
  return `<div class="cw-stage"><svg viewBox="0 0 360 400" aria-hidden="true">${BODY}${meters(s)}${lead}</svg>
    ${Object.entries(LEFT).map(([id, t]) => group(id, t, 'l')).join('')}${Object.entries(RIGHT).map(([id, t]) => group(id, t, 'r')).join('')}</div>`;
}

function row(key, it, inline, detail) {
  const open = ui.sel === key;
  return `<div class="cw-row"><button class="cw-main" data-sel="${key}" aria-expanded="${open}">${nameOf(it)}<span class="m">C${it.cap} &middot; ${esc(fxText(it.effects))}</span></button>${inline}
    ${open ? `<div class="cw-detail"><p>${esc(it.desc)}</p>${Object.keys(it.req).length ? `<p>Requires ${esc(reqText(it))}.</p>` : ''}${detail ? `<div class="acts">${detail}</div>` : ''}</div>` : ''}</div>`;
}
const act = (attr, label, cls = '') => `<button class="cw-act ${cls}" ${attr}>${label}</button>`;

function regionPanel(c, clinicOpen) {
  const r = REGIONS.find(x => x.id === ui.region), inst = c.cyberware.installed[r.id] || [];
  const stored = c.inventory.bag.filter(e => ITEMS[e.id].type === 'cyberware' && ITEMS[e.id].region === r.id);
  const stock = clinicStock(r.id);
  return `<section class="cw-panel"><div class="cw-ph"><b>${r.name}</b><small>${inst.length}/${slotsOf(r.id)} slots</small><button data-region="${r.id}" aria-label="Close">&times;</button></div>
    ${inst.map(id => { const it = ITEMS[id], prob = it.upgradeTo ? upgradeProblem(c, id) : '';
      return row('i:' + id, it, '', (it.upgradeTo ? (prob ? `<span class="cw-hint">${esc(prob)}</span>` : act(`data-upgrade="${id}"`, `Upgrade (${costText(it)})`, 'pri')) : '') + act(`data-remove="${id}"`, 'Remove')); }).join('')}
    ${stored.map(e => { const it = ITEMS[e.id], prob = canInstall(c, e.id);
      return row('s:' + e.id, it, prob ? `<span class="cw-hint">${esc(prob)}</span>` : act(`data-install="${e.id}"`, 'Install', 'pri'), ''); }).join('')}
    <button class="cw-clinic" data-clinic>Clinic <small>${c.credits} cr</small><span>${clinicOpen ? '&minus;' : '+'}</span></button>
    ${clinicOpen ? stock.map(it => row('c:' + it.id, it, act(c.credits >= it.price ? `data-buy="${it.id}"` : 'disabled', `${it.price} cr`), '')).join('') : ''}</section>`;
}

function confirmPanel(c) {
  const k = ui.confirm, it = ITEMS[k.id], now = stats(c), ids = installedIds(c), to = k.kind === 'upgrade' ? ITEMS[it.upgradeTo] : it;
  const next = stats(c, c.attributes, k.kind === 'upgrade' ? ids.map(i => (i === k.id ? to.id : i)) : [...ids, k.id]);
  return `<section class="cw-confirm${next.stage ? ' bad' : ''}"><b>${k.kind === 'upgrade' ? `Upgrade to ${esc(to.name)}?` : `Install ${esc(it.name)}?`}</b>
    <div class="cw-line">Load ${now.load}/${now.capacity} &rarr; ${next.load}/${next.capacity} <span class="stage-${next.stage}">${next.name}</span></div>
    <div class="cw-line dim">${esc(fxText(to.effects))}${k.kind === 'upgrade' ? ` &middot; ${esc(costText(it))}` : ''}</div>
    ${next.stage ? `<div class="cw-line warn-text">${Object.entries(next.penalty).map(([a, v]) => `${v} ${a}`).join(', ')}. ${next.stage === 3 ? 'You risk losing control.' : 'Pushing further risks cyberpsychosis.'}</div>` : ''}
    <div class="acts">${act('data-no', 'Cancel')}${act('data-yes', 'Confirm', 'pri')}</div></section>`;
}

export function renderCyberware(state, view, rerender, persist) {
  const c = state.character, s = stats(c);
  const net = Object.keys(s.values).filter(k => (s.bonus[k] || 0) + (s.penalty[k] || 0) && k !== 'capacity');
  const storedCount = c.inventory.bag.filter(e => ITEMS[e.id].type === 'cyberware').reduce((n, e) => n + e.qty, 0);
  const r = ui.region && REGIONS.find(x => x.id === ui.region);
  const clinicOpen = ui.clinic ?? (!!r && !(c.cyberware.installed[r.id] || []).length && !c.inventory.bag.some(e => ITEMS[e.id].type === 'cyberware' && ITEMS[e.id].region === r.id));
  view.innerHTML = `${ui.confirm ? confirmPanel(c) : ''}${ui.note ? `<p class="cw-note">${esc(ui.note)}</p>` : ''}
    <div class="cw-head"><span>LOAD <b>${s.load}</b>/${s.capacity}</span><span class="stage-${s.stage}">${s.name.toUpperCase()}</span><span>BUFFER <b>+${s.tolerance}</b></span></div>
    ${stage(c, s)}
    ${net.length ? `<button class="cw-net" data-net aria-expanded="${ui.netOpen}">Net effects <small>${net.length}</small><span>${ui.netOpen ? '&minus;' : '+'}</span></button>
      ${ui.netOpen ? `<div class="cw-chips">${net.map(k => { const v = (s.bonus[k] || 0) + (s.penalty[k] || 0); return `<span class="${v > 0 ? 'up' : 'down'}">${esc(fxText({ [k]: v }))}</span>`; }).join('')}</div>` : ''}` : ''}
    ${r ? regionPanel(c, clinicOpen) : `<p class="cw-hint center">Tap a slot.${storedCount ? ` ${storedCount} in storage.` : ''}</p>`}`;

  const commit = () => { persist(); rerender(); };
  view.onclick = e => {
    const t = (a) => e.target.closest(`[${a}]`);
    const done = (msg) => { ui.note = msg; ui.confirm = null; ui.sel = null; commit(); };
    ui.note = '';
    if (t('data-region')) { const id = t('data-region').dataset.region; ui.region = ui.region === id ? null : id; ui.sel = null; ui.clinic = null; ui.confirm = null; }
    else if (t('data-sel')) { const k = t('data-sel').dataset.sel; ui.sel = ui.sel === k ? null : k; }
    else if (t('data-clinic')) ui.clinic = !clinicOpen;
    else if (t('data-net')) ui.netOpen = !ui.netOpen;
    else if (t('data-buy')) { const id = t('data-buy').dataset.buy; if (buy(c, id)) return done(`Bought ${ITEMS[id].name}. It is in storage.`); }
    else if (t('data-install')) {
      const id = t('data-install').dataset.install;
      if (stats(c, c.attributes, [...installedIds(c), id]).load > s.capacity) ui.confirm = { kind: 'install', id };   // overload needs a confirmation
      else if (install(c, id)) return done(`Installed ${ITEMS[id].name}.`);
    }
    else if (t('data-upgrade')) ui.confirm = { kind: 'upgrade', id: t('data-upgrade').dataset.upgrade };
    else if (t('data-remove')) { const id = t('data-remove').dataset.remove; if (uninstall(c, ui.region, id)) return done(`Removed ${ITEMS[id].name}.`); }
    else if (t('data-no')) ui.confirm = null;
    else if (t('data-yes')) {
      const k = ui.confirm;
      if (k.kind === 'install' && install(c, k.id)) return done(`Installed ${ITEMS[k.id].name}.`);
      if (k.kind === 'upgrade') { const to = ITEMS[ITEMS[k.id].upgradeTo].name; if (upgrade(c, ui.region, k.id)) return done(`Upgraded to ${to}.`); }
      ui.confirm = null;
    }
    else return;
    rerender();
  };
}
