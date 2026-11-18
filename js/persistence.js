// Local persistence (early development only). Real saves move server-side in the multiplayer phase.
import { defaultState, SAVE_VERSION } from './state.js';
import { deepFreeze } from './util.js';
import { ITEMS } from './data/items.js';
import { baseAttrs } from './progression.js';
import { newCyberware } from './cyberware.js';
import { newMap } from './city.js';
import { LOC } from './data/city.js';
import { BACKGROUNDS } from './data/backgrounds.js';
import { newInventory, addItem, equip, defaultSlot, fits, SLOTS } from './inventory.js';
const KEY = 'nullcity.save';

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const s = migrate({ ...defaultState(), ...JSON.parse(raw) });
    if (s.character) deepFreeze(s.character.original);   // keep the original record read-only
    return s;
  } catch (e) {
    console.warn('Save unreadable, starting fresh.', e);
    return defaultState();
  }
}

export function save(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { console.warn('Save failed.', e); }
}

export function migrate(s) {
  // v1 -> v2: account, character and draft added; defaultState() supplies them.
  // v2 -> v3: characters gain a progress block (tutorial, missions).
  if (s.character && !s.character.progress) s.character.progress = { tutorial: 0, completed: [], active: null, lastResult: null };
  // v3 -> v4: item name strings become an inventory of item ids.
  if (s.character && Array.isArray(s.character.items)) {
    const c = s.character; c.inventory = newInventory();
    for (const raw of c.items) {
      const m = /^(.*?)(?: x(\d+))?$/.exec(raw), found = Object.values(ITEMS).find(i => i.name === m[1]);
      if (!found) { console.warn('Unknown item dropped in migration:', raw); continue; }
      addItem(c, found.id, +(m[2] || 1));
      const slot = found.type === 'equipment' && SLOTS.map(x => x.key).find(k => fits(found, k) && !c.inventory.equipped[k]);
      if (slot && found.id !== 'surplus_vest') equip(c, found.id, slot);
    }
    delete c.items;
  }
  // v4 -> v5: levels and attributes. Completed contracts are credited with the XP they now award.
  if (s.character && !s.character.attributes) {
    s.character.attributes = baseAttrs(s.character.original.background);
    s.character.xp = (s.character.progress?.completed?.length || 0) * 120;
  }
  // v5 -> v6: cyberware.
  if (s.character && !s.character.cyberware) s.character.cyberware = newCyberware();
  // v6 -> v7: locations are ids and the character has a map.
  if (s.character && !s.character.map) {
    const c = s.character, OLD = { 'Dustline Depot, Outskirts': 'dustline_depot', 'Aegis Tower Residence, Corporate District': 'aegis_residence', 'Gutter Row, Underground Market': 'gutter_row' };
    if (!LOC[c.location]) c.location = OLD[c.location] || BACKGROUNDS[c.original.background].locationId;
    c.map = newMap(c.location);
  }
  s.saveVersion = SAVE_VERSION;
  return s;
}
