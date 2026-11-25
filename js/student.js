/* 生徒用ページ共通 */
const S = {
  $: id => document.getElementById(id),
  label(n){ const l=(window.LESSON_INDEX||[]).find(x=>x.n===n); if(n===101) return 'ひらがな / Hiragana'; if(n===102) return 'カタカナ / Katakana'; if(n===26) return 'その他 / Others'; return '第'+n+'課 / Lesson '+n+(l?'　'+l.title:''); },
  order(){ const a=(window.LESSON_INDEX||[]).map(l=>l.n); return a.filter(n=>n<100).sort((x,y)=>x-y).concat([101,102].filter(n=>a.includes(n))); },
  cur(){ const q=parseInt(new URLSearchParams(location.search).get('n')); if(q) return q; return parseInt(localStorage.getItem('nj:sLesson')||'1')||1; },
  save(n){ try{ localStorage.setItem('nj:sLesson',String(n)); }catch(e){} },
  header(title){
    const h=document.createElement('header'); h.className='top';
    h.innerHTML='<a class="logo" href="student.html">日本語クラス</a><nav><a href="student.html">← もどる / Back</a></nav>';
    document.body.prepend(h);
    document.title=title+' | 日本語クラス';
  },
  select(el, n, cb){
    el.innerHTML=S.order().map(x=>'<option value="'+x+'">'+esc(S.label(x))+'</option>').join(''); el.value=n;
    el.onchange=()=>{ S.save(+el.value); cb(+el.value); };
  },
  speak(t){ try{ speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(String(t).replace(/\{[^}]*\}/g,'').replace(/[○]/g,'')); u.lang='ja-JP'; u.rate=.85; speechSynthesis.speak(u); }catch(e){} },
  shuffle(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
};
function speak(t){ S.speak(t); }
