// Gõ Tự Do — trang giới thiệu. Không phụ thuộc thư viện nào.
(function () {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TONE = new Set(['s', 'f', 'r', 'x', 'j', 'w']);

  // ---------------- Hero: lần lượt gõ các câu theo từng tình huống dùng ----------------
  // Chữ hiện ra lấy từ chính bộ gõ (framesFor), từng phím một — không phải chữ dựng sẵn.
  const PHRASES = [
    { keys: 'Gox tuwj do', tag: 'Gõ Tự Do' },
    { keys: 'toois nay ddi awn khoong?', tag: 'Nhắn tin Zalo, Messenger' },
    { keys: 'to the moon', tag: 'Tiếng Anh giữ nguyên' },
    { keys: 'deploy chieeuf nay nhes', tag: 'Làm việc, lập trình' },
    { keys: 'hoabgf', tag: 'Trượt phím? Tự sửa' },
    { keys: 'Freeship toanf quoocs', tag: 'Bán hàng online' },
    { keys: 'hocj IELTS mooix ngayf', tag: 'Học tập' },
  ];
  const word = document.getElementById('word');
  const keys = document.getElementById('keys');
  const tagEl = document.getElementById('tag');
  const h1 = document.querySelector('.hero-word');
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const MAX_KEYS = 18;

  function render(text, mark) {
    word.textContent = '';
    [...text].forEach((c, i) => {
      const s = document.createElement('span');
      s.className = 'ch' + (c === ' ' ? ' sp' : '') + (i === mark ? ' mark' : '');
      s.textContent = c === ' ' ? ' ' : c;
      word.appendChild(s);
    });
    if (mark != null) requestAnimationFrame(() => requestAnimationFrame(() => {
      const m = word.children[mark]; if (m) m.classList.remove('mark'); // dấu loé màu nhấn rồi về trắng
    }));
  }
  function keycap(k, animate) {
    const el = document.createElement('span');
    el.className = 'key' + (k === ' ' ? ' space' : '') + (TONE.has(k) ? ' tone' : '') + (animate ? ' in' : '');
    el.textContent = k === ' ' ? 'space' : k;
    keys.appendChild(el);
    // giữ một hàng: bỏ phím cũ nhất khi tràn chiều ngang
    while (keys.children.length > 1 && (keys.children.length > MAX_KEYS || keys.scrollWidth > keys.clientWidth + 1)) keys.removeChild(keys.firstChild);
  }

  // Cỡ chữ vừa khung cho từng câu; chiều cao dòng cố định để phần dưới không nhảy
  let baseFs = 0;
  const probe = document.createElement('span');
  probe.className = 'hero-probe'; probe.setAttribute('aria-hidden', 'true');
  h1.appendChild(probe);
  function measureBase() {
    h1.style.fontSize = ''; h1.style.height = ''; h1.style.paddingBottom = '';
    baseFs = parseFloat(getComputedStyle(h1).fontSize);
    h1.style.height = (baseFs * 1.06) + 'px';
    h1.style.paddingBottom = (baseFs * 0.14) + 'px'; // cố định theo cỡ lớn nhất, không đổi theo từng câu
  }
  function fitTo(text) {
    probe.style.fontSize = '100px'; probe.textContent = text;
    const w = probe.getBoundingClientRect().width || 1;
    const room = h1.clientWidth - baseFs * 0.12; // chừa chỗ con trỏ
    h1.style.fontSize = Math.min(baseFs, Math.floor(100 * room / w)) + 'px';
  }
  let current = PHRASES[0];
  measureBase();
  window.addEventListener('resize', () => { measureBase(); fitTo(current.out || 'Gõ tự do'); });

  async function engineReady() {
    for (let i = 0; i < 100 && !(window.GoTuDoIME && window.GoTuDoDict); i++) await sleep(50);
    return !!(window.GoTuDoIME && window.GoTuDoDict);
  }
  function framesOf(ph) {
    const fr = framesFor(ph.keys) || [];
    let prev = '';
    return fr.map(([k, text], i) => {
      const t = i === fr.length - 1 ? text.replace(/\s+$/, '') : text;
      const a = [...prev], b = [...t];
      let mark = null;
      for (let j = 0; j < Math.min(a.length, b.length); j++) if (a[j] !== b[j]) { mark = j; break; } // ký tự vừa nhận dấu
      prev = t;
      return [k, t, mark];
    });
  }

  async function loop() {
    await sleep(350);
    const ok = await engineReady();
    if (!ok) { render('Gõ tự do'); return; }
    PHRASES.forEach((ph) => { ph.frames = framesOf(ph); ph.out = ph.frames.length ? ph.frames[ph.frames.length - 1][1] : ''; });
    for (let n = 0; ; n = (n + 1) % PHRASES.length) {
      const ph = current = PHRASES[n];
      fitTo(ph.out);
      tagEl.textContent = ph.tag; tagEl.classList.remove('in'); void tagEl.offsetWidth; tagEl.classList.add('in');
      keys.textContent = '';
      for (const [k, text, mark] of ph.frames) {            // gõ từng phím
        render(text, mark);
        if (k !== ' ' || text.trim()) keycap(k, !reduce);
        await sleep(k === ' ' ? 180 : TONE.has(k) ? 230 : 105);
      }
      await sleep(n === 0 ? 2200 : 1700);                    // dừng cho đọc
      const chars = [...ph.out];
      const per = keys.children.length / Math.max(1, chars.length);
      for (let i = chars.length - 1; i >= 0; i--) {          // xoá từng chữ, như bấm Backspace
        render(chars.slice(0, i).join(''));
        while (keys.children.length > Math.round(i * per)) keys.removeChild(keys.lastChild);
        await sleep(chars.length > 14 ? 32 : 55);
      }
      await sleep(380);
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
