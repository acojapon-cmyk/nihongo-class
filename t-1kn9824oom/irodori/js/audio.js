/* 音声パネル: data/audio.js の登録(本冊の活動ごと)+その場で選んだファイル。本冊PDFへのリンクつき */
const OFFICIAL_URL = 'https://www.irodori.jpf.go.jp/';
const AudioPanel = {
  ch: ('BroadcastChannel' in window) ? new BroadcastChannel('ir-present') : null,
  cur: null,
  send(m){ try{ if(this.win && !this.win.closed) this.win.postMessage(m,'*'); }catch(e){} if(this.ch) this.ch.postMessage(m); try{ localStorage.setItem('ir:booksync', JSON.stringify(Object.assign({t:Date.now()},m))); }catch(e){} },
  acked: 0,
  setState(txt,warn){ const l=document.getElementById('bkState'); if(l){ l.textContent=txt; l.style.background=warn?'#fde5e1':'#eef6ec'; l.style.color=warn?'var(--accent)':'var(--green)'; } },
  sendBook(seg,page,N,note){ page=Math.max(1,page); this.cur={seg,page,N}; const t0=Date.now(); this.acked=0; this.setState('送信中…'); this.send({type:'book',seg,page});
    setTimeout(()=>{ if(this.acked<t0){ this.setState('⚠ 生徒画面が応答しません。「生徒画面を開く」を押してください(開いていても古い画面のときは、押し直すと新しくなります)',true); if(typeof toast==='function') toast('生徒画面が応答しません。「生徒画面を開く」を押してください'); } else { this.setState('✔ 生徒画面に表示中: '+(note||'')+' (PDF '+page+'頁)'); if(typeof toast==='function') toast('生徒画面に本冊を出しました'); } },1200); },
  bookOff(){ this.cur=null; this.send({type:'bookoff'}); const l=document.getElementById('bkState'); if(l) l.textContent='生徒画面: スライド表示'; },
  init(){ if(this._i) return; this._i=1; const on=()=>{ this.acked=Date.now(); }; if(this.ch) this.ch.addEventListener('message',e=>{ if(e.data&&e.data.type==='bookack') on(); }); window.addEventListener('storage',e=>{ if(e.key==='ir:bookack') on(); }); window.addEventListener('message',e=>{ if(e.data&&e.data.type==='bookack') on(); }); },
  openStudent(N){ const w=window.open((location.pathname.includes('/pages/')?'../':'')+'present.html?n='+(N||1)+'&_='+Date.now(),'ir-present','width=1280,height=720'); this.win=w; if(!w) alert('ポップアップがブロックされました。許可してください'); else if(this.cur) setTimeout(()=>this.sendBook(this.cur.seg,this.cur.page,this.cur.N),1200); },
  seg(N){ return N===0 ? 'front' : 'L'+String(N).padStart(2,'0'); },
  render(el, N, base){
    base = base || ''; this.init();
    const reg = (window.AUDIO && window.AUDIO[N]) || [];
    const seg = this.seg(N);
    if(!document.getElementById('auStyle')){ const s=document.createElement('style'); s.id='auStyle'; s.textContent='.au{display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:5px 0;border-bottom:1px dashed var(--line)}.au span{min-width:130px;flex:1}.au audio{height:34px;max-width:100%}.au a{font-size:13px;color:var(--blue);white-space:nowrap}details.ag{margin:4px 0}details.ag>summary{cursor:pointer;font-weight:700;padding:4px 0}'; document.head.appendChild(s); }
    const groups = []; reg.forEach(e=>{ let g = groups.find(x=>x.g===e.g); if(!g){ g={g:e.g,items:[]}; groups.push(g); } g.items.push(e); });
    const item = e=>'<div class="au"><span>'+esc(e.t)+'</span><audio controls preload="none" src="'+esc(base+e.f)+'"></audio>'+(e.p?'<button class="small-btn" data-show="'+e.p+'" data-t="'+esc(e.t)+'" title="生徒画面に本冊のこのページを出す">🖥 生徒に表示</button><a href="'+base+'book/book_'+seg+'.pdf#page='+e.p+'" target="_blank" rel="noopener" title="本冊の'+e.o+'ページを開く">📖 p.'+e.o+'</a>':'')+'</div>';
    el.innerHTML =
      '<div class="row" style="margin:0 0 6px;padding:6px 8px;background:#f4efe6;border-radius:10px"><b style="font-size:14px">🖥 生徒画面に 本冊を出す</b><button class="small-btn" id="bkPrev">◀</button><button class="small-btn" id="bkNext">▶</button><button class="small-btn" id="bkOff">スライドに戻す</button><button class="small-btn" id="bkOpen">生徒画面を開く</button><label style="margin:0;font-size:13px"><input type="checkbox" id="bkAuto" style="width:auto"> 再生と同時に出す</label><span class="pill" id="bkState" style="background:#fff;color:var(--muted)">生徒画面: スライド表示</span></div>'+
      '<div class="row" style="margin:0 0 6px"><a href="'+base+'book/book_'+seg+'.pdf" target="_blank" rel="noopener" class="btn" style="padding:5px 12px;border:1px solid var(--line);border-radius:9px;background:#fff">📖 本冊PDF('+(N===0?'前付・教室のことば':'第'+N+'課')+')</a>'+
      '<a href="'+OFFICIAL_URL+'" target="_blank" rel="noopener" style="color:var(--blue);text-decoration:underline;font-size:13px">いろどり公式サイト</a></div>'+
      (reg.length ? groups.map((g,i)=>'<details class="ag" '+(i===0?'open':'')+'><summary>'+esc(g.g||'その他')+' <span class="pill">'+g.items.length+'</span></summary>'+g.items.map(item).join('')+'</details>').join('')
        : '<p class="sub" style="margin:0 0 8px;font-size:14px">この課の音声は登録されていません。</p>')+
      '<div class="row" style="margin:8px 0 2px"><label class="btn" style="margin:0;cursor:pointer;border:1px solid var(--line);border-radius:9px;padding:5px 12px;background:#fff">🎧 ほかの音声ファイルを選ぶ<input type="file" id="aPick" accept="audio/*,.mp3,.m4a,.wav,.ogg" multiple style="display:none"></label></div><div id="aLocal"></div>'+
      '<p class="sub" style="margin:6px 0 0;font-size:12.5px">音声が鳴らないときは、mp3 を <code>audio</code> フォルダの直下に入れてあるか確認してください。Zoom では「コンピューターの音声を共有」にチェックします。</p>';
    const self = this, segN = N;
    el.querySelectorAll('[data-show]').forEach(b=>b.onclick=()=>self.sendBook(seg,+b.dataset.show,N,b.dataset.t));
    el.querySelectorAll('.au audio').forEach((au,k)=>{ const b=au.parentElement.querySelector('[data-show]'); if(b) au.addEventListener('play',()=>{ if(el.querySelector('#bkAuto').checked) self.sendBook(seg,+b.dataset.show,N,b.dataset.t); }); });
    el.querySelector('#bkPrev').onclick=()=>{ if(self.cur) self.sendBook(self.cur.seg,self.cur.page-1,self.cur.N); };
    el.querySelector('#bkNext').onclick=()=>{ if(self.cur) self.sendBook(self.cur.seg,self.cur.page+1,self.cur.N); };
    el.querySelector('#bkOff').onclick=()=>self.bookOff();
    el.querySelector('#bkOpen').onclick=()=>self.openStudent(N);
    el.querySelector('#aPick').onchange = e=>{
      const box = el.querySelector('#aLocal');
      [...e.target.files].sort((a,b)=>a.name.localeCompare(b.name,'ja',{numeric:true})).forEach(f=>{
        const d=document.createElement('div'); d.className='au'; d.innerHTML='<span>'+esc(f.name)+'</span><audio controls src="'+URL.createObjectURL(f)+'"></audio>'; box.appendChild(d);
      }); e.target.value='';
    };
  }
};
