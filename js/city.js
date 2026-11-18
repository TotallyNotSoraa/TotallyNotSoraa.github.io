// City state: current location, discovered locations, travel. Travel is free and instant for now.
import { DISTRICTS, LOCATIONS, LOC } from './data/city.js';
import { gameDate } from './util.js';

export const locationsOf = (district) => LOCATIONS.filter(l => l.district === district);
export const placeName = (id) => (LOC[id] ? `${LOC[id].name}, ${DISTRICTS[LOC[id].district].name}` : 'Unknown');
export const isKnown = (c, id) => !!c.map.discovered[id];

function reveal(map, district) { locationsOf(district).forEach(l => { map.discovered[l.id] = true; }); map.visited[district] = true; }

export function newMap(startId) {
  const map = { discovered: {}, visited: {} };
  Object.keys(DISTRICTS).forEach(d => { map.discovered[locationsOf(d)[0].id] = true; });   // entry points
  reveal(map, LOC[startId].district);
  return map;
}

export function travel(c, id) {
  if (!LOC[id] || !isKnown(c, id) || c.location === id) return false;
  const d = LOC[id].district;
  c.location = id;
  if (!c.map.visited[d]) { reveal(c.map, d); c.history.push({ date: gameDate(), text: `DISCOVERED ${DISTRICTS[d].name.toUpperCase()}` }); }
  return true;
}
