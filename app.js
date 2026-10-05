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
    if (window.Flip) gsap.registerPlugin(Flip);
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
        const background = art.querySelector('.hero-background');
        const foreground = art.querySelector('.hero-foreground');
        gsap.fromTo(background,{scale:1.08,yPercent:-2},{scale:1.16,yPercent:4,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:1.2}});
        gsap.fromTo(foreground,{scale:1.02,yPercent:0},{scale:1.08,yPercent:9,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:1}});
        tl.from('.hero-stamp',{x:-20,y:10,scale:.85,rotation:-18,autoAlpha:0,duration:.55},.48);
        if (context.conditions.desktop) gsap.to('.hero-copy',{y:35,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:1}});
        if (context.conditions.pointer) {
          const rotateX=gsap.quickTo(art,'rotationX',{duration:.5,ease:'power3.out'});
          const rotateY=gsap.quickTo(art,'rotationY',{duration:.5,ease:'power3.out'});
          const stage=art.parentElement;
          const shiftX=gsap.quickTo(foreground,'x',{duration:.7,ease:'power3.out'});
          const shiftY=gsap.quickTo(foreground,'y',{duration:.7,ease:'power3.out'});
          let bounds;
          const enter=()=>{bounds=stage.getBoundingClientRect();};
          const move=e=>{if(!bounds)return;rotateY(((e.clientX-bounds.left)/bounds.width-.5)*5);rotateX(-((e.clientY-bounds.top)/bounds.height-.5)*5);shiftX(((e.clientX-bounds.left)/bounds.width-.5)*12);shiftY(((e.clientY-bounds.top)/bounds.height-.5)*8);};
          const leave=()=>{bounds=null;rotateX(0);rotateY(0);shiftX(0);shiftY(0);};
          stage.addEventListener('pointerenter',enter);stage.addEventListener('pointermove',move);stage.addEventListener('pointerleave',leave);
          cleanups.push(()=>{stage.removeEventListener('pointerenter',enter);stage.removeEventListener('pointermove',move);stage.removeEventListener('pointerleave',leave);});
        }
      }
      const portal=document.querySelector('.portal-section');
      if(portal){
        const sequence=gsap.timeline({scrollTrigger:{trigger:portal,start:context.conditions.desktop?'top top':'top 65%',end:context.conditions.desktop?'+=650':'bottom 30%',pin:context.conditions.desktop,scrub:.8,anticipatePin:1}});
        sequence.set('.portal-screen',{autoAlpha:1})
          .fromTo('.portal-screen img',{scale:1},{scale:3.6,transformOrigin:'30% 34%',ease:'power2.inOut',duration:1})
          .to('.portal-screen',{autoAlpha:0,duration:.35},.65)
          .fromTo('.portal-court',{scale:1.16},{scale:1,ease:'power2.out',duration:.65},.65)
          .from('.portal-label',{y:18,autoAlpha:0,duration:.3},1);
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
  const cards = [...document.querySelectorAll('[data-kind]')];
  let filtering;
  filterButtons.forEach(button => button.addEventListener('click', () => {
    if(button.getAttribute('aria-pressed')==='true') return;
    const animate=window.gsap && window.Flip && matchMedia('(prefers-reduced-motion: no-preference)').matches;
    if(filtering) filtering.progress(1);
    const state=animate ? Flip.getState(cards) : null;
    filterButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    const kind = button.dataset.filter;
    cards.forEach(item => {item.hidden = kind !== 'all' && item.dataset.kind !== kind; item.inert=item.hidden;});
    document.getElementById('filter-status').textContent = `Показано движей: ${cards.filter(item=>!item.hidden).length}`;
    if(animate){
      filtering=Flip.from(state,{duration:.55,ease:'power3.inOut',scale:true,absolute:true,
        onEnter:elements=>gsap.fromTo(elements,{autoAlpha:0,scale:.94},{autoAlpha:1,scale:1,duration:.35,clearProps:'opacity,visibility,transform'}),
        onLeave:elements=>gsap.to(elements,{autoAlpha:0,scale:.94,duration:.25}),
        onComplete:()=>{gsap.set(cards,{clearProps:'opacity,visibility,transform'});ScrollTrigger.refresh();}
      });
    } else if(window.ScrollTrigger) ScrollTrigger.refresh();
  }));

  const canMove=()=>window.gsap && matchMedia('(prefers-reduced-motion: no-preference)').matches;
  document.querySelectorAll('.wordmark').forEach(logo=>{
    const letters=logo.querySelectorAll('.logo-letter');
    const scatter=()=>{if(canMove())gsap.to(letters,{y:i=>[0,-3,3,-2][i],rotation:i=>[-4,3,-2,4][i],duration:.3,stagger:.025,overwrite:true});};
    const assemble=()=>{if(window.gsap)gsap.to(letters,{y:0,rotation:0,duration:canMove()?.35:0,stagger:.025,overwrite:true});};
    logo.addEventListener('pointerenter',scatter);logo.addEventListener('pointerleave',assemble);
    logo.addEventListener('focus',scatter);logo.addEventListener('blur',assemble);
    logo.addEventListener('click',e=>{assemble();if(new URL(logo.href).pathname===location.pathname)e.preventDefault();});
  });

  const vibes={
    online:{image:'coop.webp',alt:'Геймпады и ретро-монитор во дворе',title:'НАЙДИ СВОЮ ТИМУ.',copy:'Кооп, инди и кастомки. Можно без опыта и высокого ранга. Главное, чтобы вместе было интересно.',link:'events.html#lan',cta:'Посмотреть кооп'},
    street:{image:'street.webp',alt:'Скейтборд и баскетбольное кольцо на бетонной площадке',title:'ВСТРЕТИМСЯ ВНЕ ЭКРАНА.',copy:'Скейт, площадка и разговоры до темноты. Приходи кататься, учиться или просто быть рядом.',link:'events.html#street',cta:'Посмотреть уличные движи'},
    creative:{image:'creative.webp',alt:'Бумага, стикеры и инструменты для создания зина',title:'СОБЕРИ ЧТО-НИБУДЬ СВОЁ.',copy:'Постер, короткий ролик или стикерпак. Можно начать с одной странной идеи и найти тех, кто поможет.',link:'events.html#remix',cta:'Посмотреть креатив'}
  };
  const vibePanel=document.querySelector('.vibe-panel');
  if(vibePanel){
    const buttons=[...document.querySelectorAll('[data-vibe]')];
    const content=vibePanel.querySelector('.vibe-copy');
    const image=vibePanel.querySelector('img');
    buttons.forEach(button=>button.addEventListener('click',()=>{
      if(button.getAttribute('aria-pressed')==='true')return;
      const data=vibes[button.dataset.vibe];
      buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
      vibePanel.dataset.vibe=button.dataset.vibe;
      image.src=data.image;image.alt=data.alt;
      content.querySelector('h3').textContent=data.title;
      content.querySelector('p').textContent=data.copy;
      const link=content.querySelector('a');link.href=data.link;link.textContent=data.cta+' ↗';
      if(canMove()){
        gsap.fromTo(image,{clipPath:'inset(0 0 100% 0)'},{clipPath:'inset(0 0 0% 0)',duration:.5,ease:'power3.out',overwrite:true});
        gsap.fromTo(content,{opacity:.5,y:8},{opacity:1,y:0,duration:.35,overwrite:true,clearProps:'opacity,transform'});
      }
      if(window.ScrollTrigger)ScrollTrigger.refresh();
    }));
    Object.values(vibes).forEach(data=>{const preload=new Image();preload.src=data.image;});
  }

  const stickers=[...document.querySelectorAll('.drag-sticker')];
  const reset=document.querySelector('.sticker-reset');
  stickers.forEach(sticker=>{
    let drag=null,x=0,y=0;
    const paint=()=>{sticker.style.translate=`${x}px ${y}px`;};
    const constrain=(nextX,nextY)=>{
      const stage=sticker.parentElement.getBoundingClientRect();
      const rect=sticker.getBoundingClientRect();
      const left=rect.left-stage.left-x,top=rect.top-stage.top-y;
      x=Math.max(-left,Math.min(stage.width-left-rect.width,nextX));
      y=Math.max(-top,Math.min(stage.height-top-rect.height,nextY));paint();
    };
    sticker.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={id:e.pointerId,startX:e.clientX,startY:e.clientY,x,y};sticker.setPointerCapture(e.pointerId);sticker.classList.add('dragging');});
    sticker.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;constrain(drag.x+e.clientX-drag.startX,drag.y+e.clientY-drag.startY);});
    const finish=()=>{drag=null;sticker.classList.remove('dragging');};
    sticker.addEventListener('pointerup',finish);sticker.addEventListener('pointercancel',finish);sticker.addEventListener('lostpointercapture',finish);
    sticker.addEventListener('keydown',e=>{const shifts={ArrowLeft:[-10,0],ArrowRight:[10,0],ArrowUp:[0,-10],ArrowDown:[0,10]};if(shifts[e.key]){e.preventDefault();constrain(x+shifts[e.key][0],y+shifts[e.key][1]);}});
    const restore=()=>{x=0;y=0;paint();finish();};reset?.addEventListener('click',restore);window.addEventListener('resize',restore);
  });

  const dialog=document.querySelector('.event-dialog');
  if(dialog){
    let opener=null,animation=null;
    const sheet=dialog.querySelector('.event-sheet');
    const close=()=>{
      animation?.kill();
      if(!dialog.open)return;
      const finish=()=>{dialog.close();document.body.classList.remove('dialog-open');sheet.style.cssText='';opener?.focus({preventScroll:true});};
      if(canMove()){const a=opener.closest('.event-poster').getBoundingClientRect(),b=sheet.getBoundingClientRect();animation=gsap.to(sheet,{x:a.left+a.width/2-b.left-b.width/2,y:a.top+a.height/2-b.top-b.height/2,scale:Math.min(.9,a.width/b.width),opacity:0,duration:.25,ease:'power2.inOut',onComplete:finish});}else finish();
    };
    document.querySelectorAll('[data-event-details]').forEach(button=>button.addEventListener('click',()=>{
      const card=button.closest('.event-poster');opener=button;animation?.kill();
      dialog.querySelector('h2').textContent=card.querySelector('h2').innerText.replace(/\s+/g,' ').trim();
      dialog.querySelector('.dialog-description').textContent=card.querySelector('.poster-copy p').textContent;
      dialog.querySelector('.dialog-format').textContent=card.dataset.kind==='online'?'Онлайн, без требований к рангу':card.dataset.kind==='street'?'На площадке, без соревнований':'Вместе создаём постеры, видео и стикеры';
      dialog.querySelector('.dialog-for').textContent=card.dataset.kind==='street'?'Для тех, кто катается, учится или хочет познакомиться':card.dataset.kind==='creative'?'Для новичков и тех, у кого уже есть своя идея':'Для новичков и опытных игроков, которым важна компания';
      const art=dialog.querySelector('.dialog-art');const source=card.querySelector('img');
      art.hidden=!source;if(source){art.src=source.src;art.alt=source.alt;}
      dialog.querySelector('.dialog-join').href=card.querySelector('.text-link').href;
      dialog.showModal();document.body.classList.add('dialog-open');
      const a=card.getBoundingClientRect(),b=sheet.getBoundingClientRect();
      if(canMove())animation=gsap.fromTo(sheet,{x:a.left+a.width/2-b.left-b.width/2,y:a.top+a.height/2-b.top-b.height/2,scale:Math.min(.9,a.width/b.width),opacity:.5},{x:0,y:0,scale:1,opacity:1,duration:.45,ease:'power3.out',clearProps:'transform,opacity'});
    }));
    dialog.querySelector('.dialog-close').addEventListener('click',close);
    dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
    dialog.addEventListener('click',e=>{if(e.target===dialog)close();});
  }

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


