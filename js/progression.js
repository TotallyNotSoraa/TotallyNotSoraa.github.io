// Levels, XP, attributes and derived stats. Level and available points are always derived from
// total XP and the attributes themselves, so points can never be granted twice or lost.
export const ATTR_CAP = 20, LEVEL_CAP = 30, POINTS_PER_LEVEL = 3;

export const ATTRS = [
  { id: 'str', name: 'Strength', desc: 'Melee power and heavy gear requirements.' },
  { id: 'agi', name: 'Agility', desc: 'Accuracy, evasion and combat speed.' },
  { id: 'end', name: 'Endurance', desc: 'Health and physical defense.' },
  { id: 'int', name: 'Intelligence', desc: 'Hacking and digital operations.' },
  { id: 'tech', name: 'Technical', desc: 'Engineering, gear skill, cyberware capacity.' },
  { id: 'cool', name: 'Cool', desc: 'Stealth, composure, psychosis tolerance.' },
];
export const ATTR_NAME = Object.fromEntries(ATTRS.map(a => [a.id, a.name]));

// Backgrounds tilt the starting attributes only.
const BIAS = { nomad: { end: 2, tech: 1 }, corpo: { int: 2, cool: 1 }, street: { agi: 2, str: 1 } };
export function baseAttrs(bg) {
  const a = { str: 1, agi: 1, end: 1, int: 1, tech: 1, cool: 1 };
  for (const [k, v] of Object.entries(BIAS[bg] || {})) a[k] += v;
  return a;
}

export const costOf = (v) => (v < 5 ? 1 : v < 10 ? 2 : 3);       // points to raise an attribute from v to v+1
export const need = (level) => 100 + 40 * (level - 1);           // XP to go from level to level+1

export function xpProgress(xp) {
  let level = 1, total = 0;
  while (level < LEVEL_CAP && xp >= total + need(level)) { total += need(level); level++; }
  return level >= LEVEL_CAP ? { level, into: 0, need: 0, pct: 100 }
    : { level, into: xp - total, need: need(level), pct: Math.round(((xp - total) / need(level)) * 100) };
}
export const levelFromXp = (xp) => xpProgress(xp).level;

export function spent(c) {
  const base = baseAttrs(c.original.background);
  let s = 0;
  for (const k of Object.keys(base)) for (let v = base[k]; v < c.attributes[k]; v++) s += costOf(v);
  return s;
}
export const available = (c) => Math.max(0, POINTS_PER_LEVEL * (levelFromXp(c.xp) - 1) - spent(c));

// Previews for combat and cyberware (those systems arrive in later milestones).
export const DERIVED = [
  ['hp', 'Max HP', (a, l) => 50 + a.end * 10 + l * 5],
  ['melee', 'Melee power', (a) => a.str * 2],
  ['accuracy', 'Accuracy %', (a) => 60 + a.agi * 2],
  ['evasion', 'Evasion', (a) => a.agi * 2],
  ['speed', 'Combat speed', (a) => 90 + a.agi * 3],
  ['defense', 'Defense', (a) => a.end * 2],
  ['hacking', 'Hacking power', (a) => a.int * 3],
  ['stealth', 'Stealth', (a) => a.cool * 3],
  ['capacity', 'Cyberware capacity', (a) => 20 + a.tech * 4],
  ['tolerance', 'Psychosis tolerance', (a) => a.cool * 2],
];
export const derived = (a, level) => Object.fromEntries(DERIVED.map(([k, , f]) => [k, f(a, level)]));

export const meetsReq = (c, it) => Object.entries(it.req || {}).every(([k, v]) => (c.attributes?.[k] || 0) >= v);
export const reqText = (it) => Object.entries(it.req || {}).map(([k, v]) => `${ATTR_NAME[k]} ${v}`).join(', ') || 'None';
