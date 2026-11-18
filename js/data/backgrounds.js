// Backgrounds shape the start only. Nothing here restricts future builds, factions or careers.
export const BACKGROUNDS = {
  nomad: {
    label: 'NOMAD',
    tagline: 'Badlands born. Survival, mechanics, transport, scavenging.',
    location: 'Dustline Depot, Outskirts', locationId: 'dustline_depot',
    credits: 400,
    gear: [{ id: 'scrap_carbine', equip: true }, { id: 'patched_road_jacket', equip: true }, { id: 'surplus_vest' }, { id: 'field_repair_kit', qty: 2 }, { id: 'ration_pack', qty: 3 }, { id: 'scrap_metal', qty: 4 }],
    contacts: ['Marrow (convoy mechanic)', 'Sister Ash (salvage broker)'],
    reputation: { corporate: -5, street: 0, nomad: 20, underground: 5 },
    intro: 'The convoy dropped you at the edge of the city with a bag of tools and a debt of favors. Dustline Depot is the last place that still trusts you. Marrow says the city pays well for hands that can fix things quietly.',
  },
  corpo: {
    label: 'CORPO',
    tagline: 'Tower raised. Administration, politics, tech, secure zones.',
    location: 'Aegis Tower Residence, Corporate District', locationId: 'aegis_residence',
    credits: 900,
    gear: [{ id: 'compact_sidearm', equip: true }, { id: 'tailored_suit', equip: true }, { id: 'access_badge', equip: true }, { id: 'surplus_vest' }, { id: 'stim_injector' }, { id: 'circuit_scrap', qty: 2 }],
    contacts: ['Director Hale (your former superior)', 'Imogen Voss (records clerk)'],
    reputation: { corporate: 20, street: -5, nomad: -5, underground: 0 },
    intro: 'Your badge still opens doors, but nobody on the upper floors will say why you were reassigned. Imogen left a message in your queue: the audit trail on your last project has gaps. Someone wants them to stay gaps.',
  },
  street: {
    label: 'STREET KID',
    tagline: 'Gutter raised. Black markets, local crews, street culture.',
    location: 'Gutter Row, Underground Market', locationId: 'gutter_row',
    credits: 250,
    gear: [{ id: 'shock_knuckles', equip: true }, { id: 'hooded_rain_shell', equip: true }, { id: 'surplus_vest' }, { id: 'lockpick_set' }, { id: 'cheap_painkiller', qty: 2 }, { id: 'scrap_metal', qty: 2 }, { id: 'circuit_scrap' }],
    contacts: ['Juno (fence)', 'Old Tam (crew lookout)'],
    reputation: { corporate: -10, street: 20, nomad: 0, underground: 10 },
    intro: 'You know every shortcut on Gutter Row and which doors never close. Juno has a job that pays in cash and no questions. Old Tam says a stranger has been asking about you by your real name.',
  },
};
