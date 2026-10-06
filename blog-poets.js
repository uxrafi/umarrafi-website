/* Shared progressive enhancement for the four poet collections. */
(()=>{
 const article=document.querySelector('article.pin-poets');
 if(!article)return;
 const sections=[...article.querySelectorAll('section.poet')];
 const buttons=[...article.querySelectorAll('.poet-choice')];
 const all=article.querySelector('.poet-read-all');
 if(!sections.length||!buttons.length)return;
 article.classList.add('poet-picker-ready');
 const choices=buttons[0].parentElement;
 choices.id='poet-choices';
 let previous=null;
 const motion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
 function show(id,scroll){
  dispatchEvent(new Event('poet-selection-change'));
  const readAll=id==='all';
  sections.forEach(s=>s.hidden=!readAll&&s.getAttribute('aria-labelledby')!==id);
  buttons.forEach(b=>b.setAttribute('aria-expanded',String(readAll||b.dataset.poet===id)));
  if(all)all.setAttribute('aria-pressed',String(readAll));
  if(id&&id!=='all')previous=id;
  if(scroll){
   const selected=sections.find(s=>!s.hidden);
   if(selected){
    const heading=selected.querySelector('h2');
    if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}
    selected.scrollIntoView({behavior:motion(),block:'start'});
   }else{
    const button=buttons.find(b=>b.dataset.poet===previous)||buttons[0];
    button.focus({preventScroll:true});
    choices.scrollIntoView({behavior:motion(),block:'end'});
   }
  }
 }
 function navigate(id){
  const hash=id==='all'?'all-poets':id;
  const url=location.pathname+location.search+(hash?'#'+hash:'');
  if(url!==location.pathname+location.search+location.hash)history.pushState(null,'',url);
  show(id,true);
 }
 buttons.forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.poet)));
 if(all)all.addEventListener('click',()=>navigate('all'));
 sections.forEach(s=>{
  const p=document.createElement('p');p.className='poet-return';
  const a=document.createElement('a');a.href='#poet-choices';a.textContent='Choose another poet ↑';
  a.addEventListener('click',e=>{e.preventDefault();navigate(null)});
  p.append(a);s.append(p);
 });
 function fromHash(scroll){
  const h=location.hash.slice(1);
  if(h==='all-poets'){show('all',scroll);return;}
  const target=document.getElementById(h);
  const section=target&&target.closest('section.poet');
  show(section?section.getAttribute('aria-labelledby'):null,scroll);
 }
 fromHash(false);
 addEventListener('popstate',()=>fromHash(true));
 addEventListener('hashchange',()=>fromHash(true));
})();
