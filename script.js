const menu=document.querySelector('.menu');const nav=document.querySelector('.site-header nav');menu?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));const yearLabel=document.getElementById('year');if(yearLabel)yearLabel.textContent=new Date().getFullYear();
const topBar=document.querySelector('.top-bar');const siteHeader=document.querySelector('.site-header');const bookAnnouncement=document.querySelector('.book-announcement');function sizeFirstScreen(){const chromeHeight=(topBar?.getBoundingClientRect().height||0)+(siteHeader?.getBoundingClientRect().height||0)+(bookAnnouncement?.getBoundingClientRect().height||0);document.documentElement.style.setProperty('--site-chrome-height',`${chromeHeight}px`);}sizeFirstScreen();if('ResizeObserver' in window){const chromeObserver=new ResizeObserver(sizeFirstScreen);if(topBar)chromeObserver.observe(topBar);if(siteHeader)chromeObserver.observe(siteHeader);if(bookAnnouncement)chromeObserver.observe(bookAnnouncement);}window.addEventListener('resize',sizeFirstScreen);

(() => {
 const gallery=document.querySelector('.photo-carousel');
 if(!gallery)return;
 const track=gallery.querySelector('.carousel-track');
 const toggle=gallery.querySelector('.carousel-toggle');
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 let paused=false,timer=null,autoDirection=1;
 function move(direction){
  const step=track.querySelector('figure').getBoundingClientRect().width;
  const max=track.scrollWidth-track.clientWidth;
  let target=track.scrollLeft+direction*step;
  if(target>max+2)target=0;
  if(target< -2)target=max;
  track.scrollTo({left:Math.max(0,Math.min(max,target)),behavior:reduced.matches?'instant':'smooth'});
 }
 function schedule(){
  clearInterval(timer);
  if(!paused&&!document.hidden)timer=setInterval(()=>{
   const max=track.scrollWidth-track.clientWidth;
   if(track.scrollLeft>=max-2)autoDirection=-1;
   else if(track.scrollLeft<=2)autoDirection=1;
   move(autoDirection);
  },2000);
 }
 function label(){toggle.textContent=paused?'Play':'Pause';toggle.setAttribute('aria-label',paused?'Start photo rotation':'Pause photo rotation');toggle.setAttribute('aria-pressed',String(paused));}
 toggle.addEventListener('click',()=>{paused=!paused;label();schedule();});
 gallery.querySelector('.carousel-prev').addEventListener('click',()=>{move(-1);schedule();});
 gallery.querySelector('.carousel-next').addEventListener('click',()=>{move(1);schedule();});
 track.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();move(event.key==='ArrowLeft'?-1:1);}});
 track.addEventListener('touchstart',()=>{clearInterval(timer);},{passive:true});
 track.addEventListener('touchend',schedule,{passive:true});
 document.addEventListener('visibilitychange',schedule);
 reduced.addEventListener('change',schedule);
 label();schedule();
})();


// Replay portrait entrances when the bottom of each section is reached.
(() => {
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
 const portraits=[...document.querySelectorAll('.author-profile-portrait,.media-portrait')].map(portrait=>{
  portrait.classList.remove('portrait-motion-ready','portrait-visible');
  portrait.style.opacity='0';
  return {portrait,section:portrait.closest('section'),played:false,animation:null};
 });
 let scheduled=false;
 function reset(state){
  if(state.animation){state.animation.cancel();state.animation=null;}
  state.played=false;
  state.portrait.style.opacity='0';
  state.portrait.style.transform='none';
 }
 function reveal(state){
  state.played=true;
  state.portrait.style.opacity='1';
  state.portrait.style.transform='none';
  if(typeof state.portrait.animate!=='function') return;
  const entrance=state.portrait.animate([
   {opacity:0,transform:'translateX(-120px)'},
   {opacity:1,transform:'translateX(0px)'}
  ],{duration:5000,easing:'cubic-bezier(.22,1,.36,1)',fill:'both',iterations:1});
  state.animation=entrance;
  entrance.onfinish=()=>{
   state.portrait.style.opacity='1';
   state.portrait.style.transform='none';
   entrance.cancel();
   state.animation=null;
  };
 }
 function check(){
  scheduled=false;
  portraits.forEach(state=>{
   const rect=state.section.getBoundingClientRect();
   const inView=rect.bottom>0 && rect.top<window.innerHeight;
   if(!inView){if(state.played)reset(state);return;}
   if(!state.played && rect.bottom<=window.innerHeight+2)reveal(state);
  });
 }
 function queue(){if(!scheduled){scheduled=true;requestAnimationFrame(check);}}
 window.addEventListener('scroll',queue,{passive:true});
 window.addEventListener('resize',queue);
 window.addEventListener('pageshow',queue);
 queue();
})();
