import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const LOGO = (typeof window!=='undefined' && window.LOGO) ? window.LOGO : '';

const cfg = {
  apiKey:"AIzaSyBvS-Feo76ri9eN9191Qj9C5AuOuuhFyts",
  authDomain:"rp-bsk.firebaseapp.com",
  projectId:"rp-bsk",
  storageBucket:"rp-bsk.firebasestorage.app",
  messagingSenderId:"880476581176",
  appId:"1:880476581176:web:7403dd1a91ce6bf15865cd"
};
const app = initializeApp(cfg);
const db  = getFirestore(app);

const AU='rams_admin', AP='Basaksehir2024!';
const ADMIN_KEY='rams_admin_session';
let isAdmin = localStorage.getItem(ADMIN_KEY)==='1';
let editId=null, editType=null;
window._blog=[]; window._kadro=[]; window._mac=[]; window._store=[]; window._puan=[];

/* ---------- LOGO'ları uygula ---------- */
document.querySelectorAll('.app-logo').forEach(el=>el.src=LOGO);

/* ---------- SYNC bar ---------- */
function flash(){
  const e=document.getElementById('sync');
  if(!e) return;
  e.classList.add('on');
  setTimeout(()=>e.classList.remove('on'),2000);
}
function load(on){
  const b=document.getElementById('bar');
  if(!b) return;
  if(on){b.className='s';}else{b.className='d';setTimeout(()=>b.className='',400);}
}

/* ---------- Sayfa yükleme animasyonu ---------- */
let loaderHidden=false;
function hideLoader(){
  if(loaderHidden) return;
  loaderHidden=true;
  const l=document.getElementById('pageLoader');
  if(l) l.classList.add('hide');
}
setTimeout(hideLoader,3000); // güvenlik: veri gelmese bile 3sn sonra gizle

/* ---------- Firebase dinleyicileri ---------- */
onSnapshot(query(collection(db,'blog'),orderBy('createdAt','desc')),s=>{
  window._blog=s.docs.map(d=>({id:d.id,...d.data()})); renderBlog(); flash(); hideLoader();
});
onSnapshot(query(collection(db,'kadro'),orderBy('no')),s=>{
  window._kadro=s.docs.map(d=>({id:d.id,...d.data()})); renderKadro(); flash(); hideLoader();
});
onSnapshot(query(collection(db,'mac'),orderBy('createdAt','desc')),s=>{
  window._mac=s.docs.map(d=>({id:d.id,...d.data()})); renderMac(); flash(); hideLoader();
});
onSnapshot(query(collection(db,'store'),orderBy('createdAt','desc')),s=>{
  window._store=s.docs.map(d=>({id:d.id,...d.data()})); renderStore(); flash(); hideLoader();
});
onSnapshot(collection(db,'puan'),s=>{
  window._puan=s.docs.map(d=>({id:d.id,...d.data()})); renderPuan(); flash(); hideLoader();
});

/* ---------- Hamburger menü ---------- */
window.toggleMob=function(){document.getElementById('mobmenu')?.classList.toggle('on');}
window.closeMob=function(){document.getElementById('mobmenu')?.classList.remove('on');}
document.addEventListener('click',function(e){
  const mob=document.getElementById('mobmenu');
  const btn=document.getElementById('hmbtn');
  if(mob && mob.classList.contains('on') && !mob.contains(e.target) && btn && !btn.contains(e.target)) closeMob();
});

/* ---------- Admin girişi / çıkışı ---------- */
window.doLogin=function(){
  const u=document.getElementById('lu').value.trim();
  const p=document.getElementById('lp').value;
  if(u===AU && p===AP){
    localStorage.setItem(ADMIN_KEY,'1');
    const back = document.body.dataset.back || '../Haberler/';
    window.location.href = back;
  } else {
    document.getElementById('le').style.display='block';
  }
}
document.addEventListener('keydown',e=>{
  if(e.key==='Enter' && document.getElementById('lu')) doLogin();
});
window.logout=function(){
  localStorage.removeItem(ADMIN_KEY);
  window.location.reload();
}

