const menu=document.querySelector('.menu');const nav=document.querySelector('.site-header nav');menu?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));const yearLabel=document.getElementById('year');if(yearLabel)yearLabel.textContent=new Date().getFullYear();
const topBar=document.querySelector('.top-bar');const siteHeader=document.querySelector('.site-header');const bookAnnouncements=[...document.querySelectorAll('.book-announcement')];function sizeFirstScreen(){document.documentElement.style.setProperty('--quote-strip-height',`${topBar?.getBoundingClientRect().height||44}px`);const chromeHeight=(topBar?.getBoundingClientRect().height||0)+(siteHeader?.getBoundingClientRect().height||0)+bookAnnouncements.reduce((sum,bar)=>sum+bar.getBoundingClientRect().height,0);document.documentElement.style.setProperty('--site-chrome-height',`${chromeHeight}px`);}sizeFirstScreen();if('ResizeObserver' in window){const chromeObserver=new ResizeObserver(sizeFirstScreen);if(topBar)chromeObserver.observe(topBar);if(siteHeader)chromeObserver.observe(siteHeader);bookAnnouncements.forEach(bar=>chromeObserver.observe(bar));}window.addEventListener('resize',sizeFirstScreen);

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


// Replay five-second entrances for portraits and book artwork across the site.
(() => {
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 const selector='.author-profile-portrait,.media-portrait,.about-bio-portrait,.book-detail-cover img,.landing-cover img,.landing-author>img';
 const states=[...document.querySelectorAll(selector)].map(image=>({
  image,
  section:image.matches('.author-profile-portrait,.media-portrait')?image.closest('section'):null,
  scroller:image.closest('.about-article'),
  played:false,
  animation:null
 }));
 let scheduled=false;
 function reset(state){
  state.animation?.cancel();
  state.animation=null;
  state.played=false;
  state.image.style.opacity=reduced.matches?'1':'0';
  state.image.style.translate='none';
 }
 function reveal(state){
  state.played=true;
  state.image.style.opacity='1';
  state.image.style.translate='none';
  if(reduced.matches||typeof state.image.animate!=='function')return;
  const entrance=state.image.animate([
   {opacity:0,translate:'-120px 0'},
   {opacity:1,translate:'0px 0'}
  ],{duration:5000,easing:'cubic-bezier(.22,1,.36,1)',fill:'both',iterations:1});
  state.animation=entrance;
  entrance.onfinish=()=>{
   if(state.animation!==entrance)return;
   state.image.style.opacity='1';
   state.image.style.translate='none';
   state.animation=null;
   entrance.cancel();
  };
 }
 function check(){
  scheduled=false;
  if(reduced.matches)return;
  states.forEach(state=>{
   const rect=(state.section||state.image).getBoundingClientRect();
   const bounds=state.scroller?.getBoundingClientRect();
   const top=Math.max(0,bounds?.top||0);
   const bottom=Math.min(window.innerHeight,bounds?.bottom??window.innerHeight);
   const inView=rect.bottom>top&&rect.top<bottom;
   if(!inView){if(state.played)reset(state);return;}
   const reachedBottom=rect.bottom<=bottom+2;
   const fillsView=!state.section&&rect.height>bottom-top&&rect.top<=top+2;
   if(!state.played&&(reachedBottom||fillsView))reveal(state);
  });
 }
 function queue(){if(!scheduled){scheduled=true;requestAnimationFrame(check);}}
 states.forEach(state=>{
  state.image.classList.remove('portrait-motion-ready','portrait-visible');
  state.image.style.transform='';
  reset(state);
  state.image.addEventListener('load',queue);
  state.image.addEventListener('error',()=>{state.image.style.opacity='1';});
 });
 // Capture also handles the About page's internal reading box.
 document.addEventListener('scroll',queue,{passive:true,capture:true});
 window.addEventListener('resize',queue);
 window.addEventListener('pageshow',queue);
 reduced.addEventListener('change',()=>{states.forEach(reset);queue();});
 queue();
})();

// Keep Media and Contact selected in both menus when following homepage anchors.
(() => {
 if(!document.body.classList.contains('home-layout'))return;
 function markSection(){
  document.querySelectorAll('.site-header nav a,footer nav a').forEach(link=>{
   const selected=['#media','#contact'].includes(location.hash)&&link.getAttribute('href')===location.hash;
   if(selected)link.setAttribute('aria-current','location');
   else link.removeAttribute('aria-current');
  });
 }
 window.addEventListener('hashchange',markSection);
 markSection();
})();

// Continuous back-and-forth photo drift beside the fixed ground portrait.
(() => {
 const gallery=document.querySelector('.skydiving-rotator');
 if(!gallery)return;
 const track=gallery.querySelector('.skydiving-track');
 const toggle=gallery.querySelector('.skydiving-toggle');
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 let paused=false,touching=false,frame=null,last=null,direction=1,position=track.scrollLeft;
 function step(time){
  frame=null;
  const elapsed=last===null?0:Math.min(time-last,64);
  last=time;
  const max=Math.max(0,track.scrollWidth-track.clientWidth);
  position=Math.max(0,Math.min(max,position+direction*38*elapsed/1000));
  if(position>=max)direction=-1;
  else if(position<=0)direction=1;
  track.scrollLeft=position;
  frame=requestAnimationFrame(step);
 }
 function schedule(){
  if(frame!==null)cancelAnimationFrame(frame);
  frame=null;last=null;position=track.scrollLeft;
  if(!paused&&!touching&&!document.hidden&&!reduced.matches)frame=requestAnimationFrame(step);
  toggle.textContent=paused?'Play':'Pause';
  toggle.setAttribute('aria-pressed',String(paused));
  toggle.setAttribute('aria-label',paused?'Start skydiving photo rotation':'Pause skydiving photo rotation');
  toggle.hidden=reduced.matches;
 }
 toggle.addEventListener('click',()=>{paused=!paused;schedule();});
 track.addEventListener('keydown',event=>{
  if(event.key==='ArrowLeft'||event.key==='ArrowRight'){
   event.preventDefault();
   track.scrollLeft+=track.clientWidth/2*(event.key==='ArrowLeft'?-1:1);
   schedule();
  }
 });
 track.addEventListener('touchstart',()=>{touching=true;schedule();},{passive:true});
 track.addEventListener('touchend',()=>{touching=false;schedule();},{passive:true});
 track.addEventListener('touchcancel',()=>{touching=false;schedule();},{passive:true});
 track.addEventListener('wheel',()=>{position=track.scrollLeft;},{passive:true});
 document.addEventListener('visibilitychange',schedule);
 reduced.addEventListener('change',schedule);
 schedule();
})();
