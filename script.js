const menu=document.querySelector('.menu');const nav=document.querySelector('.site-header nav');menu?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));const yearLabel=document.getElementById('year');if(yearLabel)yearLabel.textContent=new Date().getFullYear();
const topBar=document.querySelector('.top-bar');const siteHeader=document.querySelector('.site-header');function sizeFirstScreen(){const chromeHeight=(topBar?.getBoundingClientRect().height||0)+(siteHeader?.getBoundingClientRect().height||0);document.documentElement.style.setProperty('--site-chrome-height',`${chromeHeight}px`);}sizeFirstScreen();if('ResizeObserver' in window){const chromeObserver=new ResizeObserver(sizeFirstScreen);if(topBar)chromeObserver.observe(topBar);if(siteHeader)chromeObserver.observe(siteHeader);}window.addEventListener('resize',sizeFirstScreen);

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
  },4000);
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