function setUI(){
  document.querySelectorAll('#oBtn').forEach(b=>b.classList.toggle('on',isAdmin));
  document.querySelectorAll('.ab').forEach(b=>b.classList.toggle('on',isAdmin));
  const mob=document.getElementById('mobLogoutBtn');
  if(mob) mob.style.display=isAdmin?'block':'none';
  renderBlog();renderKadro();renderMac();renderStore();renderPuan();
}
setUI();
if(!document.getElementById('blogGrid') && !document.getElementById('kadroWrap') && !document.getElementById('macList') && !document.getElementById('storeGrid') && !document.getElementById('puanBody')){
  hideLoader(); // içerik grid'i olmayan sayfalarda (ör. admin) beklemeye gerek yok
}

/* ---------- Admin düzenle/sil butonları ---------- */
function adm(type,id){
  if(!isAdmin) return '';
  return '<div class="adm"><button class="ebtn" onclick="editItm(\''+type+'\',\''+id+'\')">Düzenle</button><button class="dbtn" onclick="delItm(\''+type+'\',\''+id+'\')">Sil</button></div>';
}

/* ---------- BLOG (Haberler) ---------- */
function renderBlog(){
  const g=document.getElementById('blogGrid');
  if(!g) return;
  if(!window._blog.length){g.innerHTML='<div class="empty" style="grid-column:1/-1"><div class="ico">📰</div><p>Henüz yazı yok.</p></div>';return;}
  g.innerHTML=window._blog.map(b=>
    '<div class="bc" onclick="openDet(\''+b.id+'\')">'+
    '<div class="bcimg">'+(b.img?'<img src="'+b.img+'">'  :'<img class="noimg" src="'+LOGO+'">')+'</div>'+
    '<div class="bcb">'+
    (b.category?'<span class="bcat">'+b.category+'</span>':'')+
    '<div class="btit">'+(b.title||'')+'</div>'+
    '<div class="bex">'+(b.content?b.content.substring(0,120)+'...':'')+'</div>'+
    '</div>'+
    '<div class="bft"><span>'+(b.date||'')+'</span><div onclick="event.stopPropagation()">'+adm('blog',b.id)+'</div></div>'+
    '</div>'
  ).join('');
}

/* ---------- KADRO ---------- */
function renderKadro(){
  const wrap=document.getElementById('kadroWrap');
  if(!wrap) return;
  if(!window._kadro.length){wrap.innerHTML='<div class="empty"><div class="ico">⚽</div><p>Henüz oyuncu yok.</p></div>';return;}
  const grps={'Kaleci':[],'Defans':[],'Orta Saha':[],'Forvet':[],'Teknik Direktör':[],'Antrenör':[]};
  window._kadro.forEach(k=>{
    if(grps[k.position]!==undefined) grps[k.position].push(k);
    else{if(!grps['Diğer']) grps['Diğer']=[];grps['Diğer'].push(k);}
  });
  let html='';
  for(const[pos,pls] of Object.entries(grps)){
    if(!pls.length) continue;
    html+='<div class="ksec"><div class="kstit">'+pos+'</div><div class="kgrid">'+
    pls.map(k=>
      '<div class="kc">'+
      '<div class="kav">'+(k.img?'<img src="'+k.img+'">':(k.name||'?').charAt(0))+'</div>'+
      '<div class="kno">#'+(k.no||'?')+'</div>'+
      '<div class="kna">'+(k.name||'')+'</div>'+
      '<div class="kpo">'+(k.position||'')+'</div>'+
      '<div class="knt">'+(k.nationality||'')+'</div>'+
      '<div style="margin-top:8px">'+adm('kadro',k.id)+'</div>'+
      '</div>'
    ).join('')+'</div></div>';
  }
  wrap.innerHTML=html;
}

