/* Set your email to send contact messages straight to your inbox */
const CONTACT={email:''};
const $=s=>document.querySelector(s);
const burger=$('.burger'),links=$('.links');
const setNav=o=>{links.classList.toggle('open',o);burger.setAttribute('aria-expanded',o)};
burger.onclick=()=>setNav(!links.classList.contains('open'));
links.onclick=e=>e.target.closest('a')&&setNav(false);
addEventListener('keydown',e=>e.key==='Escape'&&setNav(false));
$('#year').textContent=new Date().getFullYear();
const f=$('#contact-form');
if(f)f.onsubmit=async e=>{
  e.preventDefault();
  const n=$('#note');
  if(!f.checkValidity()){f.reportValidity();return}
  const d=Object.fromEntries(new FormData(f));
  const text=`Name: ${d.name}\nEmail: ${d.email}\nTopic: ${d.topic}\n\n${d.msg}`;
  if(CONTACT.email){location.href=`mailto:${CONTACT.email}?subject=${encodeURIComponent('codder_era project: '+d.topic)}&body=${encodeURIComponent(text)}`;n.textContent='Opening your email app...';return}
  try{await navigator.clipboard.writeText(text);n.innerHTML='Message copied. Paste it to us on <a href="https://www.linkedin.com/in/abdul-rehman-328b13396" target="_blank" rel="noopener">LinkedIn</a>.'}
  catch{n.textContent='Please copy your message and send it to us on LinkedIn.'}
};
const t=$('#type');
if(t){const lines=t.dataset.lines.split('|');let l=0,c=0,out='';(function tick(){if(l>=lines.length)return;out+=lines[l][c++]||'';t.textContent=out;if(c>=lines[l].length){out+='\n';l++;c=0;setTimeout(tick,350)}else setTimeout(tick,25)})()}
