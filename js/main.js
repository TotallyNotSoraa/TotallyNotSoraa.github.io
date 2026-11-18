import { load, save } from './persistence.js';
import { mountUI } from './ui.js';
import { runBoot } from './boot.js';

const state = load();
const start = () => mountUI(state, () => save(state));

// The boot sequence plays once per browser session (closing the tab starts a new session).
let seen = false;
try { seen = sessionStorage.getItem('nullcity.booted') === '1'; sessionStorage.setItem('nullcity.booted', '1'); } catch (e) { /* storage blocked: just play it */ }
if (seen) start(); else runBoot(state, start);

const clock = document.getElementById('clock');
const tick = () => { clock.textContent = new Date().toTimeString().slice(0, 5); };
tick(); setInterval(tick, 30000);
