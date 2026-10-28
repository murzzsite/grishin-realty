const LEAD_ENDPOINT = 'https://lead-relay.leestygpt.workers.dev/lead/A3CCGN3BXS';

(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wide = () => window.matchMedia('(min-width: 901px)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const nb = s => s.replace(/ | /g, ' ');
  const fmt = n => nb(new Intl.NumberFormat('ru-RU').format(Math.round(n)));

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ===== intro =====
  const start = () => root.classList.add('go');
  if (document.fonts && document.fonts.ready) {
    Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 900))]).then(() => requestAnimationFrame(start));
  } else start();

  // ===== header hide on scroll down =====
  const header = $('#header');
  let lastY = window.scrollY;

  // ===== stage: parallax + crossfade =====
  const stage = $('#stage');
  const figs = $$('.stage__fig');
  let curStage = 'home';
  const setStage = key => {
    if (key === curStage) return;
    if (!figs.some(f => f.dataset.for === key)) return;
    curStage = key;
    figs.forEach(f => f.classList.toggle('on', f.dataset.for === key));
  };

  // ===== wordmark scale =====
  const mark = $('#mark');
  const band = $('.band');

  // ===== chain scene =====
  const chain = $('#alt');
  const lnSale = $('#lnSale'), lnBuy = $('#lnBuy'), lnEnd = $('#lnEnd');
  const nodes = $$('.c-nodes circle');
  const steps = $$('#steps .step');
  let live = false;
  const setChain = p => {
    lnSale.style.setProperty('--o', 1 - clamp(p / 0.34, 0, 1));
    lnBuy.style.setProperty('--o', 1 - clamp((p - 0.12) / 0.4, 0, 1));
    lnEnd.style.setProperty('--o', 1 - clamp((p - 0.6) / 0.4, 0, 1));
    const idx = clamp(Math.floor(p * 6.0), 0, 5);
    steps.forEach((s, i) => s.classList.toggle('on', i === idx));
    nodes.forEach((n, i) => n.classList.toggle('on', i <= idx));
  };
  const initChain = () => {
    const should = !reduce && wide();
    chain.classList.toggle('is-live', should);
    live = should;
    if (!should) {
      [lnSale, lnBuy, lnEnd].forEach(l => l.style.setProperty('--o', 0));
      steps.forEach(s => s.classList.remove('on'));
      nodes.forEach(n => n.classList.add('on'));
    } else setChain(0);
  };
  initChain();
  window.addEventListener('resize', () => { initChain(); onScroll(); });

  // ===== scroll loop =====
  let ticking = false;
  function onScroll() {
    const y = window.scrollY;
    const vh = window.innerHeight;
    // header
    const hide = y > lastY + 6 && y > 700;
    if (hide) header.classList.add('hide');
    if (y < lastY - 4 || y < 300) header.classList.remove('hide');
    lastY = y;
    // stage parallax
    if (!reduce && stage && wide()) stage.style.setProperty('--py', (-clamp(y * 0.03, 0, 60)) + 'px');
    // wordmark
    if (!reduce && mark) mark.style.setProperty('--ms', (1 - clamp(y / vh, 0, 1) * 0.06).toFixed(4));
    // band parallax
    if (!reduce && band) { const br = band.getBoundingClientRect(); if (br.bottom > 0 && br.top < vh) band.style.setProperty('--bp', (-(1 - (br.top + br.height) / (vh + br.height)) * 14 * br.height / 100) + 'px'); }
    // chain
    if (live) {
      const r = chain.getBoundingClientRect();
      const p = clamp(-r.top / (r.height - vh), 0, 1);
      setChain(p);
    }
    // stage hides under full-width section
    ticking = false;
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  // ===== smooth anchors =====
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href.length <= 1) return;
      const target = $(href);
      if (!target) return;
      e.preventDefault();
      let top = target.getBoundingClientRect().top + window.scrollY - (href === '#top' ? 0 : 24);
      if (href === '#alt' && live) top = target.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
      if (a.dataset.topic !== undefined) setTopic(a.dataset.topic);
    });
  });

  // ===== reveal =====
  const revealSel = [
    '.h2', '.inl', '.lead:not(.hero__lead)', '.task', '.calc', '.menu__r', '.note', '.faq p', '.form > *', '.foot__row', '.credits', '.chain__head > *'
  ].join(',');
  const rvEls = $$(revealSel);
  rvEls.forEach(el => el.classList.add('rv'));
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      const sibs = el.parentElement ? [...el.parentElement.children].filter(c => c.classList.contains('rv')) : [el];
      el.style.setProperty('--d', Math.min(sibs.indexOf(el), 6) * 0.07 + 's');
      el.classList.add('in');
      io.unobserve(el);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
  rvEls.forEach(el => io.observe(el));

  // ===== tasks accordion + stage link =====
  const tasks = $$('.task');
  const openTask = (t, on) => {
    t.classList.toggle('open', on);
    $('button', t).setAttribute('aria-expanded', String(on));
  };
  tasks.forEach(t => {
    $('button', t).addEventListener('click', () => {
      const willOpen = !t.classList.contains('open');
      tasks.forEach(o => openTask(o, false));
      openTask(t, willOpen);
      setStage(willOpen ? t.dataset.stage : 'home');
    });
  });

  // ===== calculator =====
  const S = {
    sale:     { lab: 'Цена продажи, млн ₽', topic: 'sale',    fee: p => Math.max(p * 0.03, 200000), what: 'Продажа: 3% от цены, не менее 200 000 ₽', left: p => p, leftLab: 'Остаётся от цены', note: 'До налогов, обременений и прочих расходов по сделке: их считаем отдельно на консультации.' },
    alt:      { lab: 'Цена вашей продаваемой квартиры, млн ₽', topic: 'alt', fee: p => p * 0.03 + 100000, what: 'Продажа и покупка: 3% от цены продажи + 100 000 ₽', left: p => p, leftLab: 'Остаётся от цены продажи', note: 'Бюджет покупки и сроки обеих сделок разбираем на консультации. Прочие расходы считаются отдельно.' },
    second:   { lab: 'Цена покупки, млн ₽', topic: 'second',  fee: p => Math.max(p * 0.02, 200000), what: 'Покупка на вторичном рынке: 2% от цены, не менее 200 000 ₽', left: null, note: 'Юридическая проверка объекта и сопровождение сделки — отдельная услуга за 100 000 ₽, её можно добавить.' },
    newbuild: { lab: 'Бюджет покупки, млн ₽', topic: 'newbuild', fee: () => 0, what: 'Новостройка: для вас бесплатно', left: null, note: 'Вознаграждение платит застройщик, условия у застройщиков разные. Покупка идёт по прямому договору с застройщиком.' },
    invest:   { lab: 'Бюджет объекта, млн ₽', topic: 'invest', fee: p => Math.max(p * 0.02, 200000), what: 'Инвестиции: 2% от цены, не менее 200 000 ₽', left: null, note: 'Совместный проект обсуждается отдельно. Предполагаемая доходность не является гарантией.' },
    legal:    { lab: 'Цена объекта, млн ₽ (на стоимость не влияет)', topic: 'second', fee: () => 100000, what: 'Юридическая проверка объекта и сопровождение сделки: 100 000 ₽', left: null, note: 'Стоимость фиксированная и не зависит от цены объекта.' }
  };
  let cur = 'sale', shown = 0, anim = 0;
  const num = $('#priceNum'), range = $('#priceRange');
  const feeVal = $('#feeVal'), feeWhat = $('#feeWhat'), barFill = $('#barFill');
  const leftVal = $('#leftVal'), leftLab = $('#leftLab'), calcNote = $('#calcNote'), calcGo = $('#calcGo');

  const tween = to => {
    cancelAnimationFrame(anim);
    if (reduce) { shown = to; feeVal.textContent = fmt(to); return; }
    const from = shown, t0 = performance.now(), dur = 600;
    const tick = t => {
      const k = clamp((t - t0) / dur, 0, 1);
      shown = from + (to - from) * (1 - Math.pow(1 - k, 3));
      feeVal.textContent = fmt(shown);
      if (k < 1) anim = requestAnimationFrame(tick);
    };
    anim = requestAnimationFrame(tick);
  };

  const calc = () => {
    const s = S[cur];
    const p = clamp(parseFloat(String(num.value).replace(',', '.')) || 0, 0, 200) * 1e6;
    const fee = s.fee(p);
    tween(fee);
    const minHit = (cur === 'sale' || cur === 'second' || cur === 'invest') && fee === 200000 && p > 0;
    feeWhat.textContent = s.what + (minHit ? '. Сработал минимум.' : '');
    const share = p > 0 ? clamp(fee / p, 0, 1) : 0;
    barFill.style.width = Math.max(share * 100, fee > 0 ? 2 : 0) + '%';
    const lw = leftVal.parentElement;
    if (s.left) {
      lw.hidden = false; barFill.parentElement.hidden = false;
      leftLab.textContent = s.leftLab;
      leftVal.textContent = fmt(Math.max(p - fee, 0)) + ' ₽';
    } else if (cur === 'newbuild' || cur === 'legal') {
      lw.hidden = true; barFill.parentElement.hidden = true;
    } else {
      lw.hidden = false; barFill.parentElement.hidden = false;
      leftLab.textContent = 'Доля услуги в цене объекта';
      leftVal.textContent = (share * 100).toFixed(1).replace('.', ',') + '%';
    }
    calcNote.textContent = s.note;
    calcGo.dataset.topic = s.topic;
  };
  $$('.chip').forEach(c => c.addEventListener('click', () => {
    cur = c.dataset.k;
    $$('.chip').forEach(o => { const on = o === c; o.classList.toggle('is-on', on); o.setAttribute('aria-checked', String(on)); });
    $('#priceLab').textContent = S[cur].lab;
    calc();
  }));
  range.addEventListener('input', () => { num.value = range.value; calc(); });
  num.addEventListener('input', () => { const v = parseFloat(String(num.value).replace(',', '.')); if (v >= 3 && v <= 60) range.value = v; calc(); });
  calc();

  // ===== form =====
  const topicMap = {
    sale: 'Продать квартиру', alt: 'Продать и купить (альтернатива)', second: 'Купить на вторичном рынке',
    newbuild: 'Купить новостройку', invest: 'Инвестиции в недвижимость', legal: 'Проверить объект и сделку'
  };
  const fTopic = $('#f-topic'), ownerWrap = $('#fOwnerWrap'), budgetWrap = $('#fBudgetWrap');
  const syncTopic = () => {
    const v = fTopic.value;
    const sell = v === 'Продать квартиру' || v === 'Продать и купить (альтернатива)';
    const buy = v === 'Продать и купить (альтернатива)' || v === 'Купить на вторичном рынке' || v === 'Купить новостройку' || v === 'Инвестиции в недвижимость';
    ownerWrap.hidden = !sell;
    budgetWrap.hidden = !buy;
  };
  function setTopic(k) {
    if (k && topicMap[k]) { fTopic.value = topicMap[k]; syncTopic(); }
  }
  fTopic.addEventListener('change', syncTopic);
  syncTopic();

  const form = $('#leadForm'), st = $('#formSt');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = {};
    fd.forEach((v, k) => { payload[k] = v; });
    if (payload._gotcha) return;
    $$('.f', form).forEach(f => f.classList.remove('err'));
    const bad = [];
    if (!String(payload.name || '').trim()) bad.push('#f-name');
    if (!String(payload.phone || '').trim()) bad.push('#f-phone');
    if (bad.length) { bad.forEach(s => $(s).closest('.f').classList.add('err')); st.textContent = 'Укажите имя и контакт для связи.'; $(bad[0]).focus(); return; }
    if (!$('#f-agree').checked) { st.textContent = 'Нужно согласие на обработку данных.'; return; }
    if (ownerWrap.hidden) delete payload.owner;
    if (budgetWrap.hidden) delete payload.budget;
    const s = S[cur];
    payload.calc = s.what + ': ' + feeVal.textContent + ' ₽ при цене ' + num.value + ' млн ₽';
    const btn = $('button[type="submit"]', form);
    const orig = btn.textContent;
    btn.disabled = true; btn.textContent = 'Отправляем';
    try {
      const resp = await fetch(LEAD_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      st.textContent = 'Заявка отправлена. Свяжусь с вами в ближайшее время.';
      form.reset(); syncTopic();
    } catch (err) {
      console.error(err);
      st.textContent = 'Не отправилось. Попробуйте ещё раз или повторите позже.';
    } finally {
      setTimeout(() => { btn.disabled = false; btn.textContent = orig; }, 2500);
    }
  });
})();
