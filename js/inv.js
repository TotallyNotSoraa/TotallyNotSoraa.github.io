// INV tab: Equipment, Items, Materials. (Cyberware arrives in the next milestone.)
import { ITEMS, RARITY, CATEGORIES, QUICK_CATEGORIES } from './data/items.js';
import { SLOTS, QUICK_SLOTS, fits, defaultSlot, slotLabel, equip, unequip, scrap, totals, bagItems, sortItems } from './inventory.js';
import { meetsReq, reqText } from './progression.js';
import { esc } from './util.js';

const STAT = { dmg: 'Damage', armor: 'Armor', evasion: 'Evasion', speed: 'Speed' };
const ui = { sub: '', slot: null, sel: null, scrap: null, sort: 'rarity', filter: 'all', note: '' };  // view state, not saved

const signed = (n) => (n > 0 ? '+' : '') + n;
const statText = (s) => { const e = Object.entries(s || {}); return e.length ? e.map(([k, v]) => `${STAT[k]} ${signed(v)}`).join(', ') : 'No stat bonuses'; };
const nameOf = (it) => `<span class="r-${it.rarity}">${esc(it.name)}</span>`;
const reqHtml = (c, it) => (meetsReq(c, it) ? reqText(it) : `<span class="down">${reqText(it)}</span>`);
const kv = (k, v) => `<div class="kv"><span>${k}</span><b>${v}</b></div>`;
const btn = (attr, label, cls = '') => `<button class="${cls}" ${attr}>${label}</button>`;

function targetSlot(c, it) {
  const keys = SLOTS.map(s => s.key).filter(k => fits(it, k));
  return ui.slot && fits(it, ui.slot) ? ui.slot : keys.find(k => !c.inventory.equipped[k]) || keys[0];
}

// Side-by-side comparison: what is equipped in the target slot (left) against the stored item (right).
function compareGrid(c, it, slot) {
  const old = ITEMS[c.inventory.equipped[slot]];
  const keys = Object.keys(STAT).filter(k => (it.stats[k] || 0) || (old?.stats[k] || 0));
  const row = (label, a, b) => `<span class="l">${label}</span><span>${a}</span><span>${b}</span>`;
  let h = `<b class="h"></b><b class="h">Equipped</b><b class="h">New</b>`
    + row('Item', old ? nameOf(old) : '<span class="dim">Empty</span>', nameOf(it))
    + row('Rarity', old ? RARITY[old.rarity] : '-', RARITY[it.rarity]);
  for (const k of keys) {
    const o = old?.stats[k] || 0, n = it.stats[k] || 0, d = n - o;
    h += row(STAT[k], o, `${n}${d ? ` <span class="${d > 0 ? 'up' : 'down'}">${signed(d)}</span>` : ''}`);
  }
  if (!keys.length) h += row('Stats', '-', '-');
  if (old?.effect || it.effect) h += row('Effect', `<small>${esc(old?.effect || '-')}</small>`, `<small>${esc(it.effect || '-')}</small>`);
  return `<div class="cmp">${h}</div>`;
}

function detail(c, it, actions) {
  let h = `<p>${esc(it.desc)}</p>`;
  if (it.type === 'equipment') {
    if (it.qty) {          // in storage: compare with the target slot
      const t = targetSlot(c, it);
      h += `<p class="note">Comparing for ${slotLabel(t)}</p>${compareGrid(c, it, t)}${kv('Requires', reqHtml(c, it))}`;
    } else {               // the equipped item itself
      h += kv('Rarity', RARITY[it.rarity]) + kv('Stats', statText(it.stats)) + kv('Requires', reqHtml(c, it)) + (it.effect ? kv('Effect', esc(it.effect)) : '');
    }
  } else if (it.type === 'material') {
    h += kv('Rarity', RARITY[it.rarity]) + kv('Source', esc(it.source)) + kv('Used for', esc(it.uses));
  } else {
    h += kv('Rarity', RARITY[it.rarity]) + kv('Category', it.category) + (it.effect ? kv('Effect', esc(it.effect)) : '');
  }
  return `<div class="detail">${h}${actions ? `<div class="actions">${actions}</div>` : ''}</div>`;
}

function rows(c, list, actionsFor) {
  if (!list.length) return '<p class="note">Nothing here.</p>';
  return list.map(it => `<button class="row${ui.sel === it.id ? ' open' : ''}" data-pick="${it.id}">${nameOf(it)}<em>${it.qty > 1 ? 'x' + it.qty : ''}</em></button>`
    + (ui.sel === it.id ? detail(c, it, actionsFor(it)) : '')).join('');
}

function bar(left, right) { return `<div class="bar"><span>${left}</span><span>${right}</span></div>`; }
const sortBtn = () => btn('data-sort', `Sort: ${ui.sort === 'rarity' ? 'Rarity' : 'Name'}`);

