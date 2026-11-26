/* 4択クイズ共通エンジン */
const Quiz = {
  shuffle(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; },
  pick(a,n){ return this.shuffle(a).slice(0,n); },
  /* 正解と重ならない不正解を n 個えらぶ */
  distract(correct, pool, n){ n=n||3; const set=[...new Set(pool.filter(x=>x!==correct && x))]; return this.pick(set,n); },
  /* q = {p: 問題(HTML), a: 正解(文字列), o: 選択肢(正解をふくむ配列), speak?: 読み上げ, x?: 説明(HTML)} */
  run(el, qs, onExit){
    let i=0, ok=0, wrong=[], locked=false;
    const draw = ()=>{
      if(i>=qs.length){ return end(); }
      const q = qs[i]; locked=false;
      el.innerHTML = '<div class="row" style="justify-content:space-between"><span class="pill">'+(i+1)+' / '+qs.length+'</span><span class="pill" style="background:#eef6ec;color:var(--green)">○ '+ok+'</span></div>'+
        '<div class="stage" style="min-height:200px;margin:10px 0"><div class="big">'+q.p+'</div>'+(q.speak?'<div><button class="qspk">🔊 きく</button></div>':'')+'</div>'+
        '<div class="qopts">'+Quiz.shuffle(q.o).map(o=>'<button class="qo" data-v="'+esc(o)+'">'+esc(o)+'</button>').join('')+'</div><div id="qfb" style="min-height:56px;margin-top:10px"></div>';
      if(q.speak){ el.querySelector('.qspk').onclick=()=>speak(q.speak); setTimeout(()=>speak(q.speak),250); }
      el.querySelectorAll('.qo').forEach(b=>b.onclick=()=>{
        if(locked) return; locked=true; const good = b.dataset.v===q.a;
        if(good) ok++; else wrong.push(q);
        el.querySelectorAll('.qo').forEach(x=>{ if(x.dataset.v===q.a) x.classList.add('good'); else if(x===b) x.classList.add('bad'); });
        el.querySelector('#qfb').innerHTML = '<div class="row"><b style="font-size:20px;color:'+(good?'var(--green)':'var(--accent)')+'">'+(good?'○ せいかい!':'× こたえ: '+esc(q.a))+'</b>'+(q.x?'<span>'+q.x+'</span>':'')+'<button class="btn-primary" id="qnext">'+(i+1>=qs.length?'けっか':'つぎへ ▶')+'</button></div>';
        if(q.say){ const fb=el.querySelector('#qfb .row'); const sb=document.createElement('button'); sb.textContent='🔊 きく'; sb.onclick=()=>speak(q.say); fb.insertBefore(sb, fb.querySelector('#qnext')); speak(q.say); }
        el.querySelector('#qnext').onclick = ()=>{ i++; draw(); }; el.querySelector('#qnext').focus();
      });
    };
    const end = ()=>{
      const pct = Math.round(ok/qs.length*100);
      el.innerHTML = '<div class="stage"><div class="big">'+ok+' / '+qs.length+'</div><div class="mid">'+(pct>=90?'すばらしい!':pct>=70?'よくできました!':'もう すこし! もういちど やってみよう')+'</div></div>'+
        (wrong.length?'<div class="card" style="margin-top:12px"><h3>まちがえた もんだい</h3>'+wrong.map(q=>'<div class="list-item"><span style="font-size:22px">'+q.p+'</span><b>→ '+esc(q.a)+'</b></div>').join('')+'</div>':'')+
        '<div class="row" style="margin-top:12px;justify-content:center">'+(wrong.length?'<button class="btn-primary" id="rw">まちがいだけ やりなおす</button>':'')+'<button id="ra">もういちど(新しい問題)</button><button id="rb">設定にもどる</button></div>';
      if(wrong.length) el.querySelector('#rw').onclick=()=>Quiz.run(el, Quiz.shuffle(wrong), onExit);
      el.querySelector('#ra').onclick=()=>onExit('again'); el.querySelector('#rb').onclick=()=>onExit('back');
    };
    draw();
  },
  /* 口頭の質問カード: cards = [{p, a(HTML), hint?}] */
  cards(el, cards){
    let i=0, shown=false, ok=0, ng=0;
    const draw=()=>{
      if(i>=cards.length){ el.innerHTML='<div class="stage"><div class="big">おつかれさまでした!</div><div class="mid">○ '+ok+' / × '+ng+'</div></div>'; return; }
      const c=cards[i];
      el.innerHTML='<div class="row"><span class="pill">'+(i+1)+' / '+cards.length+'</span><span class="pill" style="background:#eef6ec;color:var(--green)">○'+ok+' ×'+ng+'</span></div>'+
        '<div class="stage" style="margin:10px 0"><div class="small">'+(c.t||'')+'</div><div class="big">'+c.p+'</div>'+(shown?'<div class="mid" style="color:var(--blue)">'+c.a+'</div>':'')+'</div>'+
        '<div class="row" style="justify-content:center"><button id="cs">🔊 きく</button><button id="cr" class="btn-primary">'+(shown?'かくす':'こたえを みる')+'</button><button id="co" style="color:var(--green)">○ できた</button><button id="cn" style="color:var(--accent)">× もう一回</button><button id="cx">とばす ▶</button></div>';
      el.querySelector('#cs').onclick=()=>speak(c.speak||c.pt||'');
      el.querySelector('#cr').onclick=()=>{ shown=!shown; draw(); };
      el.querySelector('#co').onclick=()=>{ ok++; i++; shown=false; draw(); };
      el.querySelector('#cn').onclick=()=>{ ng++; cards.push(c); i++; shown=false; draw(); };
      el.querySelector('#cx').onclick=()=>{ i++; shown=false; draw(); };
    };
    draw();
  }
};
