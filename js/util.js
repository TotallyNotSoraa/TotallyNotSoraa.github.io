export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// In-game calendar: year 2048, real month and day.
export function gameDate(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `2048.${p(d.getMonth() + 1)}.${p(d.getDate())}`;
}
export function deepFreeze(o) {
  Object.values(o).forEach(v => { if (v && typeof v === 'object') deepFreeze(v); });
  return Object.freeze(o);
}

// Sequencer. Elements marked data-type are typed out; elements marked data-seq fade in.
// They play strictly in document order, so a screen builds top to bottom. Tap to finish at once.
// With reduced motion nothing is hidden and nothing animates. startDelay waits for an entrance animation.
let stopSeq = () => {};
export function typewrite(root, startDelay = 0) {
  stopSeq();
  const els = [...root.querySelectorAll('[data-type],[data-seq]')];
  if (!els.length || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const items = els.map(el => {
    if (!el.hasAttribute('data-type')) { el.classList.add('seq'); return { el, typed: false }; }
    const text = el.textContent;
    el.innerHTML = '<span class="t-on"></span><span class="t-off"></span>';
    el.lastChild.textContent = text;
    return { el, typed: true, text, on: el.firstChild, off: el.lastChild };
  });
  const show = (it, n) => { it.on.textContent = it.text.slice(0, n); it.off.textContent = it.text.slice(n); };
  let i = 0, pos = 0, timer = 0;
  const finish = () => {
    clearTimeout(timer);
    items.forEach(it => { if (it.typed) { show(it, it.text.length); it.el.classList.remove('typing'); } else it.el.classList.add('seq-in'); });
    root.removeEventListener('pointerdown', finish);
    stopSeq = () => {};
  };
  const next = () => {
    if (i >= items.length) return finish();
    const it = items[i];
    if (!it.typed) { it.el.classList.add('seq-in'); i++; timer = setTimeout(next, 70); return; }
    it.el.classList.add('typing'); tick();
  };
  const tick = () => {
    const it = items[i];
    pos += Math.max(1, Math.ceil(it.text.length / 50));   // long texts finish in about a second
    show(it, pos);
    if (pos >= it.text.length) { it.el.classList.remove('typing'); i++; pos = 0; timer = setTimeout(next, 60); }
    else timer = setTimeout(tick, 16);
  };
  root.addEventListener('pointerdown', finish);
  stopSeq = finish;
  timer = setTimeout(next, startDelay);
}
