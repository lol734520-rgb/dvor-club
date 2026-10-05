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

  // Native scrolling, GSAP choreography. All content works without animation.
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    const veil = document.createElement('div');
    veil.className = 'page-veil'; veil.setAttribute('aria-hidden', 'true');
    veil.innerHTML = '<span>ДВОР</span>'; document.body.append(veil);
    mm.add({motion:'(prefers-reduced-motion: no-preference)', desktop:'(min-width:701px)', pointer:'(hover:hover) and (pointer:fine)'}, context => {
      if (!context.conditions.motion) return;
      const cleanups = [];
      const intro = document.querySelector('.hero-copy, .page-intro, .join-heading, .legal');
      const title = intro?.querySelector('h1');
      const tl = gsap.timeline({defaults:{duration:.8,ease:'expo.out'}});
      if (title) {
        const lines = title.querySelectorAll(':scope > span');
        if (intro.matches('.legal')) tl.from(title,{opacity:.7,duration:.2},0);
        else tl.from(lines.length ? lines : title, {y:40,autoAlpha:0,clipPath:'inset(100% 0 0 0)',stagger:.1}, .04);
      }
      if (intro) tl.from(intro.querySelectorAll(intro.matches('.legal') ? ':scope > .eyebrow' : ':scope > .eyebrow, :scope > p:not(.eyebrow), :scope > .button'), {y:22,autoAlpha:0,stagger:.1,duration:.8}, .28);
      const hero = document.querySelector('.hero');
      const art = document.querySelector('.hero-art');
      if (art) {
        tl.from(art, {clipPath:'inset(0 0 100% 0)',autoAlpha:0,rotation:-3,duration:.85}, .06);
        const artImage = art.querySelector('img');
        gsap.set(artImage,{scale:1.1,yPercent:-4});
        tl.from('.hero-stamp',{x:-20,y:10,scale:.85,rotation:-18,autoAlpha:0,duration:.55},.48);
        gsap.fromTo(artImage,{yPercent:-4,scale:1.1},{yPercent:6,scale:1.2,ease:'none',immediateRender:false,scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:1.2}});
        if (context.conditions.desktop) gsap.to('.hero-copy',{y:35,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:1}});
        if (context.conditions.pointer) {
          const rotateX=gsap.quickTo(art,'rotationX',{duration:.5,ease:'power3.out'});
          const rotateY=gsap.quickTo(art,'rotationY',{duration:.5,ease:'power3.out'});
          const stage=art.parentElement;
          let bounds;
          const enter=()=>{bounds=stage.getBoundingClientRect();};
          const move=e=>{if(!bounds)return;rotateY(((e.clientX-bounds.left)/bounds.width-.5)*5);rotateX(-((e.clientY-bounds.top)/bounds.height-.5)*5);};
          const leave=()=>{bounds=null;rotateX(0);rotateY(0);};
          stage.addEventListener('pointerenter',enter);stage.addEventListener('pointermove',move);stage.addEventListener('pointerleave',leave);
          cleanups.push(()=>{stage.removeEventListener('pointerenter',enter);stage.removeEventListener('pointermove',move);stage.removeEventListener('pointerleave',leave);});
        }
      }
      document.querySelectorAll('.reveal').forEach(el => {
        // Do not hide cards that can be revealed by a category filter.
        if (el.matches('.event-poster')) return;
        gsap.from(el,{y:20,autoAlpha:0,duration:.6,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 93%',once:true}});
      });
      document.querySelectorAll('.world-card').forEach(card => {
        gsap.from(card.querySelector('img'),{clipPath:'inset(0 0 100% 0)',scale:1.08,duration:.7,ease:'expo.out',scrollTrigger:{trigger:card,start:'top 93%',once:true}});
      });
      document.querySelectorAll('.feature-image img, .join-art img').forEach(img => {
        gsap.fromTo(img,{scale:1.12,yPercent:-3},{scale:1.02,yPercent:3,ease:'none',scrollTrigger:{trigger:img.parentElement,start:'top bottom',end:'bottom top',scrub:1.1}});
      });
      document.querySelectorAll('.closing h2, .rules > h2, .home-events > h2').forEach(el => {
        gsap.from(el,{clipPath:'inset(100% 0 0 0)',y:32,duration:1.05,ease:'power4.out',scrollTrigger:{trigger:el,start:'top 92%',once:true}});
      });
      const stripe = document.querySelector('.motion-strip-track');
      if (stripe) {
        const strip = stripe.parentElement;
        const groups = [...stripe.querySelectorAll('.motion-strip-group')];
        const fill = () => {
          while(groups[0].getBoundingClientRect().width < strip.clientWidth + 1) {
            groups[0].append(groups[0].firstElementChild.cloneNode(true));
          }
          if(groups[1].children.length !== groups[0].children.length) {
            groups[1].replaceChildren(...[...groups[0].children].map(node => node.cloneNode(true)));
          }
        };
        fill();
        const loop = gsap.to(stripe,{xPercent:-50,duration:groups[0].getBoundingClientRect().width/65,repeat:-1,ease:'none',paused:true});
        const resize = new ResizeObserver(() => {fill();loop.duration(groups[0].getBoundingClientRect().width/65);});
        resize.observe(strip);
        document.fonts.ready.then(() => {fill();loop.duration(groups[0].getBoundingClientRect().width/65);});
        let inView = false;
        const sync = () => {if(inView && !document.hidden) loop.play(); else loop.pause();};
        const observer = new IntersectionObserver(entries => {inView=entries[0].isIntersecting;sync();});
        observer.observe(strip);
        document.addEventListener('visibilitychange',sync);
        cleanups.push(() => {observer.disconnect();resize.disconnect();document.removeEventListener('visibilitychange',sync);});
      }
      if (context.conditions.pointer) document.querySelectorAll('.event-poster, .world-card, .event-teaser, .button').forEach(el => {
        const target = el.querySelector('img, b, svg.arrow, span[aria-hidden]');
        if (!target) return;
        const enter = context.add(null, () => gsap.to(target,el.matches('.event-poster, .world-card') ? {scale:1.035,duration:.45,ease:'power3.out',overwrite:'auto'} : {x:3,y:-3,duration:.2,overwrite:'auto'}));
        const leave = context.add(null, () => gsap.to(target,{scale:1,x:0,y:0,duration:.45,overwrite:'auto'}));
        el.addEventListener('pointerenter',enter); el.addEventListener('pointerleave',leave);
        cleanups.push(() => {el.removeEventListener('pointerenter',enter);el.removeEventListener('pointerleave',leave);});
      });
      const navigate = context.add(null, e => {
        const link = e.target.closest('a[href]');
        if (!link || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || link.target || link.hasAttribute('download')) return;
        const url = new URL(link.href,location.href);
        if (url.origin !== location.origin || !url.pathname.endsWith('.html') || (url.pathname === location.pathname && url.search === location.search)) return;
        e.preventDefault();
        gsap.fromTo(veil,{yPercent:100},{yPercent:0,duration:.26,ease:'power3.inOut',overwrite:true,onComplete:() => location.assign(url.href)});
      });
      document.addEventListener('click',navigate);
      cleanups.push(() => document.removeEventListener('click',navigate));
      return () => {cleanups.forEach(fn => fn()); gsap.set(veil,{clearProps:'all'});};
    });
    // Restore the overlay when the browser returns a page from its back/forward cache.
    window.addEventListener('pageshow', e => {if (e.persisted) {gsap.set(veil,{clearProps:'all'}); ScrollTrigger.refresh();}});
    document.fonts.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener('load', () => ScrollTrigger.refresh(), {once:true});
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
    if (window.gsap && matchMedia('(prefers-reduced-motion: no-preference)').matches) {
      const visible = [...document.querySelectorAll('[data-kind]')].filter(item => !item.hidden);
      gsap.killTweensOf(visible);
      gsap.fromTo(visible,{opacity:.6,y:8},{opacity:1,y:0,duration:.25,stagger:.035,ease:'power2.out',clearProps:'opacity,transform'});
    }
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }));

  const form = document.getElementById('join-form');
  if (!form) return;
  const config = window.DVOR_CONFIG || {};
  const endpoint = config.applicationsEnabled === true && config.legalReady === true && config.consentVersion && !config.consentVersion.startsWith('draft') ? config.applicationEndpoint || '' : '';
  const consentRow = document.getElementById('consent-row');
  consentRow.hidden = !endpoint;
  form.elements.consent.required = Boolean(endpoint);
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
    if (endpoint) data.consentVersion = config.consentVersion;
    data.website = form.elements.website.value;
    if (!endpoint) {
      try { localStorage.setItem(draftKey, JSON.stringify(Object.fromEntries(fields.map(name => [name,data[name]])))); showStatus('Черновик сохранён на этом устройстве. Заявка организатору не отправлена.'); }
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


