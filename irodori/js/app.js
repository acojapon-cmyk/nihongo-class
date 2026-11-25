/* 共通: 保存(localStorage)・ヘッダー・トースト */
const store = {
  get(k, d){ try{ const v = localStorage.getItem('ir:'+k); return v===null? d : JSON.parse(v); }catch(e){ return d; } },
  set(k, v){ try{ localStorage.setItem('ir:'+k, JSON.stringify(v)); }catch(e){} }
};
function toast(msg){
  let t = document.querySelector('.toast');
  if(!t){ t = document.createElement('div'); t.className='toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'), 1600);
}
function esc(s){ return String(s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
/* ルビ記法: 漢字{よみ} → <ruby> */
function ruby(s){ return esc(s).replace(/([一-龥々]+)\{([^}]+)\}/g, '<ruby>$1<rt>$2</rt></ruby>'); }
function renderHeader(active, base){
  base = base || '';
  const items = [['index.html','ホーム'],['pages/explain.html','説明資料'],['pages/cando.html','Can-do'],['pages/roleplay.html','ロールプレイ'],['pages/quiz.html','質問・クイズ'],['progress.html','生徒・進捗'],['kana.html?s=hira','ひらがな'],['kana.html?s=kata','カタカナ'],['../kanji.html','漢字'],['pages/audio.html','音声'],['pages/book.html','本冊']];
  const h = document.createElement('header'); h.className='top';
  h.innerHTML = '<a class="logo" href="'+base+'index.html">日本語クラス（いろどり）</a><nav>' +
    items.map(([u,l])=>'<a href="'+base+u+'" class="'+(active===u?'on':'')+'">'+l+'</a>').join('') + '</nav>';
  document.body.prepend(h);
}
/* 汎用: 配列データの編集リスト(保存つき) */
function loadList(key, seed){ const v = store.get(key, null); if(v===null){ store.set(key, seed); return seed.slice(); } return v; }

/* 課データの読み込み / 生徒・進捗 */
function pad2(n){ return String(n).padStart(2,'0'); }
function loadLesson(n, cb){
  if(window.LESSONS && window.LESSONS[n]) return cb(window.LESSONS[n]);
  const sc = document.createElement('script'); sc.src = 'data/L'+pad2(n)+'.js';
  sc.onload = ()=>cb(window.LESSONS[n]); sc.onerror = ()=>cb(null); document.head.appendChild(sc);
}
const Students = {
  all(){ return store.get('students', []); },
  cur(){ const id = store.get('curStudent', null); return this.all().find(s=>s.id===id) || this.all()[0] || null; },
  setCur(id){ store.set('curStudent', id); },
  add(name){ const a = this.all(); const s = {id:'s'+Date.now(), name}; a.push(s); store.set('students', a); store.set('curStudent', s.id); return s; },
  rec(sid, n){ const p = store.get('prog', {}); return (p[sid]||{})[n] || {status:'', hw:'', date:'', note:''}; },
  setRec(sid, n, patch){ const p = store.get('prog', {}); p[sid] = p[sid]||{}; p[sid][n] = Object.assign({status:'', hw:'', date:'', note:''}, p[sid][n]||{}, patch); store.set('prog', p); }
};

/* 保存できるか確認し、できない場合は知らせる / 全データのバックアップ */
(function(){
  let ok = true;
  try{ localStorage.setItem('ir:_t','1'); ok = localStorage.getItem('ir:_t')==='1'; localStorage.removeItem('ir:_t'); }catch(e){ ok = false; }
  if(!ok){
    document.addEventListener('DOMContentLoaded', ()=>{
      const b = document.createElement('div');
      b.style.cssText = 'background:#fde5e1;color:#8a1f12;padding:10px 20px;text-align:center;font-size:15px';
      b.textContent = 'このブラウザでは入力内容を保存できません。Google Chrome で index.html を開いてください(プライベートウィンドウや、保存を禁止する設定のときは保存されません)。';
      document.body.prepend(b);
    });
  }
})();
function exportAll(){
  const d = {}; for(let i=0;i<localStorage.length;i++){ const k = localStorage.key(i); if(k.startsWith('ir:')) d[k] = localStorage.getItem(k); }
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(d)],{type:'application/json'}));
  a.download = 'nihongo-backup-'+new Date().toISOString().slice(0,10)+'.json'; a.click();
}
function importAll(file){
  file.text().then(t=>{ try{ const d = JSON.parse(t); if(!confirm('いまの記録を、このファイルの内容に置き換えますか?')) return;
    Object.keys(d).filter(k=>k.startsWith('ir:')).forEach(k=>localStorage.setItem(k,d[k])); toast('復元しました'); setTimeout(()=>location.reload(),600); }catch(e){ alert('ファイルの形式が違います'); } });
}
