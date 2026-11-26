/* 書く練習パッド: うすい見本をなぞる / 自由に書く */
/* 音声: いちばん自然な日本語の声を選ぶ(Microsoft Natural / Google / Apple 高品質を優先) */
function pickJaVoice(){
  const vs=(window.speechSynthesis?speechSynthesis.getVoices():[]).filter(v=>v.lang&&/^ja/i.test(v.lang.replace('_','-')));
  if(!vs.length) return null;
  const score=v=>{const n=v.name; let s=0;
    if(/Natural|Neural|Online/i.test(n)) s+=100;
    if(/Nanami|Keita|Mayu|Naoki|Shiori|Daichi/i.test(n)) s+=20;
    if(/Google/i.test(n)) s+=60;
    if(/Premium|Enhanced|Siri|O-?Ren|Kyoko|Otoya/i.test(n)) s+=40;
    if(/Haruka|Ayumi|Ichiro|Sayaka/i.test(n)) s-=10;
    return s;};
  return vs.slice().sort((a,b)=>score(b)-score(a))[0];
}
if(window.speechSynthesis) speechSynthesis.onvoiceschanged=()=>{};
function ttsText(t){ t=String(t).replace(/\{[^}]*\}/g,'').replace(/[○]/g,'').replace(/[（(][^）)]*[）)]/g,'').replace(/^[A-ZＡ-Ｚ][:：]\s*/,'').replace(/[…‥]+/g,'、').replace(/\s+/g,' ').trim(); if(/^[ぁ-んァ-ヶ]$/.test(t)&&t!=='ー') t=t+'。'; return t; }
function speak(text){
  try{ if(!('speechSynthesis' in window)) { toast('このブラウザは音声に対応していません'); return; }
    const u = new SpeechSynthesisUtterance(ttsText(text)); u.lang='ja-JP'; u.rate=0.9;
    const v = pickJaVoice(); if(v) u.voice=v;
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  }catch(e){}
}
function WritePad(box, size){
  size = size || 320;
  box.innerHTML = '<canvas width="'+size+'" height="'+size+'" style="width:'+size+'px;height:'+size+'px;max-width:100%;border:2px solid var(--ink);border-radius:12px;background:#fff;touch-action:none;cursor:crosshair"></canvas>'+
    '<div class="row" style="margin-top:6px"><button data-a="clear">🧹 消す</button><button data-a="guide" class="on">見本 ON</button></div>';
  const cv = box.querySelector('canvas'), cx = cv.getContext('2d'); let ch = '', guide = true, drawing = false, strokes = [];
  function base(){
    cx.clearRect(0,0,size,size); cx.fillStyle='#fff'; cx.fillRect(0,0,size,size);
    cx.strokeStyle='#e8d8d0'; cx.lineWidth=1; cx.setLineDash([6,6]);
    cx.beginPath(); cx.moveTo(size/2,0); cx.lineTo(size/2,size); cx.moveTo(0,size/2); cx.lineTo(size,size/2); cx.stroke(); cx.setLineDash([]);
    if(guide && ch){ cx.fillStyle='rgba(60,40,30,.13)'; cx.font='700 '+Math.round(size*(ch.length>1?0.5:0.78))+'px "Hiragino Mincho ProN","Yu Mincho","Noto Serif JP",serif'; cx.textAlign='center'; cx.textBaseline='middle'; cx.fillText(ch,size/2,size/2+size*0.03); }
    cx.strokeStyle='#2b2a28'; cx.lineWidth=Math.max(5,size/55); cx.lineCap='round'; cx.lineJoin='round';
    strokes.forEach(s=>{ cx.beginPath(); s.forEach((p,i)=>i?cx.lineTo(p[0],p[1]):cx.moveTo(p[0],p[1])); if(s.length===1) cx.lineTo(s[0][0]+.1,s[0][1]); cx.stroke(); });
  }
  function pos(e){ const r=cv.getBoundingClientRect(); return [(e.clientX-r.left)*size/r.width,(e.clientY-r.top)*size/r.height]; }
  cv.addEventListener('pointerdown',e=>{ drawing=true; cv.setPointerCapture(e.pointerId); strokes.push([pos(e)]); base(); });
  cv.addEventListener('pointermove',e=>{ if(!drawing) return; strokes[strokes.length-1].push(pos(e)); base(); });
  ['pointerup','pointercancel'].forEach(t=>cv.addEventListener(t,()=>{ drawing=false; }));
  box.querySelector('[data-a=clear]').onclick = ()=>{ strokes=[]; base(); };
  const gb = box.querySelector('[data-a=guide]'); gb.onclick = ()=>{ guide=!guide; gb.textContent='見本 '+(guide?'ON':'OFF'); base(); };
  base();
  return { set(c){ ch=c; strokes=[]; base(); } };
}
