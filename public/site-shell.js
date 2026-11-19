const shell$=s=>document.querySelector(s);
const shellMenu=shell$('.menu-toggle');
shellMenu?.addEventListener('click',()=>shell$('.site-nav nav')?.classList.toggle('open'));
document.querySelectorAll('.site-nav nav a').forEach(a=>a.addEventListener('click',()=>shell$('.site-nav nav')?.classList.remove('open')));
async function loadSiteSettings(){
  try{
    const response=await fetch('/api/public/settings');
    if(!response.ok)return;
    const settings=await response.json();
    document.querySelectorAll('[data-setting]').forEach(el=>{
      const key=el.dataset.setting;
      if(typeof settings[key]!=='string')return;
      el.textContent=settings[key];
      if(el.dataset.settingLink==='tel')el.href=`tel:${settings[key].replace(/[^+\d]/g,'')}`;
      if(el.dataset.settingLink==='email')el.href=`mailto:${settings[key]}`;
    });
    document.querySelectorAll('[data-company-name]').forEach(el=>{
      const brand=el.querySelector('.brand-sub');
      if(brand){const label=[...el.childNodes].find(node=>node.nodeType===Node.TEXT_NODE);if(label)label.textContent=settings.company_name||'CIPI';}
      else el.textContent=settings.company_name||'Rent a Car CIPI';
    });
    const year=shell$('#year');if(year)year.textContent=new Date().getFullYear();
    const social=shell$('#social-links');
    if(social){for(const [key,label] of [['facebook','Facebook'],['instagram','Instagram']]){if(!settings[key])continue;try{const u=new URL(settings[key]);if(!['http:','https:'].includes(u.protocol))continue;const a=document.createElement('a');a.href=u.href;a.textContent=label;a.target='_blank';a.rel='noopener noreferrer';social.append(a)}catch{}}}
  }catch{ /* Public pages remain readable when live settings are unavailable. */ }
}
loadSiteSettings();
