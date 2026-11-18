// PROFILE > Character. Summary first, detail on request (progressive disclosure).
import { esc } from './util.js';
import { BACKGROUNDS } from './data/backgrounds.js';
import { xpProgress } from './progression.js';
import { placeName } from './city.js';

const row = (k, v) => `<div class="kv"><span>${k}</span><b>${esc(v || 'None')}</b></div>`;
const rep = (n) => (n > 0 ? `+${n}` : String(n));

export function renderCharacter(c) {
  const o = c.original, op = c.operator, r = c.reputation;
  const bg = BACKGROUNDS[o.background];
  return `
  <section class="panel">
    <h2>${esc(op.alias)}</h2>
    ${row('Level', (() => { const p = xpProgress(c.xp); return p.need ? `${p.level} (XP ${p.into}/${p.need})` : `${p.level} (max)`; })())}
    ${row('Class', op.classification)}${row('Status', op.status)}
    ${row('Location', placeName(c.location))}${row('Credits', c.credits)}
    ${row('Affiliation', op.affiliations.join(', '))}
  </section>
  <details class="panel"><summary>Reputation</summary>
    ${row('Corporate', rep(r.corporate))}${row('Street', rep(r.street))}
    ${row('Nomad', rep(r.nomad))}${row('Underground', rep(r.underground))}
    ${row('District', Object.keys(r.district).length ? '' : 'none yet')}
    ${row('Corporation', Object.keys(r.corporation).length ? '' : 'none yet')}
  </details>
  <details class="panel" open><summary>Personal history</summary>
    ${c.history.map(h => `<div class="kv"><span>${h.date}</span><b>${esc(h.text)}</b></div>`).join('')}
  </details>
  <details class="panel"><summary>Original identity record</summary>
    <div class="flag">IMMUTABLE</div>
    ${row('Document', o.docId)}${row('Registered', o.registeredOn)}
    ${row('Legal name', o.legalName)}${row('Original alias', o.alias)}
    ${row('Born', `${o.dob}, ${o.pob}`)}${row('Gender', o.gender)}
    ${row('Eyes', o.eyes)}${row('Hair', `${o.hairColor}, ${o.hairStyle}`)}
    ${row('Style', o.clothing)}${row('Features', o.features)}
    ${row('Background', bg.label)}
    <p class="note">${esc(o.description)}</p>
  </details>`;
}
