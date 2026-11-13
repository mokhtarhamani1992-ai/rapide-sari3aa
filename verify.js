/* verify.js - توثيق تلقائي للزبائن والسائقين + بحث الإدارة عن الوثائق والعمليات
   يُحمَّل بعد السكربت الرئيسي: <script src="verify.js"></script> قبل </body> */
(function(){
if(typeof cloudOn==='undefined'||!cloudOn)return;

Object.assign(T.ar,{ver_t:'توثيق الهوية',ver_f:'بطاقة التعريف (الأمام)',ver_b:'الخلف (اختياري)',ver_s:'صورة سيلفي',ver_send:'إرسال',ver_ok:'حسابك موثّق ✓',ver_need:'وثّق هويتك أولًا لنشر الطلبات',ver_need2:'وثّق هويتك أولًا للتسجيل كسائق',ver_err:'تعذّر الإرسال (الصور حتى 5 ميغا)',ver_lic:'رخصة السياقة (صورة)',ver_card:'البطاقة الرمادية (صورة)',ver_consent:'أوافق على حفظ وثائقي وعلى تسليمها للسلطات المختصة عند الاقتضاء القانوني',ver_cn:'وافق على الشرط أولًا',ver_rev:'بحث عن وثائق وعمليات مستخدم',ver_q:'الاسم أو رقم الهاتف',ver_go:'بحث',ver_none:'لا نتائج',ver_cust:'زبون',ver_drv:'سائق',ver_ords:'العمليات'});
Object.assign(T.fr,{ver_t:'Vérification d’identité',ver_f:'Carte d’identité (recto)',ver_b:'Verso (facultatif)',ver_s:'Selfie',ver_send:'Envoyer',ver_ok:'Compte vérifié ✓',ver_need:'Vérifiez votre identité pour publier',ver_need2:'Vérifiez votre identité pour vous inscrire comme chauffeur',ver_err:'Envoi impossible (5 Mo max)',ver_lic:'Permis de conduire (photo)',ver_card:'Carte grise (photo)',ver_consent:'J’accepte que mes documents soient conservés et remis aux autorités compétentes si la loi l’exige',ver_cn:'Acceptez d’abord la condition',ver_rev:'Rechercher les documents et opérations d’un utilisateur',ver_q:'Nom ou téléphone',ver_go:'Chercher',ver_none:'Aucun résultat',ver_cust:'Client',ver_drv:'Chauffeur',ver_ords:'Opérations'});
Object.assign(T.en,{ver_t:'ID verification',ver_f:'ID card (front)',ver_b:'Back (optional)',ver_s:'Selfie',ver_send:'Submit',ver_ok:'Account verified ✓',ver_need:'Verify your ID to post requests',ver_need2:'Verify your ID to register as a driver',ver_err:'Upload failed (5 MB max)',ver_lic:'Driving license (photo)',ver_card:'Vehicle registration (photo)',ver_consent:'I agree that my documents are stored and handed to the competent authorities when legally required',ver_cn:'Please accept the condition first',ver_rev:'Look up a user’s documents and operations',ver_q:'Name or phone',ver_go:'Search',ver_none:'No results',ver_cust:'Customer',ver_drv:'Driver',ver_ords:'Operations'});

let vr=null,vSig='';
const SB=()=>C.url.replace(/\/$/,''),CIT=()=>SB()+'/rest/v1/customer_ids',SG=()=>SB()+'/storage/v1';
const canPost=()=>isAdm||(vr&&vr.status==='approved');
async function upFile(n,x){const h=await hd(),p=me.id+'/'+n+'.jpg';h['Content-Type']=x.type||'image/jpeg';h['x-upsert']='true';const r=await fetch(SG()+'/object/id-docs/'+p,{method:'POST',headers:h,body:x});if(!r.ok)throw 0;return p}

/* ---------- واجهة الزبون ---------- */
const box=document.createElement('div');box.id='verbox';box.className='empty:hidden';
$('fo').before(box);
function place(id){$(id==='drv'?'v-drv':'v-order').prepend(box);box.style.marginBottom=id==='drv'?'1.25rem':'0'}

async function loadVer(){
 if(!sess)return;
 try{const r=await fetch(CIT()+'?select=*&user_id=eq.'+me.id,{headers:await hd()});if(r.ok)vr=(await r.json())[0]||null}catch(e){}
 renderVer();
}
function renderVer(){
 if(!sess||isAdm){box.innerHTML='';vSig='';return}
 const ok=vr&&vr.status==='approved',sig=(ok?'1':'0')+lang;
 if(sig===vSig)return;vSig=sig;
 box.innerHTML=`<div class="c space-y-2"><h2 class="font-bold text-emerald-700">🪪 ${t('ver_t')}</h2>`+(ok?`<p class="text-xs font-bold text-emerald-700">✅ ${t('ver_ok')}</p>`:`<label class="f">${t('ver_f')}</label><input id="v-f" type="file" accept="image/*" class="i"><label class="f">${t('ver_b')}</label><input id="v-b" type="file" accept="image/*" class="i"><label class="f">${t('ver_s')}</label><input id="v-s" type="file" accept="image/*" capture="user" class="i"><label class="flex gap-2 items-start text-xs font-bold"><input type="checkbox" id="v-c" class="mt-1"><span>${t('ver_consent')}</span></label><button id="v-btn" class="b">${t('ver_send')}</button>`)+'</div>';
 const bt=$('v-btn');if(bt)bt.onclick=sendVer;
}
async function sendVer(){
 const f=$('v-f').files[0],b=$('v-b').files[0],s=$('v-s').files[0];
 if(!f||!s||[f,b,s].some(x=>x&&x.size>5e6))return toast(t('ver_err'));
 if(!$('v-c').checked)return toast(t('ver_cn'));
 $('v-btn').disabled=true;
 try{
