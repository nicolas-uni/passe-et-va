/* ============================================================
   PASSE & VA — interactions
   ============================================================ */
(function(){
  "use strict";
  const $  = (s,c=document)=>c.querySelector(s);
  const $$ = (s,c=document)=>[...c.querySelectorAll(s)];
  const nav = $('#nav');

  /* ---------- NAV : scroll + thème sous la nav ---------- */
  function themeAtNav(){
    const y = nav.offsetHeight*0.5 + 4;
    const els = document.elementsFromPoint(window.innerWidth/2, y);
    for(const el of els){
      if(nav.contains(el)) continue;
      const t = el.closest('[data-theme]');
      if(t) return t.dataset.theme;
    }
    return 'cream';
  }
  function onScroll(){
    nav.classList.toggle('scrolled', window.scrollY > 30);
    nav.classList.toggle('over-dark', themeAtNav()==='dark');
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', onScroll);

  /* ---------- REVEAL au scroll ---------- */
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, {threshold:0.14, rootMargin:'0px 0px -8% 0px'});
  $$('.reveal').forEach(el=>io.observe(el));

  /* ---------- HERO : switcher ---------- */
  const variants = $$('.hero-variant');
  const switchBtns = $$('#heroSwitch button');
  function activateHero(i){
    variants.forEach((v,k)=>v.classList.toggle('active', k===i));
    switchBtns.forEach((b,k)=>b.classList.toggle('on', k===i));
    // relancer l'anim d'entrée de la variante active
    const v = variants[i];
    v.classList.remove('go');
    void v.offsetWidth;
    requestAnimationFrame(()=>v.classList.add('go'));
    localStorage.setItem('pv_hero', i);
    onScroll();
  }
  switchBtns.forEach(b=>b.addEventListener('click', ()=>activateHero(+b.dataset.h)));
  const saved = +(localStorage.getItem('pv_hero')||0);

  /* ---------- HERO V1 : mot rotatif + point qui flotte ---------- */
  const words = ['image','marque','histoire','présence'];
  let wi = 0;
  const rot = $('#rot1');
  setInterval(()=>{
    if(!$('.hv1.active')) return;
    wi = (wi+1)%words.length;
    rot.style.transition='transform .45s cubic-bezier(.22,1,.36,1),opacity .45s';
    rot.style.transform='translateY(-20px)';rot.style.opacity='0';
    setTimeout(()=>{rot.textContent=words[wi];rot.style.transform='translateY(20px)';
      requestAnimationFrame(()=>{rot.style.transform='none';rot.style.opacity='1';});},460);
  }, 2400);
  // point rouge réactif à la souris
  const fdot = $('#fdot');
  window.addEventListener('mousemove',(e)=>{
    if(!fdot || !$('.hv1.active')) return;
    const x=(e.clientX/window.innerWidth-0.5), y=(e.clientY/window.innerHeight-0.5);
    fdot.style.transform=`translate(${x*60}px,${y*60}px)`;
  });

  /* ---------- HERO V3 : grille animée ---------- */
  const bg = $('#hv3bg');
  if(bg){
    const cols=4, perCol=6;
    for(let c=0;c<cols;c++){
      const col=document.createElement('div'); col.className='hv3__col';
      const set=document.createDocumentFragment();
      for(let i=0;i<perCol;i++){
        const ph=document.createElement('div'); ph.className='ph';
        ph.style.backgroundImage=`url('https://picsum.photos/seed/g${c}${i}/500/650')`;
        set.appendChild(ph);
      }
      col.appendChild(set);
      col.appendChild(set.cloneNode(true)); // boucle continue
      bg.appendChild(col);
    }
  }

  /* ---------- CLIENTS : marquees ---------- */
  const clients=['Maison Lutz','Atelier Bär','Café Munster','Domaine Riehl','Studio Klein','Boulangerie Schmitt','Garage Weber','Fleurs & Co','Vélo Sélestat','Brasserie Kléber'];
  function fill(id, mark){
    const row=$('#'+id); if(!row) return;
    clients.forEach(n=>{
      const a=document.createElement('span'); a.className='cl-logo';
      a.innerHTML = (mark?'<span class="mk">●</span> ':'')+n;
      row.appendChild(a);
    });
  }
  fill('mq1',true);fill('mq1b',true);fill('mq2',false);fill('mq2b',false);

  /* ---------- COMPTEURS ---------- */
  const counters=$$('[data-count]');
  const cio=new IntersectionObserver((es)=>{
    es.forEach(e=>{
      if(!e.isIntersecting) return; cio.unobserve(e.target);
      const el=e.target, end=+el.dataset.count; const dur=1400; const t0=performance.now();
      (function tick(now){
        const p=Math.min(1,(now-t0)/dur), v=Math.round(end*(1-Math.pow(1-p,3)));
        el.textContent=v; if(p<1) requestAnimationFrame(tick);
      })(t0);
    });
  },{threshold:.6});
  counters.forEach(c=>cio.observe(c));

  /* ---------- PORTFOLIO : filtres ---------- */
  const fbtns=$$('.pf-filter button'), cards=$$('#pfGrid .pf');
  fbtns.forEach(b=>b.addEventListener('click',()=>{
    fbtns.forEach(x=>x.classList.remove('on')); b.classList.add('on');
    const f=b.dataset.f;
    cards.forEach(c=>{
      const show = f==='all'||c.dataset.cat===f;
      c.classList.toggle('hide',!show);
    });
  }));

  /* ---------- FORM ---------- */
  const form=$('#form');
  if(form){
    const mailRe=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    form.addEventListener('submit',(e)=>{
      e.preventDefault();
      let ok=true;
      const name=$('#f-name'), mail=$('#f-mail'), msg=$('#f-msg');
      [[name,name.value.trim().length>1],[mail,mailRe.test(mail.value)],[msg,msg.value.trim().length>2]]
        .forEach(([el,valid])=>{ el.parentElement.classList.toggle('err',!valid); if(!valid)ok=false; });
      if(ok){ form.querySelectorAll('input,textarea,select').forEach(i=>i.value=''); $('#formOk').classList.add('show'); }
    });
    $$('.field input,.field textarea').forEach(i=>i.addEventListener('input',()=>i.parentElement.classList.remove('err')));
  }

  /* ---------- BURGER (mobile) → vers contact ---------- */
  const burger=$('#burger');
  if(burger) burger.addEventListener('click',()=>{ location.hash='#contact'; });

  /* ---------- INIT ---------- */
  window.addEventListener('load', ()=>{ document.querySelector('.hv1').classList.add('go'); });
  activateHero(saved);
  onScroll();
})();
