import { gameDate } from './util.js';
import { ITEMS } from './data/items.js';
import { addItem } from './inventory.js';
import { levelFromXp, POINTS_PER_LEVEL } from './progression.js';
const REP = { corporate: 'Corporate', street: 'Street', nomad: 'Nomad', underground: 'Underground' };

// Applies rewards to the character and returns display lines.
export function applyEffects(c, fx = {}) {
  const lines = [];
  if (fx.xp) {
    const before = levelFromXp(c.xp);
    c.xp += fx.xp; lines.push(`+${fx.xp} XP`);
    const after = levelFromXp(c.xp);
    if (after > before) lines.push(`Level up! Level ${after}: +${POINTS_PER_LEVEL * (after - before)} attribute points`);
    for (let l = before + 1; l <= after; l++) if (l % 5 === 0) c.history.push({ date: gameDate(), text: `OPERATOR REACHED LEVEL ${l}` });
  }
  if (fx.credits) { c.credits += fx.credits; lines.push(`${fx.credits > 0 ? '+' : ''}${fx.credits} credits`); }
  (fx.items || []).forEach(id => { addItem(c, id); lines.push(`Item: ${ITEMS[id].name}`); });
  for (const [k, v] of Object.entries(fx.rep || {})) {
    c.reputation[k] = (c.reputation[k] || 0) + v;
    lines.push(`${REP[k]} reputation ${v > 0 ? '+' : ''}${v}`);
  }
  if (fx.history) c.history.push({ date: gameDate(), text: fx.history });
  return lines;
}

// Completes a mission: records the milestone, applies the ending, stores the result screen data.
export function finishMission(c, id, mission, end) {
  const p = c.progress;
  if (p.completed.length === 0) c.history.push({ date: gameDate(), text: 'FIRST CONTRACT COMPLETED' });
  p.completed.push(id);
  const lines = applyEffects(c, end.effects);
  p.lastResult = { title: mission.title, text: end.text, lines };
  p.active = null;
}
