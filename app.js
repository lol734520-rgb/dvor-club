(() => {
  'use strict';
  const themeButton = document.querySelector('.theme-toggle');
  const updateThemeLabel = () => {
    const dark = document.documentElement.dataset.theme === 'dark';
    themeButton.setAttribute('aria-label', dark ? 'Включить светлую тему' : 'Включить тёмную тему');
    themeButton.title = themeButton.getAttribute('aria-label');
  };
  updateThemeLabel();
  themeButton.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('dvor-theme', next); } catch {}
    updateThemeLabel();
  });
  const menu = document.querySelector('.menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const closeMenu = () => { mobileNav.hidden = true; menu.setAttribute('aria-expanded', 'false'); menu.textContent = 'Меню +'; };
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    mobileNav.hidden = !open;
    menu.setAttribute('aria-expanded', String(open));
    menu.textContent = open ? 'Закрыть ×' : 'Меню +';
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !mobileNav.hidden) { closeMenu(); menu.focus(); } });
  const desktop = matchMedia('(min-width:701px)');
  desktop.addEventListener('change', (e) => { if (e.matches) closeMenu(); });

  // Animation never controls content availability. Without GSAP, everything stays visible.
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const intro = document.querySelector('.hero-copy, .page-intro, .join-heading, .legal');
      if (intro) gsap.timeline({defaults:{duration:.75,ease:'power3.out'}})
        .from(intro.querySelectorAll(':scope > .eyebrow, :scope > h1, :scope > p:not(.eyebrow), :scope > .button'), {y:35, autoAlpha:0, stagger:.12});
      const art = document.querySelector('.hero-art');
      if (art) {
        gsap.from(art, {y:25, autoAlpha:0, duration:1, ease:'power3.out', delay:.2});
        gsap.to(art.querySelector('img'), {scale:1.06,ease:'none',scrollTrigger:{trigger:art,start:'top 15%',end:'bottom top',scrub:1}});
      }
      gsap.utils.toArray('.reveal').forEach(el => gsap.from(el,{y:32,autoAlpha:0,duration:.7,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 90%',once:true}}));
    });
    window.addEventListener('pagehide', () => mm.revert(), {once:true});
  }

  const filterButtons = [...document.querySelectorAll('[data-filter]')];
  filterButtons.forEach(button => button.addEventListener('click', () => {
    filterButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    const kind = button.dataset.filter;
    let count = 0;
    document.querySelectorAll('[data-kind]').forEach(item => {
      item.hidden = kind !== 'all' && item.dataset.kind !== kind;
      if (!item.hidden) count++;
    });
    document.getElementById('filter-status').textContent = `Показано движей: ${count}`;
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }));

  const form = document.getElementById('join-form');
  if (!form) return;
  const endpoint = window.DVOR_CONFIG?.applicationEndpoint || '';
  const status = document.getElementById('form-status');
  const submit = form.querySelector('[type=submit]');
  const notice = document.getElementById('form-notice');
  const fields = ['nickname','telegram','interest','message'];
  const draftKey = 'dvor-application-draft';
  const showStatus = (text, state='info') => { status.textContent=text; status.dataset.state=state; status.focus({preventScroll:true}); };
  if (endpoint) {
    notice.querySelector('strong').textContent = 'Заявки открыты.';
    notice.querySelector('p').textContent = 'Организатор получит заявку и сможет связаться с тобой в Telegram.';
    submit.firstChild.textContent = 'Отправить заявку ';
  }
  try {
    const draft = JSON.parse(localStorage.getItem(draftKey) || 'null');
    if (draft && typeof draft === 'object') fields.forEach(name => { if (typeof draft[name] === 'string') form.elements[name].value = draft[name].slice(0,name==='message'?600:40); });
  } catch {}
  const interest = new URLSearchParams(location.search).get('interest');
  if (['online','street','creative','all'].includes(interest)) form.elements.interest.value = interest;
  const count = document.getElementById('message-count');
  count.textContent = form.elements.message.value.length;
  form.elements.message.addEventListener('input', () => { count.textContent=form.elements.message.value.length; });
  document.getElementById('clear-draft').addEventListener('click', () => {
    try { localStorage.removeItem(draftKey); } catch {}
    form.reset(); count.textContent='0'; showStatus('Черновик удалён.');
  });
  form.addEventListener('submit', async e => {
    e.preventDefault();
    form.elements.telegram.value = form.elements.telegram.value.trim();
    form.elements.nickname.value = form.elements.nickname.value.trim();
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(fields.map(name => [name,form.elements[name].value.trim()]));
    data.consent = form.elements.consent.checked;
    data.website = form.elements.website.value;
    if (!endpoint) {
      try { localStorage.setItem(draftKey, JSON.stringify(data)); showStatus('Черновик сохранён на этом устройстве. Заявка организатору не отправлена.'); }
      catch { showStatus('Браузер не разрешил сохранить черновик. Скопируй текст заявки вручную.', 'error'); }
      return;
    }
    submit.disabled=true; submit.firstChild.textContent='Отправляем... ';
    status.textContent='';
    try {
      const response = await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:AbortSignal.timeout(15000)});
      const result = await response.json();
      if (!response.ok || result.ok !== true) throw new Error('delivery');
      try { localStorage.removeItem(draftKey); } catch {}
      form.reset(); count.textContent='0';
      showStatus('Заявка доставлена. Увидимся в ДВОРЕ!');
    } catch { showStatus('Не удалось отправить заявку. Твои поля сохранены в форме. Попробуй позже.', 'error'); }
    finally { submit.disabled=false; submit.firstChild.textContent='Отправить заявку '; }
  });
})();