/* ---------- MAÇLAR ---------- */
function renderMac(){
  const l=document.getElementById('macList');
  if(!l) return;
  if(!window._mac.length){l.innerHTML='<div class="empty"><div class="ico">🏟️</div><p>Henüz maç yok.</p></div>';return;}
  l.innerHTML=window._mac.map(m=>
    '<div class="mc">'+
    '<div class="mch"><div class="mchl">'+
    '<span class="mbdg">'+(m.league||'Lig Maçı')+'</span>'+
    '<span class="mdt">📅 '+(m.date||'')+(m.time?' ⏰ '+m.time:'')+'</span>'+
    '</div>'+adm('mac',m.id)+'</div>'+
    '<div class="mcb">'+
    '<div class="mt"><div class="mlo">'+(m.team1logo?'<img src="'+m.team1logo+'">':'<img src="'+LOGO+'">')+'</div><div class="mtn">'+(m.team1||'Ev Sahibi')+'</div></div>'+
    (m.score1!==undefined&&m.score1!==''?'<div class="msc">'+m.score1+' - '+m.score2+'</div>':'<div class="mvs">VS</div>')+
    '<div class="mt"><div class="mlo">'+(m.team2logo?'<img src="'+m.team2logo+'">':'⚽')+'</div><div class="mtn">'+(m.team2||'Deplasman')+'</div></div>'+
    '</div>'+
    '<div class="mmeta">'+
    (m.referee?'<span>⚖️ '+m.referee+'</span>':'')+
    (m.stadium?'<span>🏟️ '+m.stadium+'</span>':'')+
    (m.weather?'<span>🌤️ '+m.weather+'</span>':'')+
    (m.city?'<span>📍 '+m.city+'</span>':'')+
    '</div></div>'
  ).join('');
}

/* ---------- STORE ---------- */
function renderStore(){
  const g=document.getElementById('storeGrid');
  if(!g) return;
  if(!window._store.length){g.innerHTML='<div class="empty" style="grid-column:1/-1"><div class="ico">🛒</div><p>Henüz ürün yok.</p></div>';return;}
  g.innerHTML=window._store.map(s=>
    '<div class="sc">'+
    '<div class="scimg">'+(s.img?'<img src="'+s.img+'">'  :'<img class="noimg" src="'+LOGO+'">')+'</div>'+
    '<div class="scb">'+
    '<div class="sctit">'+(s.title||'')+'</div>'+
    (s.desc?'<div class="scdesc">'+s.desc+'</div>':'')+
    '<div class="scprice">'+(s.price?s.price+' ₺':'')+'</div>'+
    '</div>'+
    '<div style="padding:0 18px 16px"><div onclick="event.stopPropagation()">'+adm('store',s.id)+'</div></div>'+
    '</div>'
  ).join('');
}

/* ---------- PUAN DURUMU ---------- */
function renderPuan(){
  const body=document.getElementById('puanBody');
  if(!body) return;
  if(!window._puan.length){
    body.innerHTML='<tr><td colspan="9"><div class="empty"><div class="ico">🏆</div><p>Henüz puan durumu girilmedi.</p></div></td></tr>';
    return;
  }
  const list=[...window._puan].sort((a,b)=>{
    const pb=parseInt(b.points)||0, pa=parseInt(a.points)||0;
    if(pb!==pa) return pb-pa;
    const fb=(parseInt(b.goalsFor)||0)-(parseInt(b.goalsAgainst)||0);
    const fa=(parseInt(a.goalsFor)||0)-(parseInt(a.goalsAgainst)||0);
    return fb-fa;
  });
  const n=list.length;
  body.innerHTML=list.map((t,i)=>{
    const rank=i+1;
    const cls = rank<=4 ? 'top' : (rank>n-3 ? 'bot' : 'mid');
    const gf=parseInt(t.goalsFor)||0, ga=parseInt(t.goalsAgainst)||0;
    const fark=gf-ga;
    return '<tr>'+
      '<td><span class="prank '+cls+'">'+rank+'</span></td>'+
      '<td class="pteam">'+(t.logo?'<img src="'+t.logo+'">':'')+'<span>'+(t.team||'')+'</span></td>'+
      '<td>'+(t.played??'')+'</td>'+
      '<td>'+(t.win??'')+'</td>'+
      '<td>'+(t.draw??'')+'</td>'+
      '<td>'+(t.loss??'')+'</td>'+
      '<td>'+gf+':'+ga+'</td>'+
      '<td>'+(fark>0?'+':'')+fark+'</td>'+
      '<td class="ppts">'+(t.points??'')+'</td>'+
      '<td class="padm">'+adm('puan',t.id)+'</td>'+
      '</tr>';
  }).join('');
}

