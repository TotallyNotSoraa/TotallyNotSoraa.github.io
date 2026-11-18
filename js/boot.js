// Terminal-style start-up sequence shown each time the game opens. Cosmetic only.
// It reports the real state of this build: local terminal, no server link, local save.
import { GAME_VERSION } from './state.js';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export function runBoot(state, done) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return done();
  const c = state.character;
  const lines = [
    { t: `> NULL//CITY TERMINAL v${GAME_VERSION}`, cls: 'hi' },
    { t: '> local terminal ........ OK' },
    { t: '> server link .......... NONE (offline build)' },
    { t: `> save data ............ ${c || state.draft ? 'FOUND' : 'NOT FOUND'}` },
    { t: '> loading modules ', bar: true },
    { t: c ? `> operator: ${c.operator.alias}` : '> operator: no identity on file' },
    { t: c ? '> ACCESS GRANTED' : '> OPENING CIVIL REGISTRY', cls: 'ok' },
  ];

  const el = document.createElement('div'); el.id = 'boot';
  const log = document.createElement('div');
  const hint = document.createElement('div'); hint.className = 'hint'; hint.textContent = 'tap to skip';
  el.append(log, hint); document.body.appendChild(el);

  let left = false;
  const leave = () => {
    if (left) return; left = true;
    el.classList.add('out'); done();
    setTimeout(() => el.remove(), 400);
  };
  el.addEventListener('pointerdown', leave);

  (async () => {
    for (const L of lines) {
      if (left) return;
      const row = document.createElement('div'); row.className = `line ${L.cls || ''} typing`; log.appendChild(row);
      for (let i = 1; i <= L.t.length; i++) { if (left) return; row.textContent = L.t.slice(0, i); await sleep(5); }
      if (L.bar) for (let n = 0; n <= 10; n++) {
        if (left) return;
        row.textContent = `${L.t}[${'█'.repeat(n)}${'░'.repeat(10 - n)}] ${n * 10}%`; await sleep(35);
      }
      row.classList.remove('typing');
      await sleep(L.cls === 'hi' ? 140 : 70);
    }
    await sleep(260); leave();
  })();
}
