// First-login flow: account, identity, appearance, background, introduction.
import { BACKGROUNDS } from './data/backgrounds.js';
import { newCharacter } from './character.js';
import { ITEMS } from './data/items.js';
import { esc, gameDate, typewrite } from './util.js';

const OPT = {
  gender: ['Female', 'Male', 'Non-binary', 'Unspecified'],
  eyes: ['Brown', 'Blue', 'Green', 'Grey', 'Amber', 'Cybernetic red', 'Cybernetic cyan'],
  hairColor: ['Black', 'Brown', 'Blonde', 'White', 'Neon blue', 'Magenta', 'Shaved'],
  hairStyle: ['Cropped', 'Long', 'Mohawk', 'Braids', 'Slicked back', 'Tied up'],
  clothing: ['Corporate formal', 'Road worn', 'Street layers', 'Tactical', 'Minimal'],
};
const TABS = ['Profile', 'Identity', 'Look', 'Origin', 'Intro'];
const TITLES = ['Local profile', 'Identity', 'Appearance', 'Background', 'Introduction'];

const fld = (label, name, v = '', extra = '') =>
  `<label class="fld" data-seq>${label}<input name="${name}" value="${esc(v)}" ${extra}></label>`;
const sel = (label, name, v) =>
  `<label class="fld" data-seq>${label}<select name="${name}">${OPT[name].map(o =>
    `<option${o === v ? ' selected' : ''}>${o}</option>`).join('')}</select></label>`;

function stepHtml(d) {
  switch (d.step) {
    case 0: return `<p class="note" data-type>Stored on this device only. There is no online account yet.</p>
      ${fld('Username', 'username', d.username, 'maxlength="20" autocomplete="off" required')}`;
    case 1: return `${fld('Legal name', 'legalName', d.legalName, 'maxlength="40" required')}
      ${fld('Alias / callsign', 'alias', d.alias, 'maxlength="20" required')}
      ${fld('Date of birth', 'dob', d.dob, `type="date" max="${new Date().toISOString().slice(0, 10)}" required`)}
      ${fld('Place of birth', 'pob', d.pob, 'maxlength="40" required')}
      ${sel('Gender', 'gender', d.gender)}`;
    case 2: return `${sel('Eye color', 'eyes', d.eyes)}${sel('Hair color', 'hairColor', d.hairColor)}
      ${sel('Hair style', 'hairStyle', d.hairStyle)}${sel('Clothing style', 'clothing', d.clothing)}
      ${fld('Distinguishing features', 'features', d.features, 'maxlength="80"')}
      <label class="fld" data-seq>Description<textarea name="description" maxlength="300" rows="3">${esc(d.description)}</textarea></label>`;
    case 3: return Object.entries(BACKGROUNDS).map(([k, b]) =>
      `<label class="card" data-seq><input type="radio" name="background" value="${k}" ${d.background === k ? 'checked' : ''} required>
       <span><b>${b.label}</b><br>${b.tagline}</span></label>`).join('') +
      `<p class="note" data-type>Your background shapes your start, not your future.</p>`;
    case 4: { const b = BACKGROUNDS[d.background];
      return `<p data-type>${b.intro}</p><div class="kv" data-seq><span>Start</span><b data-type>${b.location}</b></div>
      <div class="kv" data-seq><span>Credits</span><b data-type>${b.credits}</b></div>
      <div class="kv" data-seq><span>Gear</span><b data-type>${b.gear.map(g => ITEMS[g.id].name + (g.qty > 1 ? ' x' + g.qty : '')).join(', ')}</b></div>
      <div class="kv" data-seq><span>Contacts</span><b data-type>${b.contacts.join(', ')}</b></div>`; }
  }
}

function validate(d, step, v) {
  if (step === 0 && !/^[A-Za-z0-9_]{3,20}$/.test(v.username)) return 'Username: 3 to 20 letters, digits or underscores.';
  if (step === 1 && (!v.legalName.trim() || !v.alias.trim() || !v.dob || !v.pob.trim())) return 'Fill in every identity field.';
  if (step === 3 && !BACKGROUNDS[v.background]) return 'Choose a background.';
  return '';
}

export function renderOnboarding(state, view, rerender, persist) {
  const d = state.draft ??= { step: 0, docId: 'NC-' + String(Math.floor(Math.random() * 1e8)).padStart(8, '0'),
    username: '', legalName: '', alias: '', dob: '', pob: '', gender: OPT.gender[3],
    eyes: OPT.eyes[0], hairColor: OPT.hairColor[0], hairStyle: OPT.hairStyle[0], clothing: OPT.clothing[0],
    features: '', description: '', background: '' };
  const last = d.step === 4;
  const fresh = !view.querySelector('.folder');
  view.innerHTML = `<div class="folder${fresh ? ' fresh' : ''}">
    <div class="f-tabs">${TABS.map((t, i) => `<span class="f-tab${i === d.step ? ' on' : i < d.step ? ' done' : ''}">${t}</span>`).join('')}</div>
    <form class="f-body" autocomplete="off">
      <div class="sheet">
        <div class="doc-head" data-seq><b>CIVIL REGISTRY RECORD</b><span>Doc ${d.docId}<br>Filed ${gameDate()}<br>Class: UNRANKED</span></div>
        <h2 data-type>Step ${d.step + 1} of 5: ${TITLES[d.step]}</h2>
        ${stepHtml(d)}
        <p class="err" id="err" role="alert"></p>
        ${last ? '<div class="stamp" data-seq>REGISTERED</div>' : ''}
      </div>
      <div class="f-lip" data-seq><div class="actions">${d.step > 0 ? '<button type="button" data-back>Back</button>' : ''}
        <button class="primary">${last ? 'Begin' : 'Next'}</button></div></div>
    </form></div>`;
  typewrite(view, fresh ? 550 : 0);
  view.onclick = e => { if (e.target.closest('[data-back]')) { d.step--; persist(); rerender(); } };
  view.onsubmit = e => {
    e.preventDefault();
    const v = Object.fromEntries(new FormData(e.target));
    const err = validate(d, d.step, v);
    if (err) { view.querySelector('#err').textContent = err; return; }
    Object.assign(d, v);
    if (last) {
      state.account = { username: d.username, created: gameDate() };
      state.character = newCharacter(d); state.draft = null; state.activeTab = 'profile';
    } else d.step++;
    persist(); rerender();
  };
}