/* ---------- BLOG DETAY ---------- */
window.openDet=function(id){
  const b=window._blog.find(x=>x.id===id); if(!b) return;
  const box=document.getElementById('detBox'); if(!box) return;
  box.innerHTML=
    (b.img?'<img class="dhimg" src="'+b.img+'">'  :'<div class="dph"><img src="'+LOGO+'"></div>')+
    '<div class="dbd">'+
    '<div class="dmeta">'+(b.category?'<span class="dcat">'+b.category+'</span>':'')+(b.date?'<span class="ddate">📅 '+b.date+'</span>':'')+'</div>'+
    '<div class="dtit">'+(b.title||'')+'</div>'+
    '<div class="dcnt">'+(b.content||'')+'</div>'+
    '</div>'+
    '<div class="dft"><button class="dcls" onclick="closeDet()">← Geri Dön</button></div>';
  document.getElementById('detBg').classList.add('on');
  document.body.style.overflow='hidden';
}
window.closeDet=function(){document.getElementById('detBg').classList.remove('on');document.body.style.overflow='';}
window.detBgClk=function(e){if(e.target===document.getElementById('detBg')) closeDet();}

/* ---------- MODAL (ekle/düzenle) ---------- */
window.openModal=function(type,item){
  editId=item?.id||null; editType=type;
  const v=(k,fb='')=>item?.[k]??fb;
  let h='';
  const mh=(title)=>'<div class="mhd"><h3>'+title+'</h3><button class="mcl" onclick="closeModal()">✕</button></div><div class="mbd">';

  if(type==='blog'){
    h=mh(editId?'YAZI DÜZENLE':'YENİ YAZI')+
    '<div class="fg"><label>Başlık</label><input id="ft" value="'+v('title')+'"></div>'+
    '<div class="fr"><div class="fg"><label>Kategori</label><input id="fca" value="'+v('category')+'"></div>'+
    '<div class="fg"><label>Tarih</label><input type="date" id="fd" value="'+v('date')+'"></div></div>'+
    '<div class="fg"><label>İçerik</label><textarea id="fc">'+v('content')+'</textarea></div>'+
    '<div class="fg"><label>Kapak Foto URL</label><input id="fi" placeholder="https://..." value="'+v('img')+'" oninput="prv(this.value,\'pi\')">'+
    '<img id="pi" src="'+v('img')+'" style="display:'+(v('img')?'block':'none')+';width:100%;max-height:140px;object-fit:cover;border-radius:8px;margin-top:8px"></div>'+
    '<button class="sbtn" id="sbtn" onclick="saveItm()">KAYDET</button></div>';
  } else if(type==='kadro'){
    h=mh(editId?'OYUNCU DÜZENLE':'YENİ OYUNCU')+
    '<div class="fr"><div class="fg"><label>Ad Soyad</label><input id="fn" value="'+v('name')+'"></div>'+
    '<div class="fg"><label>Forma No</label><input type="number" id="fno" value="'+v('no')+'"></div></div>'+
    '<div class="fr"><div class="fg"><label>Mevki</label><select id="fp">'+
    ['Kaleci','Defans','Orta Saha','Forvet','Teknik Direktör','Antrenör'].map(p=>'<option'+(v('position')===p?' selected':'')+'>'+p+'</option>').join('')+
    '</select></div><div class="fg"><label>Milliyet</label><input id="fnat" value="'+v('nationality')+'"></div></div>'+
    '<div class="fg"><label>Fotoğraf URL</label><input id="fi" placeholder="https://..." value="'+v('img')+'" oninput="prv(this.value,\'pi\')">'+
    '<img id="pi" src="'+v('img')+'" style="display:'+(v('img')?'block':'none')+';width:56px;height:56px;object-fit:cover;border-radius:50%;margin-top:8px;border:3px solid var(--or)"></div>'+
    '<button class="sbtn" id="sbtn" onclick="saveItm()">KAYDET</button></div>';
  } else if(type==='mac'){
    h=mh(editId?'MAÇ DÜZENLE':'YENİ MAÇ')+
    '<div class="fr"><div class="fg"><label>Takım 1</label><input id="ft1" value="'+v('team1','Rams Başakşehir')+'"></div>'+
    '<div class="fg"><label>Takım 2</label><input id="ft2" value="'+v('team2')+'"></div></div>'+
    '<div class="fr"><div class="fg"><label>Takım 1 Logo URL</label><input id="fl1" placeholder="https://..." value="'+v('team1logo')+'" oninput="prv(this.value,\'pl1\')">'+
    '<img id="pl1" src="'+v('team1logo')+'" style="display:'+(v('team1logo')?'block':'none')+';width:44px;height:44px;object-fit:contain;margin-top:6px"></div>'+
    '<div class="fg"><label>Takım 2 Logo URL</label><input id="fl2" placeholder="https://..." value="'+v('team2logo')+'" oninput="prv(this.value,\'pl2\')">'+
    '<img id="pl2" src="'+v('team2logo')+'" style="display:'+(v('team2logo')?'block':'none')+';width:44px;height:44px;object-fit:contain;margin-top:6px"></div></div>'+
    '<div class="fr"><div class="fg"><label>Tarih</label><input type="date" id="fd" value="'+v('date')+'"></div>'+
    '<div class="fg"><label>Saat</label><input type="time" id="ftm" value="'+v('time')+'"></div></div>'+
    '<div class="fg"><label>Lig / Kupa</label><input id="flg" value="'+v('league','Süper Lig')+'"></div>'+
    '<div class="fr"><div class="fg"><label>Stad</label><input id="fst" value="'+v('stadium')+'"></div>'+
    '<div class="fg"><label>Şehir</label><input id="fci" value="'+v('city')+'"></div></div>'+
    '<div class="fr"><div class="fg"><label>Hakem</label><input id="frf" value="'+v('referee')+'"></div>'+
    '<div class="fg"><label>Hava Durumu</label><input id="fhv" value="'+v('weather')+'" placeholder="18°C Güneşli"></div></div>'+
    '<div class="fr"><div class="fg"><label>Skor T1</label><input type="number" id="fs1" value="'+v('score1')+'"></div>'+
    '<div class="fg"><label>Skor T2</label><input type="number" id="fs2" value="'+v('score2')+'"></div></div>'+
    '<button class="sbtn" id="sbtn" onclick="saveItm()">KAYDET</button></div>';
  } else if(type==='store'){
    h=mh(editId?'ÜRÜN DÜZENLE':'YENİ ÜRÜN')+
    '<div class="fg"><label>Ürün Adı</label><input id="ft" value="'+v('title')+'"></div>'+
    '<div class="fg"><label>Açıklama (opsiyonel)</label><textarea id="fc">'+v('desc')+'</textarea></div>'+
    '<div class="fg"><label>Fiyat (₺)</label><input type="number" id="fpr" placeholder="ör: 299" value="'+v('price')+'"></div>'+
    '<div class="fg"><label>Ürün Foto URL</label><input id="fstore_img" placeholder="https://..." value="'+v('img')+'" oninput="prv(this.value,\'psi\')">'+
    '<img id="psi" src="'+v('img')+'" style="display:'+(v('img')?'block':'none')+';width:100%;max-height:160px;object-fit:cover;border-radius:8px;margin-top:8px"></div>'+
    '<button class="sbtn" id="sbtn" onclick="saveItm()">KAYDET</button></div>';
  } else if(type==='puan'){
    h=mh(editId?'TAKIM DÜZENLE':'YENİ TAKIM')+
    '<div class="fg"><label>Takım Adı</label><input id="fteam" value="'+v('team')+'"></div>'+
    '<div class="fg"><label>Logo URL (opsiyonel)</label><input id="flogo" placeholder="https://..." value="'+v('logo')+'" oninput="prv(this.value,\'ppi\')">'+
    '<img id="ppi" src="'+v('logo')+'" style="display:'+(v('logo')?'block':'none')+';width:32px;height:32px;object-fit:contain;margin-top:8px"></div>'+
    '<div class="fr"><div class="fg"><label>Oynanan (O)</label><input type="number" id="fplayed" value="'+v('played')+'"></div>'+
    '<div class="fg"><label>Puan</label><input type="number" id="fpts" value="'+v('points')+'"></div></div>'+
    '<div class="fr"><div class="fg"><label>Galibiyet (G)</label><input type="number" id="fwin" value="'+v('win')+'"></div>'+
    '<div class="fg"><label>Beraberlik (B)</label><input type="number" id="fdraw" value="'+v('draw')+'"></div></div>'+
    '<div class="fr"><div class="fg"><label>Mağlubiyet (M)</label><input type="number" id="floss" value="'+v('loss')+'"></div>'+
    '<div class="fg"></div></div>'+
    '<div class="fr"><div class="fg"><label>Atılan Gol</label><input type="number" id="fgf" value="'+v('goalsFor')+'"></div>'+
    '<div class="fg"><label>Yenen Gol</label><input type="number" id="fga" value="'+v('goalsAgainst')+'"></div></div>'+
    '<button class="sbtn" id="sbtn" onclick="saveItm()">KAYDET</button></div>';
  }
  document.getElementById('modalBox').innerHTML=h;
  document.getElementById('modalBg').classList.add('on');
}

