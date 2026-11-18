// Item database. type: equipment | item | material. Stats are placeholders until combat exists (Phase 4).
export const RARITY = { common: 'Common', uncommon: 'Uncommon', rare: 'Rare', epic: 'Epic', legendary: 'Legendary' };
export const RARITY_RANK = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
export const CATEGORIES = ['Healing', 'Combat Consumables', 'Tactical Utilities', 'Boosters', 'Quest Items', 'Special Items'];
export const QUICK_CATEGORIES = ['Healing', 'Combat Consumables', 'Tactical Utilities', 'Boosters'];

const eq = (name, slot, rarity, desc, stats, scrap, effect = '', req = {}) => ({ name, type: 'equipment', slot, rarity, desc, stats, scrap, effect, req });
const it = (name, category, rarity, desc, effect = '') => ({ name, type: 'item', category, rarity, desc, effect });
const cw = (name, region, rarity, cap, effects, price, desc, extra = {}) =>
  ({ name, type: 'cyberware', region, rarity, cap, effects, price, desc, tier: 1, req: {}, ...extra });
const mat = (name, rarity, desc, source, uses) => ({ name, type: 'material', rarity, desc, source, uses });

const RAW = {
  scrap_carbine: eq('Scrap Carbine', 'main', 'common', 'Salvaged carbine held together with wire and optimism.', { dmg: 8, speed: -1 }, { scrap_metal: 2 }, 'Loud. Draws attention.'),
  shock_knuckles: eq('Shock Knuckles', 'main', 'uncommon', 'Capacitor-lined knuckledusters that arc on contact.', { dmg: 7, speed: 1 }, { scrap_metal: 1, circuit_scrap: 1 }, 'Arc: may delay a struck target (combat, later).'),
  compact_sidearm: eq('Compact Sidearm', 'secondary', 'common', 'A palm-sized pistol with a short barrel.', { dmg: 6, evasion: 1 }, { scrap_metal: 1 }, 'Quick to draw.'),
  patched_road_jacket: eq('Patched Road Jacket', 'body', 'common', 'Layered canvas and plastic plating, stitched many times.', { armor: 3 }, { synth_fiber: 2 }),
  tailored_suit: eq('Tailored Suit', 'body', 'common', 'Sharp lines, quiet fabric. Looks expensive because it is.', { armor: 1, evasion: 1 }, { synth_fiber: 2 }, 'Corporate staff take you more seriously.'),
  hooded_rain_shell: eq('Hooded Rain Shell', 'body', 'common', 'Waterproof shell with a deep hood. Easy to disappear in.', { armor: 2, evasion: 2 }, { synth_fiber: 2 }),
  surplus_vest: eq('Surplus Vest', 'body', 'common', 'Cheap city-issue plate. Heavy, but it stops things.', { armor: 4, evasion: -1 }, { scrap_metal: 2, synth_fiber: 1 }, 'Heavy. Needs a sturdy frame.', { end: 2 }),
  access_badge: eq('Access Badge (Level 2)', 'accessory', 'uncommon', 'Your old badge. It still works, for now.', {}, { circuit_scrap: 1 }, 'Opens Level 2 corporate doors.'),

  field_repair_kit: it('Field Repair Kit', 'Tactical Utilities', 'common', 'Patches gear and devices in the field.', 'Repairs equipment (later).'),
  lockpick_set: it('Lockpick Set', 'Tactical Utilities', 'common', 'Slim picks and a tension wrench.', 'Opens simple locks (later).'),
  ration_pack: it('Ration Pack', 'Healing', 'common', 'Dense, bland, and enough to keep you going.', 'Restores a little health (combat, later).'),
  cheap_painkiller: it('Cheap Painkiller', 'Healing', 'common', 'Street-grade pills. They work, mostly.', 'Restores a little health (combat, later).'),
  stim_injector: it('Stim Injector', 'Boosters', 'uncommon', 'A single-use shot of adrenal stimulants.', 'Short speed boost (combat, later).'),
  data_shard: it('Data Shard', 'Special Items', 'uncommon', 'Encrypted shard. Needs a decoder.'),
  counterfeit_chips: it('Counterfeit Transit Chips', 'Special Items', 'common', 'Forged transit chips. Illegal in three districts.'),
  audit_log_copy: it('Audit Log Copy', 'Quest Items', 'rare', 'Eleven days of Project Lumen logs on a private drive.'),

  scrap_metal: mat('Scrap Metal', 'common', 'Bent plates and cut stock.', 'Scrapping equipment, salvage jobs', 'Equipment mods, repairs'),
  circuit_scrap: mat('Circuit Scrap', 'uncommon', 'Salvaged boards and chips.', 'Scrapping electronics, hacking jobs', 'Cyberware upgrades, tech mods'),
  synth_fiber: mat('Synth Fiber', 'common', 'Strips of woven synthetic cloth.', 'Scrapping armor and clothing', 'Armor mods, consumables'),

  // Cyberware: cap = capacity used, effects use derived-stat keys (see progression.DERIVED).
  neural_link: cw('Neural Link Mk1', 'neural', 'common', 4, { hacking: 3 }, 180, 'A basic interface between your nerves and a deck.', { upgradeTo: 'neural_link_2', upgradeCost: { credits: 200, mats: { circuit_scrap: 3 } } }),
  neural_link_2: cw('Neural Link Mk2', 'neural', 'uncommon', 6, { hacking: 7 }, 0, 'Faster handshake, wider bandwidth.', { tier: 2 }),
  reflex_booster: cw('Reflex Booster', 'neural', 'uncommon', 5, { speed: 6, evasion: 2 }, 300, 'Shortens the gap between thought and motion.'),
  optic_scanner: cw('Optic Scanner', 'optics', 'common', 3, { accuracy: 3 }, 150, 'Overlays range and target data on your vision.', { upgradeTo: 'optic_scanner_2', upgradeCost: { credits: 180, mats: { circuit_scrap: 2 } } }),
  optic_scanner_2: cw('Optic Scanner Mk2', 'optics', 'uncommon', 4, { accuracy: 6 }, 0, 'Sharper optics and predictive tracking.', { tier: 2 }),
  cyberdeck_os: cw('Cyberdeck OS', 'os', 'common', 5, { hacking: 5 }, 260, 'Lean operating system for running hacking tools.'),
  cortex_buffer: cw('Cortex Buffer', 'cortex', 'uncommon', 4, { tolerance: 3 }, 220, 'Dampens the signals that tip you toward cyberpsychosis.'),
  reinforced_arm: cw('Reinforced Arm', 'arms', 'common', 6, { melee: 4 }, 320, 'Hydraulic reinforcement for a heavier swing.', { req: { str: 2 } }),
  smart_grip: cw('Smart Grip', 'hands', 'common', 3, { accuracy: 2 }, 130, 'Sensors in the palm link your hand to your weapon.'),
  titanium_frame: cw('Titanium Frame', 'skeleton', 'rare', 8, { defense: 5, speed: -3 }, 450, 'A reinforced skeleton. Strong, and heavy.', { req: { end: 3 } }),
  synth_heart: cw('Synth Heart', 'circ', 'uncommon', 5, { hp: 20 }, 350, 'A tireless synthetic pump.'),
  immune_filter: cw('Immune Filter', 'immune', 'common', 3, { defense: 2, tolerance: 1 }, 160, 'Scrubs toxins and calms implant rejection.'),
  spring_legs: cw('Spring Legs', 'legs', 'uncommon', 5, { evasion: 4, speed: 3 }, 280, 'Coiled actuators that turn a step into a leap.'),
  subdermal_plating: cw('Subdermal Plating', 'skin', 'uncommon', 6, { defense: 4, stealth: -2 }, 340, 'Armor under the skin. It shows on a scanner.'),
  camo_weave: cw('Camo Weave', 'skin', 'rare', 5, { stealth: 5 }, 380, 'A light-bending skin weave.'),
};
export const ITEMS = Object.fromEntries(Object.entries(RAW).map(([id, v]) => [id, { id, ...v }]));
