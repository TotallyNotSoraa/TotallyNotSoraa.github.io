// Inventory rules. The bag holds stacks {id, qty}; equipped items are held in slots, not in the bag.
import { ITEMS, RARITY_RANK } from './data/items.js';
import { meetsReq } from './progression.js';

export const SLOTS = [
  { key: 'head', label: 'Head' }, { key: 'face', label: 'Face' }, { key: 'body', label: 'Body' },
  { key: 'hands', label: 'Hands' }, { key: 'legs', label: 'Legs' }, { key: 'feet', label: 'Feet' },
  { key: 'main', label: 'Main Weapon' }, { key: 'secondary', label: 'Secondary Weapon' },
  { key: 'acc1', label: 'Accessory I' }, { key: 'acc2', label: 'Accessory II' },
];
export const QUICK_SLOTS = 3;
export const newInventory = () => ({ bag: [], equipped: {}, quick: Array(QUICK_SLOTS).fill(null) });
export const slotLabel = (key) => SLOTS.find(s => s.key === key)?.label ?? key;
export const fits = (it, key) => it.slot === key || (it.slot === 'accessory' && key.startsWith('acc'));
export const defaultSlot = (it) => (it.slot === 'accessory' ? 'acc1' : it.slot);

export function addItem(c, id, qty = 1) {
  const e = c.inventory.bag.find(x => x.id === id);
  if (e) e.qty += qty; else c.inventory.bag.push({ id, qty });
}
export function takeItem(c, id, qty = 1) {
  const bag = c.inventory.bag, i = bag.findIndex(x => x.id === id);
  if (i < 0 || bag[i].qty < qty) return false;
  bag[i].qty -= qty;
  if (bag[i].qty === 0) bag.splice(i, 1);
  return true;
}
export function equip(c, id, slotKey) {
  const it = ITEMS[id];
  if (!it || it.type !== 'equipment' || !fits(it, slotKey) || !meetsReq(c, it) || !takeItem(c, id)) return false;
  const old = c.inventory.equipped[slotKey];
  if (old) addItem(c, old);
  c.inventory.equipped[slotKey] = id;
  return true;
}
export function unequip(c, slotKey) {
  const id = c.inventory.equipped[slotKey];
  if (!id) return false;
  delete c.inventory.equipped[slotKey];
  addItem(c, id);
  return true;
}
// Scraps one unit from the bag (never an equipped item). Returns display lines, or null if not allowed.
export function scrap(c, id) {
  const it = ITEMS[id];
  if (!it?.scrap || !takeItem(c, id)) return null;
  return Object.entries(it.scrap).map(([m, n]) => { addItem(c, m, n); return `${n} ${ITEMS[m].name}`; });
}
export function totals(c) {
  const t = {};
  for (const id of Object.values(c.inventory.equipped))
    for (const [k, v] of Object.entries(ITEMS[id]?.stats ?? {})) t[k] = (t[k] || 0) + v;
  return t;
}
export function bagItems(c, type) {
  return c.inventory.bag.filter(e => ITEMS[e.id]?.type === type).map(e => ({ ...ITEMS[e.id], qty: e.qty }));
}
export const sortItems = (list, mode) => [...list].sort((a, b) => mode === 'name'
  ? a.name.localeCompare(b.name)
  : RARITY_RANK[b.rarity] - RARITY_RANK[a.rarity] || a.name.localeCompare(b.name));