function equipmentView(c) {
  const inv = c.inventory, t = totals(c);
  let list = bagItems(c, 'equipment');
  if (ui.slot) list = list.filter(it => fits(it, ui.slot));
  list = sortItems(list, ui.sort);
  const sel = ui.slot && inv.equipped[ui.slot] ? { ...ITEMS[inv.equipped[ui.slot]] } : null;
  return `<section class="panel">${Object.entries(STAT).map(([k, l]) => kv(l, signed(t[k] || 0))).join('')}</section>
    <div class="slots">${SLOTS.map(s => { const id = inv.equipped[s.key];
      return `<button class="slot${ui.slot === s.key ? ' on' : ''}" data-slot="${s.key}"><small>${s.label}</small>${id ? nameOf(ITEMS[id]) : '<span class="dim">empty</span>'}</button>`; }).join('')}</div>
    ${ui.slot ? `<section class="panel"><div class="kicker">${slotLabel(ui.slot)}</div>${sel ? `${nameOf(sel)}${detail(c, { ...sel, qty: 0 }, btn(`data-unequip="${ui.slot}"`, 'Unequip'))}`
      : '<p class="note">Empty. Pick a compatible item from storage.</p>'}</section>` : ''}
    ${bar(`Storage (${list.length})${ui.slot ? ' for ' + slotLabel(ui.slot) : ''}`, (ui.slot ? btn('data-allslots', 'Show all') : '') + sortBtn())}
    ${rows(c, list, it => (meetsReq(c, it) ? btn(`data-equip="${it.id}"`, 'Equip', 'primary') : btn('disabled', `Needs ${esc(reqText(it))}`)) + (it.scrap ? btn(`data-scrap="${it.id}"`, 'Scrap', 'danger') : ''))}`;
}

function itemsView(c) {
  const q = c.inventory.quick;
  let list = bagItems(c, 'item');
  if (ui.filter !== 'all') list = list.filter(it => it.category === ui.filter);
  list = sortItems(list, ui.sort);
  return `<section class="panel"><div class="kicker">Quick use</div><div class="quick">${q.map((id, i) =>
    `<button class="slot" ${id ? `data-qclear="${i}"` : 'disabled'}><small>Slot ${i + 1}</small>${id ? nameOf(ITEMS[id]) : '<span class="dim">empty</span>'}</button>`).join('')}</div>
    <p class="note">Tap a filled slot to clear it.</p></section>
    <div class="bar"><select data-filter aria-label="Category"><option value="all">All categories</option>${CATEGORIES.map(k => `<option${ui.filter === k ? ' selected' : ''}>${k}</option>`).join('')}</select>${sortBtn()}</div>
    ${rows(c, list, it => (QUICK_CATEGORIES.includes(it.category)
      ? Array.from({ length: QUICK_SLOTS }, (_, i) => btn(`data-qset="${i}:${it.id}"`, `Quick ${i + 1}`)).join('') : '')
      + btn('disabled', 'Use (combat, later)'))}`;
}

const materialsView = (c) => rows(c, sortItems(bagItems(c, 'material'), ui.sort), () => '');

export function renderInv(state, view, sub, rerender, persist) {
  const c = state.character, inv = c.inventory;
  if (ui.sub !== sub) Object.assign(ui, { sub, slot: null, sel: null, scrap: null, note: '', filter: 'all' });
  inv.quick = inv.quick.map(id => (id && inv.bag.some(e => e.id === id) ? id : null));   // empty quick slots whose stack is gone

  const confirm = ui.scrap ? `<section class="panel warn"><div class="kicker">Scrap item?</div>
    <p>${esc(ITEMS[ui.scrap].name)} will be dismantled into ${Object.entries(ITEMS[ui.scrap].scrap).map(([m, n]) => `${n} ${esc(ITEMS[m].name)}`).join(', ')}. This cannot be undone.</p>
    <div class="actions">${btn('data-scrap-no', 'Cancel')}${btn('data-scrap-yes', 'Scrap', 'danger')}</div></section>` : '';
  const note = ui.note ? `<p class="note flash">${esc(ui.note)}</p>` : '';
  view.innerHTML = confirm + note + (sub === 'Equipment' ? equipmentView(c) : sub === 'Items' ? itemsView(c) : materialsView(c));

  const commit = () => { persist(); rerender(); };
  view.onchange = e => { if (e.target.dataset.filter !== undefined) { ui.filter = e.target.value; ui.sel = null; rerender(); } };
  view.onclick = e => {
    const t = (a) => e.target.closest(`[${a}]`);
    ui.note = '';
    if (t('data-slot')) { const k = t('data-slot').dataset.slot; ui.slot = ui.slot === k ? null : k; ui.sel = null; }
    else if (t('data-allslots')) ui.slot = null;
    else if (t('data-sort')) ui.sort = ui.sort === 'rarity' ? 'name' : 'rarity';
    else if (t('data-pick')) { const id = t('data-pick').dataset.pick; ui.sel = ui.sel === id ? null : id; }
    else if (t('data-equip')) { const id = t('data-equip').dataset.equip, it = ITEMS[id]; if (equip(c, id, targetSlot(c, it))) { ui.note = `Equipped ${it.name}.`; ui.sel = null; commit(); return; } }
    else if (t('data-unequip')) { const k = t('data-unequip').dataset.unequip; if (unequip(c, k)) { ui.note = 'Moved to storage.'; commit(); return; } }
    else if (t('data-scrap')) ui.scrap = t('data-scrap').dataset.scrap;
    else if (t('data-scrap-no')) ui.scrap = null;
    else if (t('data-scrap-yes')) { const id = ui.scrap, lines = scrap(c, id); ui.scrap = null; if (lines) { ui.note = `Scrapped ${ITEMS[id].name}: ${lines.join(', ')}.`; ui.sel = null; commit(); return; } }
    else if (t('data-qset')) { const [i, id] = t('data-qset').dataset.qset.split(':'); inv.quick = inv.quick.map(x => (x === id ? null : x)); inv.quick[+i] = id; commit(); return; }
    else if (t('data-qclear')) { inv.quick[+t('data-qclear').dataset.qclear] = null; commit(); return; }
    else return;
    rerender();
  };
}
