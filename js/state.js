// Bump SAVE_VERSION when the shape changes and add a step in persistence.migrate().
export const SAVE_VERSION = 7;
export const GAME_VERSION = '0.7.1';

export function defaultState() {
  return { saveVersion: SAVE_VERSION, activeTab: 'nav', subTabs: {}, account: null, character: null, draft: null };
}
