import { BACKGROUNDS } from './data/backgrounds.js';
import { gameDate, deepFreeze } from './util.js';
import { ITEMS } from './data/items.js';
import { baseAttrs } from './progression.js';
import { newCyberware } from './cyberware.js';
import { newMap } from './city.js';
import { newInventory, addItem, equip, defaultSlot } from './inventory.js';

export function newCharacter(d) {
  const bg = BACKGROUNDS[d.background];
  const date = gameDate();
  const original = deepFreeze({
    docId: d.docId, registeredOn: date,
    legalName: d.legalName, alias: d.alias, dob: d.dob, pob: d.pob, gender: d.gender,
    eyes: d.eyes, hairColor: d.hairColor, hairStyle: d.hairStyle, clothing: d.clothing,
    features: d.features, description: d.description, background: d.background,
  });
  const c = {
    original,                                   // immutable record
    operator: {                                 // evolves
      classification: 'Unranked Independent', alias: d.alias, status: 'Active',
      affiliations: [], previousAffiliations: [], titles: [],
    },
    reputation: { ...bg.reputation, district: {}, corporation: {} },
    history: [{ date, text: 'IDENTITY REGISTERED' }],
    xp: 0, attributes: baseAttrs(d.background), cyberware: newCyberware(),
    progress: { tutorial: 0, completed: [], active: null, lastResult: null },
    location: bg.locationId, map: newMap(bg.locationId), credits: bg.credits, inventory: newInventory(), contacts: [...bg.contacts],
  };
  for (const g of bg.gear) {
    addItem(c, g.id, g.qty || 1);
    if (g.equip) equip(c, g.id, defaultSlot(ITEMS[g.id]));
  }
  return c;
}
