// Shell UI: four permanent tabs plus per-tab sections.
import { renderOnboarding } from './onboarding.js';
import { renderCharacter } from './dossier.js';
import { renderNav } from './nav.js';
import { renderInv } from './inv.js';
import { renderAttributes } from './attributes.js';
import { renderCyberware } from './cyberware-ui.js';
import { typewrite } from './util.js';

const icon = (p) => `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
export const TABS = [
  { id: 'nav', label: 'NAV', subs: [], phase: 3, icon: icon('<path d="M12 3l7 9-7 9-7-9z"/><circle cx="12" cy="12" r="2"/>') },
  { id: 'inv', label: 'INV', subs: ['Equipment', 'Items', 'Cyberware', 'Materials'], phase: 2,
    icon: icon('<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/>') },
  { id: 'net', label: 'NET', subs: ['Global', 'Private', 'Corp', 'Mail', 'News'], phase: 6,
    icon: icon('<path d="M5 19v-4M10 19v-8M15 19V7M20 19V3"/>') },
  { id: 'profile', label: 'PROFILE', subs: ['Character', 'Attributes', 'Skills', 'Achievements'], phase: 2,
    icon: icon('<circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-4 3-6 7-6s7 2 7 6"/>') },
];

const $ = (id) => document.getElementById(id);
let onChange_ = () => {};
let lastKey = '';

export function mountUI(state, onChange) {
  onChange_ = onChange;
  $('tabs').innerHTML = TABS.map(t => `<button data-tab="${t.id}">${t.icon}<span>${t.label}</span></button>`).join('');
  $('tabs').addEventListener('click', e => {
    const b = e.target.closest('[data-tab]'); if (!b) return;
    state.activeTab = b.dataset.tab; render(state); onChange();
  });
  $('subnav').addEventListener('click', e => {
    const b = e.target.closest('[data-sub]'); if (!b) return;
    state.subTabs[state.activeTab] = b.dataset.sub; render(state); onChange();
  });
  render(state);
}

function render(state) {
  const view = $('view');
  const onboarding = !state.character;
  document.body.classList.toggle('onboarding', onboarding);
  if (onboarding) { renderOnboarding(state, view, () => render(state), () => onChange_()); return; }

  const tab = TABS.find(t => t.id === state.activeTab) ?? TABS[0];
  const sub = tab.subs.includes(state.subTabs[tab.id]) ? state.subTabs[tab.id] : tab.subs[0];
  document.querySelectorAll('#tabs button').forEach(b => b.setAttribute('aria-current', String(b.dataset.tab === tab.id)));
  $('subnav').innerHTML = tab.subs.map(s => `<button data-sub="${s}" aria-current="${s === sub}">${s}</button>`).join('');

  view.onsubmit = view.onclick = view.onchange = null;
  const key = `${tab.id}/${sub}`;                    // animate only when the screen changes, not on every tap
  view.classList.toggle('enter', key !== lastKey); lastKey = key;
  if (tab.id === 'nav') {
    renderNav(state, view, () => render(state), () => onChange_());
  } else if (tab.id === 'inv' && sub === 'Cyberware') {
    renderCyberware(state, view, () => render(state), () => onChange_());
  } else if (tab.id === 'inv') {
    renderInv(state, view, sub, () => render(state), () => onChange_());
  } else if (tab.id === 'profile' && sub === 'Attributes') {
    renderAttributes(state, view, () => render(state), () => onChange_());
  } else if (tab.id === 'profile' && sub === 'Character') {
    view.innerHTML = renderCharacter(state.character);
  } else {
    const flag = tab.id === 'net' ? `<div class="flag">SIMULATED: no live connection. No real players.</div>` : '';
    view.innerHTML = `${flag}<section class="panel"><h2>${sub ? `${tab.label} / ${sub}` : tab.label}</h2>
      <p data-type>Not built yet. Planned for Phase ${tab.phase}.</p></section>`;
  }
  view.scrollTop = 0;
  typewrite(view);
}
