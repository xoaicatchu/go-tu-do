// Gõ Tự Do — trang giới thiệu. Không phụ thuộc thư viện nào.
(function () {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TONE = new Set(['s', 'f', 'r', 'x', 'j', 'w']);

  // ---------------- Hero: "Gõ tự do" tự gõ ra từ phím thô "Gox tuwj do" ----------------
  // Mỗi bước: phím bấm, chuỗi hiện ra, vị trí ký tự vừa nhận dấu (tô đỏ một nhịp)
  const STEPS = [
    ['G', 'G'], ['o', 'Go'], ['x', 'Gõ', 1],
    [' ', 'Gõ '],
    ['t', 'Gõ t'], ['u', 'Gõ tu'], ['w', 'Gõ tư', 4], ['j', 'Gõ tự', 4],
    [' ', 'Gõ tự '],
    ['d', 'Gõ tự d'], ['o', 'Gõ tự do'],
  ];
  const word = document.getElementById('word');
  const keys = document.getElementById('keys');
  const caret = document.querySelector('.caret');

  function render(text, mark) {
    word.textContent = '';
    [...text].forEach((c, i) => {
      const s = document.createElement('span');
      s.className = 'ch' + (c === ' ' ? ' sp' : '') + (i === mark ? ' mark' : '');
      s.textContent = c === ' ' ? ' ' : c;
      word.appendChild(s);
    });
    if (mark != null) requestAnimationFrame(() => requestAnimationFrame(() => {
      const m = word.children[mark]; if (m) m.classList.remove('mark'); // mực đỏ phai về màu mực
    }));
  }
  function keycap(k, animate) {
    const el = document.createElement('span');
    el.className = 'key' + (k === ' ' ? ' space' : '') + (TONE.has(k) ? ' tone' : '') + (animate ? ' in' : '');
    el.textContent = k === ' ' ? 'space' : k;
    keys.appendChild(el);
  }

  // Chữ tự gõ ra, dừng, xoá từng chữ, gõ lại — lặp liên tục (kể cả khi Windows tắt "Animation effects",
  // vì đây là nội dung chính của trang); chỉ bỏ hiệu ứng phím lún khi người dùng chọn giảm chuyển động.
  const FULL = STEPS[STEPS.length - 1][1];
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  async function loop() {
    await sleep(450);
    for (;;) {
      for (const [k, text, mark] of STEPS) {            // gõ
        render(text, mark); keycap(k, !reduce);
        await sleep(k === ' ' ? 260 : TONE.has(k) ? 300 : 150);
      }
      await sleep(2400);                                 // dừng cho đọc
      const chars = [...FULL];
      const per = keys.children.length / chars.length;   // rút dải phím theo nhịp xoá chữ
      for (let n = chars.length - 1; n >= 0; n--) {      // xoá từng chữ, như bấm Backspace
        render(chars.slice(0, n).join(''));
        while (keys.children.length > Math.round(n * per)) keys.removeChild(keys.lastChild);
        await sleep(70);
      }
      keys.textContent = '';
      await sleep(500);
    }
  }
  render('');
  loop();

  // ---------------- Ô gõ thử ----------------
  const pad = document.getElementById('pad');
  const pressed = document.getElementById('pressed');
  const label = (k) => k === ' ' ? '␣' : k === 'Backspace' ? '⌫' : k === 'Enter' ? '↵' : k.length === 1 ? k : null;
  function showKey(k) {
    const t = label(k); if (!t) return;
    const el = document.createElement('kbd'); el.textContent = t;
    pressed.appendChild(el);
    while (pressed.children.length > 16) pressed.removeChild(pressed.firstChild);
  }
  pad.addEventListener('keydown', (e) => { if (!e.ctrlKey && !e.metaKey && !e.altKey) showKey(e.key); });
  document.getElementById('clear').addEventListener('click', () => { pad.value = ''; pressed.textContent = ''; pad.focus(); });

  // Nút ví dụ: gõ từng phím vào ô bằng chính engine của Gõ Tự Do (giống hệt khi bạn tự gõ)
  let typing = null;
  function framesFor(keysStr) {
    const IME = window.GoTuDoIME, dict = window.GoTuDoDict;
    if (!IME || !dict) return null;
    const s = new IME.Session({ dict, method: 'telex', auto: true });
    let out = ''; const frames = [];
    const apply = (r) => {
      if (!r) return;
      if (Array.isArray(r.lookback)) {
        let head = out.slice(0, out.length - r.from.length);
        for (const lb of r.lookback) {
          if (!head.endsWith(lb.from + ' ')) break;
          const st = head.length - lb.from.length - 1;
          out = out.slice(0, st) + lb.to + out.slice(st + lb.from.length); head = head.slice(0, st);
        }
      }
      out = out.slice(0, out.length - r.from.length) + r.to;
    };
    for (const ch of keysStr) {
      const r = s.type(ch);
      if (s.isWordKey(ch)) {
        if (r.lookback && !Array.isArray(r.lookback)) {
          const pat = r.lookback.from + r.lookback.sep + r.from;
          if (out.endsWith(pat)) out = out.slice(0, out.length - pat.length) + r.lookback.to + r.lookback.sep + r.from;
        }
        apply({ from: r.from, to: r.to });
      } else { apply(r); out += ch; }
      frames.push([ch, out]);
    }
    const r = s.commit(' '); apply(r); out += ' ';
    frames.push([' ', out]);
    return frames;
  }
  document.querySelectorAll('.sample').forEach((b) => b.addEventListener('click', () => {
    const frames = framesFor(b.dataset.keys);
    if (!frames) { pad.focus(); return; }
    clearTimeout(typing);
    const base = pad.value && !/\s$/.test(pad.value) ? pad.value + '\n' : pad.value;
    pressed.textContent = '';
    let i = 0;
    const step = () => {
      if (i >= frames.length) { pad.focus(); pad.setSelectionRange(pad.value.length, pad.value.length); return; }
      const [k, text] = frames[i++];
      pad.value = base + text; showKey(k);
      pad.scrollTop = pad.scrollHeight;
      typing = setTimeout(step, 70);
    };
    step();
  }));

  // ---------------- Mã nhúng: dùng đúng tên miền đang mở ----------------
  const embed = document.getElementById('embed');
  const src = location.origin.startsWith('http') ? location.origin + '/gotudo.bundle.js' : '/gotudo.bundle.js';
  const tag = '<script src="' + src + '" defer></' + 'script>';
  embed.textContent = tag;
  const copy = document.getElementById('copy');
  copy.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(tag); copy.textContent = 'Đã chép'; }
    catch (e) { const r = document.createRange(); r.selectNodeContents(embed); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); copy.textContent = 'Bấm Ctrl+C'; }
    setTimeout(() => { copy.textContent = 'Chép'; }, 1800);
  });
})();