window.closeModal=function(){document.getElementById('modalBg').classList.remove('on');editId=null;editType=null;}
window.bgClk=function(e){if(e.target===document.getElementById('modalBg')) closeModal();}
window.editItm=function(type,id){
  const src=type==='blog'?window._blog:type==='kadro'?window._kadro:type==='mac'?window._mac:type==='store'?window._store:window._puan;
  const item=src.find(x=>x.id===id);
  if(item) openModal(type,item);
}
window.prv=function(url,pid){
  const img=document.getElementById(pid);
  if(!img) return;
  img.src=url; img.style.display=url?'block':'none';
}
function gv(id){const el=document.getElementById(id);return el?el.value.trim():'';}

window.saveItm=async function(){
  const btn=document.getElementById('sbtn');
  btn.disabled=true;btn.textContent='KAYDEDİLİYOR...';
  load(true);
  const ts=Date.now();
  let obj={};
  try{
    if(editType==='blog'){
      const imgUrl=gv('fi')||(editId?(window._blog.find(x=>x.id===editId)?.img||''):'');
      obj={title:gv('ft'),category:gv('fca'),date:gv('fd'),content:gv('fc'),createdAt:ts};
      if(imgUrl) obj.img=imgUrl;
    } else if(editType==='kadro'){
      const imgUrl=gv('fi')||(editId?(window._kadro.find(x=>x.id===editId)?.img||''):'');
      obj={name:gv('fn'),no:parseInt(gv('fno'))||0,position:gv('fp'),nationality:gv('fnat'),createdAt:ts};
      if(imgUrl) obj.img=imgUrl;
    } else if(editType==='mac'){
      const ex=editId?window._mac.find(x=>x.id===editId):null;
      obj={team1:gv('ft1'),team2:gv('ft2'),date:gv('fd'),time:gv('ftm'),league:gv('flg'),stadium:gv('fst'),city:gv('fci'),referee:gv('frf'),weather:gv('fhv'),score1:gv('fs1'),score2:gv('fs2'),createdAt:ts};
      const l1=gv('fl1')||ex?.team1logo||''; if(l1) obj.team1logo=l1;
      const l2=gv('fl2')||ex?.team2logo||''; if(l2) obj.team2logo=l2;
    } else if(editType==='store'){
      const typedUrl = gv('fstore_img');
      const existingImg = editId ? (window._store.find(x=>x.id===editId)?.img||'') : '';
      const imgUrl = typedUrl || existingImg;
      obj={title:gv('ft'),desc:gv('fc'),price:gv('fpr'),createdAt:ts};
      if(imgUrl) obj.img=imgUrl;
    } else if(editType==='puan'){
      const logoUrl=gv('flogo')||(editId?(window._puan.find(x=>x.id===editId)?.logo||''):'');
      obj={
        team:gv('fteam'),
        played:parseInt(gv('fplayed'))||0,
        win:parseInt(gv('fwin'))||0,
        draw:parseInt(gv('fdraw'))||0,
        loss:parseInt(gv('floss'))||0,
        goalsFor:parseInt(gv('fgf'))||0,
        goalsAgainst:parseInt(gv('fga'))||0,
        points:parseInt(gv('fpts'))||0,
        createdAt:ts
      };
      if(logoUrl) obj.logo=logoUrl;
    }
    if(editId) await updateDoc(doc(db,editType,editId),obj);
    else await addDoc(collection(db,editType),obj);
    load(false);closeModal();
  } catch(err){
    alert('Hata: '+err.message);
    btn.disabled=false;btn.textContent='KAYDET';
    load(false);
  }
}

window.delItm=async function(type,id){
  if(!confirm('Silmek istediğinize emin misiniz?')) return;
  load(true);
  try{await deleteDoc(doc(db,type,id));}catch(e){console.error(e);}
  load(false);
}
