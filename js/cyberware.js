// Cyberware rules. Capacity comes from Technical, psychosis tolerance from Cool (plus some implants).
// Loading more than your capacity is allowed, but pushes you through the cyberpsychosis stages below.
import { ITEMS } from './data/items.js';
import { derived, levelFromXp, meetsReq, reqText, DERIVED } from './progression.js';
import { addItem, takeItem } from './inventory.js';
import { gameDate } from './util.js';

export const REGIONS = [
  { id: 'neural', name: 'Neural System', short: 'Neural', slots: 2, desc: 'Nerve interface and reflex pathways.' },
  { id: 'optics', name: 'Optics', short: 'Optics', slots: 1, desc: 'Eyes and visual processing.' },
  { id: 'os', name: 'Operating System', short: 'Op. System', slots: 1, desc: 'The software layer that runs your implants.' },
  { id: 'cortex', name: 'Frontal Cortex', short: 'Frontal Cortex', slots: 1, desc: 'Decision-making and impulse control.' },
  { id: 'arms', name: 'Arms', short: 'Arms', slots: 1, desc: 'Reinforcement and integrated tools.' },
  { id: 'hands', name: 'Hands', short: 'Hands', slots: 1, desc: 'Grip, dexterity and weapon links.' },
  { id: 'skeleton', name: 'Skeleton', short: 'Skeleton', slots: 1, desc: 'The frame that carries everything else.' },
  { id: 'circ', name: 'Circulatory System', short: 'Circulatory', slots: 1, desc: 'Heart, blood and stamina.' },
  { id: 'immune', name: 'Immune System', short: 'Immune', slots: 1, desc: 'Resistance to toxins and implant rejection.' },
  { id: 'legs', name: 'Legs', short: 'Legs', slots: 1, desc: 'Speed, jumping and balance.' },
  { id: 'skin', name: 'Integumentary System', short: 'Integumentary', slots: 1, desc: 'Skin, plating and camouflage.' },
];
export const STAGES = ['Stable', 'Strained', 'Unstable', 'Cyberpsychosis'];
const OPERATOR_STATUS = ['Active', 'Active', 'Unstable', 'Cyberpsychosis'];
// Stat penalties per stage. Combat will also use the stage to decide when you lose control of an action.
export const PENALTY = [{}, { accuracy: -3, stealth: -3 }, { accuracy: -6, stealth: -6, hacking: -3 }, { accuracy: -10, stealth: -9, hacking: -6, defense: -4 }];

const LABEL = Object.fromEntries(DERIVED.map(([k, l]) => [k, l]));
export const fxText = (fx) => Object.entries(fx).map(([k, v]) => `${v > 0 ? '+' : ''}${v} ${LABEL[k]}`).join(', ') || 'No effect';
export const slotsOf = (region) => REGIONS.find(r => r.id === region).slots;
export const newCyberware = () => ({ installed: {}, psychosisSeen: false });
export const installedIds = (c) => Object.values(c.cyberware.installed).flat();
export const stageOf = (load, capacity, tolerance) => { const over = load - capacity; return over <= 0 ? 0 : over <= tolerance ? 1 : over <= 2 * tolerance ? 2 : 3; };

// Effective stats for a set of installed implants and a set of attributes (both can be hypothetical).
export function stats(c, attrs = c.attributes, ids = installedIds(c)) {
  const base = derived(attrs, levelFromXp(c.xp)), bonus = {};
  for (const id of ids) for (const [k, v] of Object.entries(ITEMS[id].effects)) bonus[k] = (bonus[k] || 0) + v;
  const load = ids.reduce((s, id) => s + ITEMS[id].cap, 0);
  const capacity = base.capacity + (bonus.capacity || 0), tolerance = base.tolerance + (bonus.tolerance || 0);
  const stage = stageOf(load, capacity, tolerance), penalty = PENALTY[stage];
  const values = { ...base };
  for (const k of Object.keys(values)) values[k] = Math.max(0, values[k] + (bonus[k] || 0) + (penalty[k] || 0));
  values.capacity = capacity; values.tolerance = tolerance;
  return { values, load, capacity, tolerance, stage, name: STAGES[stage], bonus, penalty };
}

export function refreshStatus(c) {
  const s = stats(c);
  c.operator.status = OPERATOR_STATUS[s.stage];
  if (s.stage === 3 && !c.cyberware.psychosisSeen) {
    c.cyberware.psychosisSeen = true;
    c.history.push({ date: gameDate(), text: 'FIRST CYBERPSYCHOSIS EPISODE' });
  }
}

export function canInstall(c, id) {
  const it = ITEMS[id];
  if (it?.type !== 'cyberware') return 'Not cyberware';
  if (!c.inventory.bag.some(e => e.id === id)) return 'Not in storage';
  if ((c.cyberware.installed[it.region] || []).length >= slotsOf(it.region)) return 'No free slot';
  if (!meetsReq(c, it)) return `Requires ${reqText(it)}`;
  return '';
}
export function install(c, id) {
  if (canInstall(c, id)) return false;
  const it = ITEMS[id]; takeItem(c, id);
  (c.cyberware.installed[it.region] ??= []).push(id);
  refreshStatus(c); return true;
}
export function uninstall(c, region, id) {
  const list = c.cyberware.installed[region] || [], i = list.indexOf(id);
  if (i < 0) return false;
  list.splice(i, 1); if (!list.length) delete c.cyberware.installed[region];
  addItem(c, id); refreshStatus(c); return true;
}
export function upgradeProblem(c, id) {
  const it = ITEMS[id], to = ITEMS[it?.upgradeTo];
  if (!to) return 'No upgrade available';
  if (c.credits < it.upgradeCost.credits) return 'Not enough credits';
  for (const [m, n] of Object.entries(it.upgradeCost.mats)) if ((c.inventory.bag.find(e => e.id === m)?.qty || 0) < n) return `Needs ${n} ${ITEMS[m].name}`;
  if (!meetsReq(c, to)) return `Requires ${reqText(to)}`;
  return '';
}
export function upgrade(c, region, id) {
  if (upgradeProblem(c, id)) return false;
  const it = ITEMS[id], list = c.cyberware.installed[region];
  c.credits -= it.upgradeCost.credits;
  for (const [m, n] of Object.entries(it.upgradeCost.mats)) takeItem(c, m, n);
  list[list.indexOf(id)] = it.upgradeTo;
  refreshStatus(c); return true;
}
// Temporary clinic. A real Medical District vendor replaces this in Phase 3.
export function buy(c, id) {
  const it = ITEMS[id];
  if (it?.type !== 'cyberware' || !it.price || c.credits < it.price) return false;
  c.credits -= it.price; addItem(c, id); return true;
}
export const clinicStock = (region) => Object.values(ITEMS).filter(i => i.type === 'cyberware' && i.region === region && i.tier === 1 && i.price > 0);
