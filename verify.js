/* verify.js - توثيق هوية الزبائن لتطبيق سريعة RAPIDE
   يُحمَّل بعد السكربت الرئيسي: <script src="verify.js"></script> قبل </body> */
(function(){
if(typeof cloudOn==='undefined'||!cloudOn)return;

Object.assign(T.ar,{ver_t:'توثيق الهوية',ver_f:'بطاقة التعريف (الأمام)',ver_b:'الخلف (اختياري)',ver_s:'صورة سيلفي',ver_send:'إرسال للمراجعة',ver_pending:'وثائقك قيد المراجعة',ver_ok:'حسابك موثّق ✓',ver_rej:'تم رفض الوثائق',ver_need:'وثّق هويتك أولًا لنشر الطلبات',ver_err:'تعذّر الإرسال (الصور حتى 5 ميغا)',ver_rev:'توثيق الزبائن',ver_show:'عرض الصور',ver_app:'قبول',ver_rejb:'رفض',ver_reason:'سبب الرفض:',ver_lic:'رخصة السياقة (صورة)',ver_card:'البطاقة الرمادية (صورة)',ver_need2:'وثّق هويتك أولًا للتسجيل كسائق'});
Object.assign(T.fr,{ver_t:'Vérification d’identité',ver_f:'Carte d’identité (recto)',ver_b:'Verso (facultatif)',ver_s:'Selfie',ver_send:'Envoyer pour vérification',ver_pending:'Documents en cours de vérification',ver_ok:'Compte vérifié ✓',ver_rej:'Documents refusés',ver_need:'Vérifiez votre identité pour publier',ver_err:'Envoi impossible (5 Mo max)',ver_rev:'Vérification des clients',ver_show:'Voir les photos',ver_app:'Valider',ver_rejb:'Refuser',ver_reason:'Motif du refus :',ver_lic:'Permis de conduire (photo)',ver_card:'Carte grise (photo)',ver_need2:'Vérifiez votre identité pour vous inscrire comme chauffeur'});
Object.assign(T.en,{ver_t:'ID verification',ver_f:'ID card (front)',ver_b:'Back (optional)',ver_s:'Selfie',ver_send:'Submit for review',ver_pending:'Your documents are under review',ver_ok:'Account verified ✓',ver_rej:'Documents rejected',ver_need:'Verify your ID to post requests',ver_err:'Upload failed (5 MB max)',ver_rev:'Customer verification',ver_show:'Show photos',ver_app:'Approve',ver_rejb:'Reject',ver_reason:'Rejection reason:',ver_lic:'Driving license (photo)',ver_card:'Vehicle registration (photo)',ver_need2:'Verify your ID to register as a driver'});

let vr=null,vSig='',pend=[],pSig='';
const SB=()=>C.url.replace(/\/$/,''),CIT=()=>SB()+'/rest/v1/customer_ids';
const canPost=()=>isAdm||(vr&&vr.status==='approved');

const box=document.createElement('div');box.id='verbox';box.className='empty:hidden';
$('fo').before(box);
const adm=document.createElement('div');adm.className='c space-y-3';
adm.innerHTML='<h3 class="font-bold text-blue-700" data-i="ver_rev"></h3><div id="l-ver" class="space-y-2"></div>';
adm.firstChild.textContent=t('ver_rev');
$('l-adm').parentElement.after(adm);

async function loadVer(){
 if(!sess)return;
 try{const r=await fetch(CIT()+'?select=*&user_id=eq.'+me.id,{headers:await hd()});if(r.ok)vr=(await r.json())[0]||null}catch(e){}
 renderVer();if(isAdm)loadPend();
}
function renderVer(){
 if(!sess||isAdm){box.innerHTML='';vSig='';return}
 const s=vr?vr.status:'none',sig=s+lang+(vr&&vr.reject_reason||'');
 if(sig===vSig)return;vSig=sig;
 const m=s==='pending'?`<p class="text-xs font-bold text-amber-700">⏳ ${t('ver_pending')}</p>`:s==='approved'?`<p class="text-xs font-bold text-emerald-700">✅ ${t('ver_ok')}</p>`:s==='rejected'?`<p class="text-xs font-bold text-red-600">❌ ${t('ver_rej')}${vr.reject_reason?': '+esc(vr.reject_reason):''}</p>`:'';
 const form=(s==='pending'||s==='approved')?'':`<label class="f">${t('ver_f')}</label><input id="v-f" type="file" accept="image/*" class="i"><label class="f">${t('ver_b')}</label><input id="v-b" type="file" accept="image/*" class="i"><label class="f">${t('ver_s')}</label><input id="v-s" type="file" accept="image/*" capture="user" class="i"><button id="v-btn" class="b">${t('ver_send')}</button>`;
 box.innerHTML=`<div class="c space-y-2"><h2 class="font-bold text-emerald-700">🪪 ${t('ver_t')}</h2>${m}${form}</div>`;
 const bt=$('v-btn');if(bt)bt.onclick=sendVer;
}
async function sendVer(){
 const f=$('v-f').files[0],b=$('v-b').files[0],s=$('v-s').files[0];
 if(!f||!s||[f,b,s].some(x=>x&&x.size>5e6))return toast(t('ver_err'));
 $('v-btn').disabled=true;
 try{
  const up=async(n,x)=>{if(!x)return null;const p=me.id+'/'+n+'.jpg',h=await hd();h['Content-Type']=x.type||'image/jpeg';h['x-upsert']='true';
   const r=await fetch(SB()+'/storage/v1/object/id-docs/'+p,{method:'POST',headers:h,body:x});if(!r.ok)throw 0;return p};
  const md=me.user_metadata||{};
  const row={front_path:await up('front',f),back_path:await up('back',b),selfie_path:await up('selfie',s),status:'approved',reject_reason:null,full_name:md.name||'',phone:md.phone||''};
  const h=await hd();h.Prefer='return=representation';
  const r=vr?await fetch(CIT()+'?user_id=eq.'+me.id,{method:'PATCH',headers:h,body:JSON.stringify(row)}):await fetch(CIT(),{method:'POST',headers:h,body:JSON.stringify({...row,user_id:me.id})});
  if(!r.ok)throw 0;
  vr=(await r.json())[0]||{status:'approved'};vSig='';renderVer();toast(t('ver_ok'));
 }catch(x){toast(t('ver_err'));const bt=$('v-btn');if(bt)bt.disabled=false}
}
async function loadPend(){
 try{const r=await fetch(CIT()+'?select=*&status=eq.pending&order=created_at.asc',{headers:await hd()});if(r.ok){pend=await r.json();renderAdmVer()}}catch(e){}
}
function renderAdmVer(){
 const e=$('l-ver');if(!e)return;
 const sig=lang+pend.map(x=>x.id).join();if(sig===pSig)return;pSig=sig;
 e.innerHTML=pend.length?pend.map(x=>`<div class="border rounded-xl p-3 bg-gray-50 text-xs space-y-2"><b>${esc(x.full_name||'—')} ${esc(x.phone||'')}</b><div id="vi-${x.id}" class="grid grid-cols-3 gap-1"></div><div class="flex gap-2"><button class="b2" style="background:#2563eb" data-v="show" data-id="${x.id}">${t('ver_show')}</button><button class="b2" data-v="ok" data-id="${x.id}">${t('ver_app')}</button><button class="b2" style="background:#dc2626" data-v="no" data-id="${x.id}">${t('ver_rejb')}</button></div></div>`).join(''):empty();
}
$('l-ver').addEventListener('click',e=>{
 const b=e.target.closest('button[data-v]');if(!b)return;
 if(b.dataset.v==='show')showDocs(b.dataset.id);else decide(b.dataset.id,b.dataset.v==='ok');
});
async function showDocs(id){
 const x=pend.find(p=>p.id===id),bx=$('vi-'+id);if(!x||!bx)return;bx.innerHTML='';
 for(const p of [x.front_path,x.back_path,x.selfie_path].filter(Boolean)){
  const r=await fetch(SB()+'/storage/v1/object/sign/id-docs/'+p,{method:'POST',headers:await hd(),body:JSON.stringify({expiresIn:300})});
  if(!r.ok)continue;const u=esc(SB()+'/storage/v1'+(await r.json()).signedURL);
  bx.insertAdjacentHTML('beforeend',`<a href="${u}" target="_blank" rel="noopener"><img src="${u}" class="w-full h-28 object-cover rounded-lg border"></a>`);
 }
}
async function decide(id,ok){
 let why=null;if(!ok){why=prompt(t('ver_reason'));if(why===null)return}
 const r=await fetch(CIT()+'?id=eq.'+id,{method:'PATCH',headers:await hd(),body:JSON.stringify({status:ok?'approved':'rejected',reject_reason:why||null})});
 if(!r.ok)return toast(t('ver_err'));
 pend=pend.filter(x=>x.id!==id);pSig='';renderAdmVer();
}

/* السائق: رخصة + بطاقة رمادية، وتفعيل مباشر */
async function upFile(n,x){const p=me.id+'/'+n+'.jpg',h=await hd();h['Content-Type']=x.type||'image/jpeg';h['x-upsert']='true';const r=await fetch(SB()+'/storage/v1/object/id-docs/'+p,{method:'POST',headers:h,body:x});if(!r.ok)throw 0;return p}
$('d-plate').insertAdjacentHTML('afterend','<label class="f" data-i="ver_lic"></label><input id="d-lic" type="file" accept="image/*" class="i" required><label class="f" data-i="ver_card"></label><input id="d-card" type="file" accept="image/*" class="i" required>');
function place(id){$(id==='drv'?'v-drv':'v-order').prepend(box);box.style.marginBottom=id==='drv'?'1.25rem':'0'}

/* ربط الوظائف الأصلية */
const _ao=addOrder,_st=start,_lo=logout,_rn=render,_pl=pull,_tb=tab;
window.addOrder=function(e){
 if(!canPost()){e.preventDefault();toast(t('ver_need'));box.scrollIntoView({behavior:'smooth'});return}
 return _ao(e);
};
window.start=async function(){await _st();await loadVer()};
window.logout=function(){vr=null;vSig='';pend=[];pSig='';_lo()};
window.render=function(){_rn();renderVer();renderAdmVer()};
window.pull=async function(){await _pl();if(isAdm)loadPend();else if(vr&&vr.status==='pending')loadVer()};
window.tab=function(id){_tb(id);place(id)};
window.addDrv=async function(e){
 e.preventDefault();
 if(!canPost()){toast(t('ver_need2'));box.scrollIntoView({behavior:'smooth'});return}
 const lic=$('d-lic').files[0],cd=$('d-card').files[0],f=e.target;
 if(!lic||!cd||lic.size>5e6||cd.size>5e6)return toast(t('ver_err'));
 try{await upFile('license',lic);await upFile('vehicle',cd)}catch(x){return toast(t('ver_err'))}
 const x={id:Date.now(),name:$('d-name').value,phone:$('d-phone').value,veh:$('d-veh').value,plate:$('d-plate').value,ok:true,uid:uid()};
 drivers.push(x);push('drivers',x);f.reset();note('🚛 '+t('n_drv'));
};
})();
