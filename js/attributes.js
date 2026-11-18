// PROFILE > Attributes. Upgrades are staged with +/- and need an explicit confirmation to spend.
import { ATTRS, ATTR_CAP, DERIVED, costOf, available, xpProgress } from './progression.js';
import { stats, refreshStatus } from './cyberware.js';
import { esc } from './util.js';

const ui = { pending: {}, confirm: false, statsOpen: false };   // view state, not saved

export function renderAttributes(state, view, rerender, persist) {
  const c = state.character, p = xpProgress(c.xp), pend = ui.pending;
  const stagedCost = () => ATTRS.reduce((sum, a) => { let s = 0; for (let v = c.attributes[a.id]; v < c.attributes[a.id] + (pend[a.id] || 0); v++) s += costOf(v); return sum + s; }, 0);
  if (available(c) - stagedCost() < 0) ui.pending = {};          // stale staging (points changed elsewhere)
  const free = available(c) - stagedCost();
  const staged = ATTRS.filter(a => pend[a.id]);
  const next = { ...c.attributes }; for (const a of staged) next[a.id] += pend[a.id];
  const A = stats(c, c.attributes), B = stats(c, next), cur = A.values, after = B.values;

  const confirm = ui.confirm ? `<section class="panel ask"><div class="kicker">Spend ${stagedCost()} point${stagedCost() === 1 ? '' : 's'}?</div>
    <p>${staged.map(a => `+${pend[a.id]} ${a.name}`).join(', ')}. This cannot be undone.</p>
    <div class="actions"><button data-no>Cancel</button><button class="primary" data-yes>Confirm</button></div></section>` : '';

  view.innerHTML = `${confirm}<section class="panel"><h2>Level ${p.level}</h2>
    <div class="meter"><span style="width:${p.pct}%"></span></div>
    ${kv('XP', p.need ? `${p.into} / ${p.need}` : 'Max level')}${kv('Points to spend', `<span class="${free ? 'hl' : ''}">${free}</span>`)}
    ${free || staged.length ? '' : '<p class="note">Level up by completing contracts to earn 3 points per level.</p>'}</section>
    ${ATTRS.map(a => { const v = c.attributes[a.id], n = pend[a.id] || 0, cost = costOf(v + n), maxed = v + n >= ATTR_CAP;
      return `<div class="attr"><div class="top"><b>${a.name}</b>
        <span class="val">${v}${n ? ` <span class="up">&rarr; ${v + n}</span>` : ''}</span>
        <span class="step"><button data-dec="${a.id}" aria-label="Decrease ${a.name}" ${n ? '' : 'disabled'}>&minus;</button>
        <button data-inc="${a.id}" aria-label="Increase ${a.name}" ${!maxed && cost <= free ? '' : 'disabled'}>+</button></span></div>
        <small>${a.desc} ${maxed ? 'Maxed.' : `Next point costs ${cost}.`}</small></div>`; }).join('')}
    ${staged.length ? `<div class="actions"><button data-reset>Reset</button><button class="primary" data-apply>Apply</button></div>` : ''}
    <details class="panel"${ui.statsOpen || staged.length ? ' open' : ''}><summary data-stats>Resulting stats</summary>
      ${DERIVED.map(([k, label]) => kv(label, cur[k] === after[k] ? cur[k] : `${cur[k]} <span class="up">&rarr; ${after[k]}</span>`)).join('')}
      ${kv('Cyberware load', `${A.load} / ${A.capacity}${A.capacity === B.capacity ? '' : ` <span class="up">&rarr; ${A.load} / ${B.capacity}</span>`}`)}${kv('Cyberware status', A.name === B.name ? A.name : `${A.name} <span class="up">&rarr; ${B.name}</span>`)}
      <p class="note">Used by combat and cyberware in later milestones.</p></details>`;

  view.onclick = e => {
    const t = (a) => e.target.closest(`[${a}]`);
    if (t('data-stats')) { e.preventDefault(); ui.statsOpen = !ui.statsOpen; }
    else if (t('data-inc')) {
      const id = t('data-inc').dataset.inc, v = c.attributes[id] + (pend[id] || 0);
      if (v >= ATTR_CAP || costOf(v) > free) return;           // never stage more than can be afforded
      pend[id] = (pend[id] || 0) + 1;
    }
    else if (t('data-dec')) { const id = t('data-dec').dataset.dec; pend[id] = Math.max(0, (pend[id] || 0) - 1); }
    else if (t('data-reset')) ui.pending = {};
    else if (t('data-apply')) ui.confirm = true;
    else if (t('data-no')) ui.confirm = false;
    else if (t('data-yes')) { for (const a of staged) c.attributes[a.id] += pend[a.id]; ui.pending = {}; ui.confirm = false; refreshStatus(c); persist(); }
    else return;
    rerender();
  };
}
const kv = (k, v) => `<div class="kv"><span>${k}</span><b>${v}</b></div>`;
