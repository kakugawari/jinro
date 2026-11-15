'use strict';
/* ========== 役職 ========== */
const R={
  wolf:{n:'<ruby>人狼<rt>じんろう</rt></ruby>',t:'人狼',team:'wolf',c:'#c0392b',
    d:'夜に ひとりを おそう。なかまの 人狼が だれか わかる。<br>人間の数を 人狼と同じまで へらせば かち。'},
  madman:{n:'<ruby>狂人<rt>きょうじん</rt></ruby>',t:'狂人',team:'wolf',c:'#8e3a6b',
    d:'人間だけど 人狼の みかた。人狼チームが かてば かち。<br>だれが 人狼かは わからない。うらなわれても「人間」と出る。'},
  seer:{n:'<ruby>占い師<rt>うらないし</rt></ruby>',t:'占い師',team:'village',c:'#5b4aa0',
    d:'夜に ひとりを うらなって、その人が 人狼かどうかが わかる。'},
  medium:{n:'<ruby>霊媒師<rt>れいばいし</rt></ruby>',t:'霊媒師',team:'village',c:'#2f7a78',
    d:'夜に、その日 ついほうされた人が 人狼だったかどうかが わかる。'},
  knight:{n:'<ruby>騎士<rt>きし</rt></ruby>',t:'騎士',team:'village',c:'#3a6aa8',
    d:'夜に ひとりを 人狼から まもる。自分は まもれない。'},
  villager:{n:'<ruby>村人<rt>むらびと</rt></ruby>',t:'村人',team:'village',c:'#7a6a4a',
    d:'とくべつな 力は ない。話しあいで 人狼を 見つけだそう。'}
};
const SET_ROLES=['wolf','madman','seer','medium','knight'];
/* おすすめ配役 [人狼,狂人,占い師,霊媒師,騎士] */
const REC={4:[1,0,1,0,0],5:[1,0,1,0,1],6:[1,1,1,0,1],7:[2,0,1,0,1],8:[2,0,1,1,1],9:[2,1,1,1,1],10:[2,1,1,1,1],11:[3,1,1,1,1],12:[3,1,1,1,1]};

function icon(r,size=40,col){
  const c=col||'currentColor';
  const P={
    wolf:`<path d="M20 34 L30 8 L43 27 L57 27 L70 8 L80 34 L82 56 Q80 80 50 93 Q20 80 18 56 Z" fill="${c}" fill-opacity=".12"/><path d="M20 34 L30 8 L43 27 L57 27 L70 8 L80 34 L82 56 Q80 80 50 93 Q20 80 18 56 Z"/><path d="M32 49 L44 54 M68 49 L56 54"/><path d="M44 72 L56 72 L50 79 Z" fill="${c}"/>`,
    madman:`<path d="M18 28 Q50 8 82 28 Q88 70 50 93 Q12 70 18 28 Z" fill="${c}" fill-opacity=".12"/><path d="M18 28 Q50 8 82 28 Q88 70 50 93 Q12 70 18 28 Z"/><circle cx="36" cy="46" r="6" fill="${c}"/><path d="M58 42 L72 48"/><path d="M32 64 Q52 84 70 60"/>`,
    seer:`<circle cx="50" cy="44" r="29" fill="${c}" fill-opacity=".12"/><circle cx="50" cy="44" r="29"/><path d="M30 80 L70 80 L64 92 L36 92 Z"/><path d="M42 34 Q44 42 52 44 Q44 46 42 54 Q40 46 32 44 Q40 42 42 34 Z" fill="${c}" stroke-width="2"/>`,
    medium:`<rect x="38" y="46" width="24" height="44" rx="3" fill="${c}" fill-opacity=".12"/><rect x="38" y="46" width="24" height="44" rx="3"/><path d="M50 10 Q66 28 50 40 Q34 28 50 10 Z" fill="${c}" fill-opacity=".3"/><path d="M50 40 V46"/><path d="M22 30 Q16 22 24 16 M78 30 Q84 22 76 16"/>`,
    knight:`<path d="M50 8 L84 20 L80 55 Q75 80 50 93 Q25 80 20 55 L16 20 Z" fill="${c}" fill-opacity=".12"/><path d="M50 8 L84 20 L80 55 Q75 80 50 93 Q25 80 20 55 L16 20 Z"/><path d="M50 28 V74 M33 46 H67"/>`,
    villager:`<path d="M14 50 L50 16 L86 50 V90 H14 Z" fill="${c}" fill-opacity=".12"/><path d="M14 50 L50 16 L86 50 V90 H14 Z"/><path d="M42 90 V64 H58 V90"/>`
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${P[r]}</svg>`;
}

/* ========== 保存 ========== */
const LS='kakugawari-jinro-v1';
const S={count:6,names:Array.from({length:12},(_,i)=>`プレイヤー${i+1}`),roles:{wolf:1,madman:1,seer:1,medium:0,knight:1},
  firstAttack:false,talkMin:3,sound:true,voice:true};
let G=null;
function load(){try{const d=JSON.parse(localStorage.getItem(LS)||'{}');
  if(d.S){Object.assign(S,d.S);S.roles=Object.assign({wolf:1,madman:0,seer:1,medium:0,knight:0},d.S.roles||{});}
  if(d.G)G=d.G;}catch(e){}}
function save(){try{localStorage.setItem(LS,JSON.stringify({S,G}))}catch(e){}}

/* ========== 音 ========== */
let AC=null;
function ac(){if(!S.sound)return null;if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)()}catch(e){return null}}
  if(AC.state==='suspended')AC.resume();return AC}
function tone(f,t0,dur,type='sine',vol=.2,f2){const a=ac();if(!a)return;const t=a.currentTime+t0;
  const o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f,t);
  if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dur);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.015);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g).connect(a.destination);o.start(t);o.stop(t+dur+.05)}
function noise(dur,vol,freq,t0=0){const a=ac();if(!a)return;const n=Math.floor(a.sampleRate*dur);
  const b=a.createBuffer(1,n,a.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,2);
  const s=a.createBufferSource();s.buffer=b;const f=a.createBiquadFilter();f.type='bandpass';f.frequency.value=freq;f.Q.value=.8;
  const g=a.createGain();g.gain.value=vol;s.connect(f).connect(g).connect(a.destination);s.start(a.currentTime+t0)}
const SFX={
  tap(){tone(620,0,.06,'triangle',.07)},
  sel(){tone(880,0,.09,'sine',.1)},
  ok(){tone(660,0,.12,'sine',.13);tone(990,.09,.2,'sine',.13)},
  flip(){noise(.3,.5,2600)},
  howl(){const a=ac();if(!a)return;const t=a.currentTime;
    const o=a.createOscillator(),g=a.createGain(),lf=a.createOscillator(),lg=a.createGain(),fl=a.createBiquadFilter();
    o.type='triangle';fl.type='lowpass';fl.frequency.value=1400;
    o.frequency.setValueAtTime(250,t);o.frequency.exponentialRampToValueAtTime(540,t+.8);o.frequency.setValueAtTime(540,t+1.5);
    o.frequency.exponentialRampToValueAtTime(290,t+3);lf.frequency.value=5.5;lg.gain.value=9;lf.connect(lg).connect(o.frequency);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.16,t+.5);g.gain.setValueAtTime(.16,t+2);
    g.gain.exponentialRampToValueAtTime(.0001,t+3.2);o.connect(fl).connect(g).connect(a.destination);
    o.start(t);lf.start(t);o.stop(t+3.3);lf.stop(t+3.3)},
  chirp(){for(let k=0;k<3;k++)tone(2300,k*.14,.08,'sine',.07,3400);for(let k=0;k<2;k++)tone(2700,.75+k*.12,.07,'sine',.06,3900)},
  bell(){[1,2.76,5.4].forEach((m,i)=>tone(523*m,0,1.8/(i+1),'sine',.16/(i+1)))},
  drum(){tone(120,0,.7,'sine',.55,42);noise(.18,.6,700)},
  win(){[523,659,784,1047].forEach((f,i)=>tone(f,i*.13,.5,'triangle',.14))},
  dark(){[392,311,262,196].forEach((f,i)=>tone(f,i*.2,.6,'triangle',.13))},
  tick(){tone(1200,0,.03,'square',.03)}
};
function say(t){if(!S.voice||!('speechSynthesis' in window))return;try{speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(t);u.lang='ja-JP';u.rate=1;speechSynthesis.speak(u)}catch(e){}}

/* ========== 道具 ========== */
const $=s=>document.querySelector(s);
const app=$('#app');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const nm=i=>esc(G.players[i].name);
const alive=()=>G.players.map((p,i)=>p.alive?i:-1).filter(i=>i>=0);
const aliveWolves=()=>alive().filter(i=>G.players[i].role==='wolf');
function villagers(){return S.count-SET_ROLES.reduce((s,r)=>s+S.roles[r],0)}
function validate(){const v=villagers(),w=S.roles.wolf;
  if(v<0)return 'やくわりが 人数より 多いです';
  if(w<1)return '人狼は 1人以上 にしてね';
  if(w*2>=S.count)return '人狼が 多すぎます(人数の半分より 少なく)';
  return ''}
function checkWin(){const w=aliveWolves().length,h=alive().length-w;
  if(w===0)return 'village';if(w>=h)return 'wolf';return null}
let tmp=null; /* 選択中 */
let keepScroll=false;

/* ========== 背景 ========== */
(function stars(){const mk=(n,max)=>Array.from({length:n},()=>`${Math.random()*innerWidth|0}px ${Math.random()*innerHeight*.75|0}px 0 rgba(255,250,230,${(.3+Math.random()*.7).toFixed(2)})`).join(',');
  $('#stars').style.boxShadow=mk(90);$('#stars2').style.boxShadow=mk(22)})();
function setMode(m){document.body.className=m}

/* ========== 画面 ========== */
let view='title';
function render(){
  clearInterval(timerIv);
  const sc=app.scrollTop;let html,mode='night';
  if(view==='title')html=vTitle();
  else if(view==='setup'){html=vSetup();mode='day'}
  else if(view==='rules'){html=vRules();mode='day'}
  else if(view==='ssetup'){html=vSSetup();mode='day'}
  else{const r=vGame();html=r.html;mode=r.mode}
  setMode(mode);
  app.innerHTML=html;
  app.scrollTop=keepScroll?sc:0;keepScroll=false;
  if(view==='game'&&G.phase==='talk')startTimerUI();
  if(view==='game'&&G.phase==='sTalk'){qBusy=false;pumpGen++;const f=$('#feed');if(f)f.scrollTop=1e6;pump();updTalkBar()}
}
function topbar(t){return `<div class="top"><span class="ttl">${t}</span><button class="menu-btn" data-act="menu" aria-label="メニュー">☰</button></div>`}

function vTitle(){
  const cont=G&&G.phase!=='end';
  return `<div class="scr center fade">
    <h1 class="logo">人狼</h1><div class="logo-sub">じんろう</div>
    <div class="tagline">うそつきは だれだ?</div>
    <div class="grow"></div>
    ${cont?`<button class="btn kin" data-act="resume">つづきから(${G.day}日目)</button>`:''}
    <button class="mode-card main" data-act="to-ssetup"><b>🤖 コンピュータと あそぶ</b><span>ひとりで、どうぶつたちと 人狼</span></button>
    <button class="mode-card" data-act="to-setup"><b>👥 みんなで あそぶ</b><span>スマホ1台を じゅんばんに まわす</span></button>
    <button class="btn sub" data-act="to-rules" style="margin-top:10px">あそびかた</button>
    <div class="toggles">
      <button class="tg ${S.sound?'':'off'}" data-act="tg-sound">♪ 音 ${S.sound?'オン':'オフ'}</button>
      <button class="tg ${S.voice?'':'off'}" data-act="tg-voice">🗣 よみあげ ${S.voice?'オン':'オフ'}</button>
    </div>
  </div>`}

function vSetup(){
  const n=S.count,v=villagers(),err=validate();
  let names='';for(let i=0;i<n;i++)names+=`<div class="nrow"><span class="num">${i+1}</span><input data-name="${i}" value="${esc(S.names[i])}" maxlength="8" placeholder="なまえ" enterkeyhint="next"></div>`;
  const rrows=SET_ROLES.map(r=>`<div class="srow"><div class="rl">${icon(r,28,R[r].c)}${R[r].n}</div>
    <div class="step"><button data-act="role" data-arg="${r},-1">−</button><b>${S.roles[r]}</b><button data-act="role" data-arg="${r},1">＋</button></div></div>`).join('');
  return `<div class="scr fade">
    <div class="top"><button class="menu-btn" data-act="to-title" aria-label="もどる">‹</button><span class="ttl">じゅんび</span><span style="width:44px"></span></div>
    <div class="card"><div class="srow"><div class="rl" style="font-weight:700">あそぶ人数</div>
      <div class="step"><button data-act="count" data-arg="-1">−</button><b>${n}</b><button data-act="count" data-arg="1">＋</button></div></div></div>
    <div class="card"><h3>なまえ(すわっている じゅんに)</h3>${names}</div>
    <div class="card"><div style="display:flex;justify-content:space-between;align-items:center"><h3 style="margin:0">やくわり</h3>
      <button class="linkbtn" data-act="rec">おすすめにする</button></div>
      ${rrows}
      <div class="srow"><div class="rl">${icon('villager',28,R.villager.c)}${R.villager.n}</div><div class="step"><b style="${v<0?'color:var(--shu)':''}">${v}</b><span class="small" style="width:46px">のこり</span></div></div>
    </div>
    <div class="card">
      <div class="srow"><div class="rl" style="font-size:15px">1日目の夜から おそう</div><button class="sw ${S.firstAttack?'on':''}" data-act="first" aria-label="1日目の夜からおそう"></button></div>
      <div class="srow"><div class="rl" style="font-size:15px">話しあいの 時間</div>
        <div class="step"><button data-act="talk" data-arg="-1">−</button><b>${S.talkMin}</b><span>分</span><button data-act="talk" data-arg="1">＋</button></div></div>
    </div>
    <div class="err">${err}</div>
    <button class="btn" data-act="start" ${err?'disabled':''}>はじめる</button>
  </div>`}

function vRules(){
  const rr=['wolf','madman','seer','medium','knight','villager'].map(r=>`<div class="rrow">${icon(r,34,R[r].c)}<div><div class="rn2">${R[r].n}<span class="small" style="margin-left:8px">${R[r].team==='wolf'?'人狼チーム':'村人チーム'}</span></div><div class="rd2">${R[r].d}</div></div></div>`).join('');
  return `<div class="scr fade rules">
    <div class="top"><button class="menu-btn" data-act="${G&&view==='rules'&&rulesBack==='game'?'rules-back':'to-title'}" aria-label="もどる">‹</button><span class="ttl">あそびかた</span><span style="width:44px"></span></div>
    <div class="card"><h3>どんなゲーム?</h3>
      <p>村の中に、人間に なりすました <b>人狼</b>が かくれています。村人チームは 話しあいで 人狼を 見つけて ついほうしよう。人狼チームは 正体が ばれないように 村人を へらそう。</p></div>
    <div class="card"><h3>すすめかた</h3><ol>
      <li><b>やくわり</b>:スマホを じゅんに まわして、自分の やくわりを こっそり 見る。</li>
      <li><b>夜</b>:また じゅんに まわす。人狼は おそう人、占い師は うらなう人…と、それぞれ ないしょで えらぶ。村人も「あやしい人」を えらぶので、だれが 何の役か わからない。</li>
      <li><b>朝</b>:人狼に おそわれた人が 発表される。おそわれた人は もう しゃべれない。</li>
      <li><b>昼</b>:みんなで 話しあって、だれが 人狼か 考える。</li>
      <li><b>投票</b>:スマホを まわして ないしょで 投票。いちばん 多かった人が ついほう。同じ数なら もういちど、それでも同じなら くじびき。</li>
      <li>夜 → 朝 → 昼 → 投票 を くりかえす。</li></ol></div>
    <div class="card"><h3>コンピュータと あそぶ</h3><p>ひとりで どうぶつたちと 対戦。話しあいでは どうぶつたちが 占いの けっかを 言ったり、あやしい人を 言ったりします。あなたも「発言する」で うたがったり、占い師だと 名のったり(うそも OK!)できます。やられたあとは ゆうれいになって、みんなの 正体が 見えます。</p></div>
    <div class="card"><h3>かちまけ</h3>
      <p>人狼が 全員 いなくなったら <b>村人チームの かち</b>。<br>人狼の数が のこりの 人間と 同じに なったら <b>人狼チームの かち</b>。</p></div>
    <div class="card"><h3>やくわり</h3>${rr}</div>
  </div>`}
let rulesBack=null;

/* ---------- ゲーム中 ---------- */
function passScreen(name,act,sub,title){
  return `<div class="scr center fade">${topbar(title)}
    <div class="small">${sub}</div>
    <div class="passicon">${icon('villager',90)}</div>
    <p class="lead">スマホを わたしてね</p>
    <div class="bigname">${name}</div><div class="san">さん</div>
    <div class="grow"></div>
    <button class="btn kin" data-act="${act}">わたしが ${name} です</button>
    <p class="hint">ほかの人は 画面を 見ないでね</p></div>`}

function vGame(){
  if(G.solo&&G.phase!=='end')return vSolo();
  const ph=G.phase,day=G.day;
  const dayMode={morning:1,talk:1,voteIntro:1,vote:1,tally:1,exec:1,end:1};
  const mode=dayMode[ph]?'day':'night';
  let h='';
  if(ph==='reveal'){
    const p=G.players[G.idx];
    if(G.sub==='pass')h=passScreen(nm(G.idx),'reveal-me',`${G.idx+1} / ${G.players.length}`,'やくわり かくにん');
    else{
      const r=p.role;let extra='';
      if(r==='wolf'){const m=G.players.map((q,i)=>q.role==='wolf'&&i!==G.idx?i:-1).filter(i=>i>=0);
        extra=`<div class="card" style="margin-top:4px"><div class="small">なかまの 人狼</div><div style="font-size:20px;font-weight:700;margin-top:4px">${m.length?m.map(nm).join('、'):'いない(ひとりだけ)'}</div></div>`}
      h=`<div class="scr center">${topbar('やくわり かくにん')}
        <div class="small">${nm(G.idx)} さんの やくわり</div>
        <div class="flipwrap" data-act="flip">
          <div class="flipper">
            <div class="face back"><div class="bk">タップで めくる</div></div>
            <div class="face front"><div class="band" style="background:${R[r].c}"></div>
              <div class="ic">${icon(r,'100%',R[r].c)}</div>
              <div class="rn">${R[r].n}</div>
              <div class="team" style="background:${R[r].team==='wolf'?'var(--shu)':'var(--ai)'}">${R[r].team==='wolf'?'人狼チーム':'村人チーム'}</div>
              <div class="rd">${R[r].d}</div></div>
          </div></div>
        <div class="after">${extra}
          <button class="btn" data-act="reveal-done" style="margin-top:14px">おぼえた!とじる</button></div>
      </div>`}
  }
  else if(ph==='nightIntro'){
    h=`<div class="scr center fade">${topbar(`${day}日目`)}
      <div class="moonbig"></div><div class="daylabel">${day}日目の 夜</div>
      <p class="msg">夜に なりました。<br>ひとりずつ スマホを まわして、<br>自分の 番を しよう。</p>
      ${day===1&&!G.firstAttack?'<p class="small">さいしょの夜は、人狼は おそいません</p>':''}
      <div class="grow"></div>
      <button class="btn kin" data-act="night-begin">はじめる</button></div>`}
  else if(ph==='night'){
    const pi=G.order[G.idx];
    if(G.sub==='pass')h=passScreen(nm(pi),'night-me',`${G.idx+1} / ${G.order.length}`,`${day}日目の夜`);
    else if(G.sub==='result'){
      const t=G.seerRes,isW=G.players[t].role==='wolf';
      h=`<div class="scr center fade">${topbar(`${day}日目の夜`)}
        <div class="roletag">${icon('seer',22)} うらないの けっか</div>
        <div class="bigname" style="font-size:36px;margin-top:8vh">${nm(t)}</div><div class="san">さんは…</div>
        <div class="verdict ${isW?'w':'h'}">${isW?'人狼':'人間'}</div>
        <p class="msg">${isW?'でした!':'でした。'}</p>
        <div class="grow"></div>
        <button class="btn" data-act="night-next">おぼえた!とじる</button></div>`}
    else h=vNightAct(pi);
  }
  else if(ph==='morning'){
    const m=G.morning,noAtk=m.noAttack;
    const body=m.victim!=null
      ?`<div class="bigname">${nm(m.victim)}</div><div class="san">さんが</div><p class="msg">人狼に おそわれました…<br><span class="small">${nm(m.victim)} さんは、もう 話せません</span></p>`
      :`<p class="msg" style="margin-top:3vh">${noAtk?'しずかな 夜でした。':'へいわな 朝です!'}<br>だれも おそわれませんでした。</p>`;
    h=`<div class="scr center fade">${topbar(`${day}日目`)}
      <div class="sunbig"></div><div class="daylabel">${day}日目の 朝</div>
      ${body}${chips()}
      <div class="grow"></div>
      ${G.winner?'<button class="btn" data-act="to-end">けっかを 見る</button>':'<button class="btn" data-act="talk-begin">話しあいを はじめる</button>'}</div>`}
  else if(ph==='talk'){
    h=`<div class="scr center fade">${topbar(`${day}日目 昼`)}
      <div class="daylabel" style="font-size:24px;margin-top:0">話しあい</div>
      <div class="timer" id="timer"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="none" stroke="rgba(120,90,40,.15)" stroke-width="6"/>
        <circle id="ring" cx="50" cy="50" r="44" fill="none" stroke="var(--shu)" stroke-width="6" stroke-linecap="round" stroke-dasharray="276.46" stroke-dashoffset="0"/></svg>
        <div class="t" id="tt">0:00</div></div>
      <div class="row2"><button class="btn sub" id="tp" data-act="t-pause">${G.talkRun?'いったん とめる':'スタート'}</button><button class="btn sub" data-act="t-add">+1分</button></div>
      ${chips()}
      <p class="small">だれが あやしい? 占い師や 霊媒師は 名のりでる?</p>
      <div class="grow"></div>
      <button class="btn" data-act="vote-intro">投票へ すすむ</button></div>`}
  else if(ph==='voteIntro'){
    const v=G.vote;
    h=`<div class="scr center fade">${topbar(`${day}日目 投票`)}
      <div class="daylabel">${v.round===2?'決選投票':'投票の 時間'}</div>
      ${v.round===2?`<p class="msg">同じ票数でした。<br>この人たちの中から えらびます</p><div class="chips">${v.cands.map(i=>`<span class="chip">${nm(i)}</span>`).join('')}</div>`
        :'<p class="msg">ひとりずつ スマホを まわして、<br>ついほうしたい人に ないしょで 投票します。</p>'}
      <div class="grow"></div>
      <button class="btn" data-act="vote-begin">投票を はじめる</button></div>`}
  else if(ph==='vote'){
    const v=G.vote,pi=v.voters[v.idx];
    if(G.sub==='pass')h=passScreen(nm(pi),'vote-me',`${v.idx+1} / ${v.voters.length}`,`${day}日目 ${v.round===2?'決選投票':'投票'}`);
    else{const opts=v.cands.filter(i=>i!==pi);
      h=`<div class="scr center fade">${topbar(`${day}日目 投票`)}
        <div class="roletag">🗳 ${nm(pi)} さんの 投票</div>
        <p class="msg">ついほうしたい人を えらんでね</p>
        ${pickGrid(opts)}
        <div class="grow"></div>
        <button class="btn" id="decide" data-act="vote-decide" disabled>けってい</button></div>`}
  }
  else if(ph==='tally'){
    const T=G.tally,max=Math.max(...Object.values(T.counts));
    const bars=Object.entries(T.counts).sort((a,b)=>b[1]-a[1]).map(([i,c])=>`<div class="bar ${c===max?'top':''}"><div class="nm">${nm(+i)}</div><div class="bg"><div class="fg" data-w="${c/G.vote.voters.length*100}"></div></div><div class="ct">${c}</div></div>`).join('');
    const vl=Object.entries(G.vote.votes).map(([a,b])=>`<div>${nm(+a)} → <b>${nm(b)}</b></div>`).join('');
    let res='',btn='';
    if(T.type==='exec'){res=`<p class="msg"><b>${nm(T.who)}</b> さんが いちばん 多い</p>`;btn='<button class="btn" data-act="to-exec">つぎへ</button>'}
    else if(T.type==='runoff'){res='<p class="msg">同じ票数です!<br>決選投票を します</p>';btn='<button class="btn" data-act="runoff">決選投票へ</button>'}
    else{res='<p class="msg">また 同じ票数…<br>くじびきで きめます</p><div class="lot" id="lot">?</div>';btn='<button class="btn" id="lotbtn" data-act="lottery">くじを ひく</button>'}
    h=`<div class="scr center fade">${topbar(`${day}日目 投票`)}
      <div class="daylabel" style="font-size:24px;margin-top:0">投票の けっか</div>
      <div class="card">${bars}</div>
      <details class="card" style="text-align:left"><summary class="small">だれが だれに 入れた?</summary><div class="vlist" style="margin-top:8px">${vl}</div></details>
      ${res}<div class="grow"></div>${btn}</div>`}
  else if(ph==='exec'){
    h=`<div class="scr center fade">${topbar(`${day}日目 夕方`)}
      <div class="daylabel">ついほう</div>
      <div class="bigname" style="margin-top:4vh">${nm(G.lastExec)}</div><div class="san">さんが</div>
      <p class="msg">村から ついほう されました。</p>
      ${chips()}
      <div class="grow"></div>
      ${G.winner?'<button class="btn" data-act="to-end">けっかを 見る</button>':'<button class="btn ai" data-act="to-night">夜に なる</button>'}</div>`}
  else if(ph==='end'){
    const wW=G.winner==='wolf';
    const pl=G.players.map(p=>{const won=(R[p.role].team==='wolf')===wW;
      return `<div class="pr">${icon(p.role,34,R[p.role].c)}<div class="pn">${p.av?AVH(p)+' ':''}${esc(p.name)}${p.me?'(あなた)':''}<div class="st">${R[p.role].t}・${p.alive?'生きのこり':'しぼう'}</div></div>${won?'<span class="win">かち</span>':''}</div>`}).join('');
    const lg=G.log.map(l=>l.type==='night'
      ?`<div>🌙 ${l.day}日目の夜:${l.victim!=null?`${nm(l.victim)} が おそわれた`:(l.guarded?`騎士が ${nm(l.guarded-1)} を まもった!`:'だれも おそわれず')}</div>`
      :`<div>☀️ ${l.day}日目の昼:${nm(l.who)}(${R[G.players[l.who].role].t})を ついほう</div>`).join('');
    h=`<div class="scr center fade">${topbar('けっか')}
      <div class="banner ${wW?'w':'v'}">${wW?'人狼チームの かち!':'村人チームの かち!'}</div>
      <div class="card plist">${pl}</div>
      <div class="card"><h3>きろく</h3><div class="log">${lg||'—'}</div></div>
      <button class="btn" data-act="again">同じメンバーで もういちど</button>
      <button class="btn sub" data-act="quit-end">タイトルへ</button></div>`}
  return {html:h,mode};
}

function chips(){return `<div class="chips">${G.players.map(p=>`<span class="chip ${p.alive?'':'dead'}">${esc(p.name)}</span>`).join('')}</div>`}
function pickGrid(list){return `<div class="pick">${list.map(i=>`<button data-act="pick" data-arg="${i}">${nm(i)}</button>`).join('')}</div>`}

function vNightAct(pi){
  const p=G.players[pi],r=p.role,day=G.day,noAtk=day===1&&!G.firstAttack;
  const others=alive().filter(i=>i!==pi);
  let body='',btn='<button class="btn" id="decide" data-act="night-decide" disabled>けってい</button>';
  const done='<button class="btn" data-act="night-next">とじる</button>';
  if(r==='wolf'){
    const mates=aliveWolves().filter(i=>i!==pi);
    body+=`<p class="small">なかまの 人狼:${mates.length?mates.map(nm).join('、'):'いない'}</p>`;
    if(noAtk){body+=`<p class="msg">さいしょの 夜は おそいません。<br>なかまの 顔を おぼえておこう。</p><p class="small">(ほかの人に ばれないよう、少し 時間を つかってから とじてね)</p>`;btn=done}
    else{
      const picks=mates.filter(i=>G.night.wolf[i]!=null).map(i=>`${nm(i)} → <b>${nm(G.night.wolf[i])}</b>`);
      if(picks.length)body+=`<div class="card memo">なかまの えらび<br>${picks.join('<br>')}</div>`;
      body+=`<p class="msg">今夜 おそう人を えらんでね</p>${pickGrid(alive().filter(i=>G.players[i].role!=='wolf'))}`;
      if(mates.length)body+='<p class="small">えらびが ちがうときは、多いほう(同じなら ランダム)に なるよ</p>';
    }
  }else if(r==='seer'){
    if(p.memo&&p.memo.length)body+=`<div class="card memo">これまでの うらない<br>${p.memo.map(m=>`${nm(m.t)}:<span class="${m.w?'w':'h'}">${m.w?'人狼':'人間'}</span>`).join('<br>')}</div>`;
    body+=`<p class="msg">うらなう人を えらんでね</p>${pickGrid(others)}`;
  }else if(r==='knight'){
    body+=`<p class="msg">今夜 まもる人を えらんでね</p>${pickGrid(others)}`;
    if(noAtk)body+='<p class="small">(さいしょの夜は おそわれないけど、えらんでね)</p>';
  }else if(r==='medium'){
    let res;
    if(G.lastExecDay===day-1&&G.lastExec!=null){const w=G.players[G.lastExec].role==='wolf';
      if(!p.memo)p.memo=[];if(!p.memo.some(m=>m.day===day))p.memo.push({day,t:G.lastExec,w});
      res=`<div class="bigname" style="font-size:32px">${nm(G.lastExec)}</div><div class="san">さんは…</div><div class="verdict ${w?'w':'h'}">${w?'人狼':'人間'}</div><p class="msg">${w?'でした!':'でした。'}</p>`;
    }else res='<p class="msg" style="margin-top:4vh">今日は まだ<br>ついほうされた人が いません。</p>';
    const old=(p.memo||[]).filter(m=>m.day!==day);
    body+=res+(old.length?`<div class="card memo">これまで<br>${old.map(m=>`${nm(m.t)}:<span class="${m.w?'w':'h'}">${m.w?'人狼':'人間'}</span>`).join('<br>')}</div>`:'');
    btn=done;
  }else{
    body+=`<p class="msg">あやしいと 思う人を えらんでね</p>${pickGrid(others)}<p class="small">${r==='madman'?'あなたは 人狼の みかた。人狼が だれかは わからないよ。':'(だれにも ないしょ。何も おきないよ)'}</p>`;
  }
  return `<div class="scr center fade">${topbar(`${day}日目の夜`)}
    <div class="roletag">${icon(r,22)} あなたは ${R[r].n}</div>
    ${body}<div class="grow"></div>${btn}</div>`;
}

/* ========== 進行 ========== */
function go(ph){G.phase=ph;G.sub='pass';tmp=null;save();render()}
function startGame(){
  const n=S.count,roles=[];
  SET_ROLES.forEach(r=>{for(let i=0;i<S.roles[r];i++)roles.push(r)});
  while(roles.length<n)roles.push('villager');
  shuffle(roles);
  const used={};
  G={players:S.names.slice(0,n).map((s,i)=>{let name=(s||'').trim()||`プレイヤー${i+1}`;
      if(used[name]){used[name]++;name+=used[name]}else used[name]=1;
      return {name,role:roles[i],alive:true}}),
    day:1,phase:'reveal',sub:'pass',idx:0,firstAttack:S.firstAttack,talkSec:S.talkMin*60,log:[],lastExec:null,lastExecDay:0,winner:null};
  view='game';save();render();
}
function toNight(){G.phase='nightIntro';save();render();SFX.howl();
  say(`${G.day}日目の夜に なりました。ひとりずつ スマホを まわして、自分の番を してください。`)}
function resolveNight(){
  const noAtk=G.day===1&&!G.firstAttack;let victim=null,guarded=0;
  if(!noAtk){const cnt={};Object.values(G.night.wolf).forEach(t=>cnt[t]=(cnt[t]||0)+1);
    const mx=Math.max(0,...Object.values(cnt)),top=Object.keys(cnt).filter(k=>cnt[k]===mx).map(Number);
    if(top.length)victim=top[Math.floor(Math.random()*top.length)];
    if(victim!=null&&victim===G.night.guard){guarded=victim+1;victim=null}}
  if(victim!=null)G.players[victim].alive=false;
  G.morning={victim,noAttack:noAtk};
  G.log.push({type:'night',day:G.day,victim,guarded});
  G.winner=checkWin();
  G.phase='morning';save();render();SFX.chirp();
  say(`朝に なりました。`+(victim!=null?`${G.players[victim].name}さんが、人狼に おそわれました。`:`だれも おそわれませんでした。`));
}
function finishVote(){
  const v=G.vote,counts={};Object.values(v.votes).forEach(t=>counts[t]=(counts[t]||0)+1);
  const mx=Math.max(...Object.values(counts)),tied=Object.keys(counts).filter(k=>counts[k]===mx).map(Number);
  if(tied.length===1)G.tally={counts,type:'exec',who:tied[0]};
  else if(v.round===1)G.tally={counts,type:'runoff',tied};
  else G.tally={counts,type:'lottery',tied,who:tied[Math.floor(Math.random()*tied.length)]};
  G.phase=G.solo?'sTally':'tally';save();render();SFX.bell();
  requestAnimationFrame(()=>requestAnimationFrame(()=>document.querySelectorAll('.fg').forEach(e=>e.style.width=e.dataset.w+'%')));
}
function execute(){
  const w=G.tally.who;G.players[w].alive=false;G.lastExec=w;G.lastExecDay=G.day;
  G.log.push({type:'exec',day:G.day,who:w});G.winner=checkWin();
  G.phase=G.solo?'sExec':'exec';save();render();SFX.drum();
  say(`${G.players[w].name}さんが、村から ついほうされました。`);
}

/* タイマー */
let timerIv=null;
function talkLeft(){return G.talkRun?Math.max(0,(G.talkEndAt-Date.now())/1000):G.talkLeftSec}
function startTimerUI(){let lastS=-1;
  const up=()=>{const l=talkLeft(),s=Math.ceil(l);const tt=$('#tt'),ring=$('#ring');if(!tt)return;
    tt.textContent=`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
    ring.style.strokeDashoffset=(276.46*(1-l/G.talkTotal)).toFixed(1);
    if(G.talkRun&&s!==lastS&&s<=10&&s>0)SFX.tick();
    if(G.talkRun&&l<=0){G.talkRun=false;G.talkLeftSec=0;save();$('#timer').classList.add('end');$('#tp').textContent='おわり';SFX.bell();say('話しあいの 時間が おわりました。投票に すすみましょう。')}
    lastS=s};
  up();timerIv=setInterval(up,200);if(talkLeft()<=0)$('#timer').classList.add('end')}

/* ========== 操作 ========== */
const ACT={
  'to-setup'(){view='setup';render()},
  'to-title'(){view='title';render()},
  'to-rules'(){rulesBack=null;view='rules';render()},
  'rules-back'(){view='game';render()},
  'resume'(){view='game';render()},
  'tg-sound'(){S.sound=!S.sound;save();render();SFX.tap()},
  'tg-voice'(){S.voice=!S.voice;save();render();if(S.voice)say('よみあげ オン')},
  count(a){const n=Math.min(12,Math.max(4,S.count+ +a));if(n===S.count)return;S.count=n;
    const r=REC[n];SET_ROLES.forEach((k,i)=>S.roles[k]=r[i]);save();keepScroll=true;render()},
  role(a){const [r,d]=a.split(',');S.roles[r]=Math.max(0,Math.min(r==='wolf'?5:r==='seer'||r==='knight'||r==='medium'?1:2,S.roles[r]+ +d));save();keepScroll=true;render()},
  rec(){const r=REC[S.count];SET_ROLES.forEach((k,i)=>S.roles[k]=r[i]);save();keepScroll=true;render()},
  first(){S.firstAttack=!S.firstAttack;save();keepScroll=true;render()},
  talk(a){S.talkMin=Math.min(10,Math.max(1,S.talkMin+ +a));save();keepScroll=true;render()},
  start(){if(validate())return;SFX.ok();startGame()},
  'reveal-me'(){G.sub='show';save();render()},
  flip(a,el){if(el.classList.contains('flipped'))return;el.classList.add('flipped');SFX.flip()},
  'reveal-done'(){G.idx++;if(G.idx>=G.players.length){toNight()}else{G.sub='pass';save();render()}},
  'night-begin'(){G.phase='night';G.order=alive();G.idx=0;G.sub='pass';G.night={wolf:{},guard:null};save();render()},
  'night-me'(){G.sub='act';tmp=null;save();render()},
  pick(a,el){tmp=+a;document.querySelectorAll('.pick button').forEach(b=>b.classList.toggle('sel',b===el));const d=$('#decide');if(d)d.disabled=false;SFX.sel()},
  'night-decide'(){if(tmp==null)return;const pi=G.order[G.idx],p=G.players[pi];
    if(p.role==='wolf')G.night.wolf[pi]=tmp;
    else if(p.role==='knight')G.night.guard=tmp;
    else if(p.role==='seer'){G.seerRes=tmp;(p.memo=p.memo||[]).push({t:tmp,w:G.players[tmp].role==='wolf'});G.sub='result';tmp=null;save();render();SFX.flip();return}
    ACT['night-next']()},
  'night-next'(){tmp=null;G.idx++;if(G.idx>=G.order.length)resolveNight();else{G.sub='pass';save();render()}},
  'to-end'(){G.phase='end';save();render();G.winner==='wolf'?SFX.dark():SFX.win();say(G.winner==='wolf'?'人狼チームの かちです。':'村人チームの かちです。')},
  'talk-begin'(){G.talkTotal=G.talkSec;G.talkLeftSec=G.talkSec;G.talkRun=true;G.talkEndAt=Date.now()+G.talkSec*1000;go('talk');
    say('話しあいを はじめてください。')},
  't-pause'(){if(talkLeft()<=0)return;if(G.talkRun){G.talkLeftSec=talkLeft();G.talkRun=false}else{G.talkRun=true;G.talkEndAt=Date.now()+G.talkLeftSec*1000}
    save();$('#tp').textContent=G.talkRun?'いったん とめる':'スタート'},
  't-add'(){const l=talkLeft()+60;G.talkTotal=Math.max(G.talkTotal,l);if(G.talkRun)G.talkEndAt=Date.now()+l*1000;else G.talkLeftSec=l;
    if(l>0&&!G.talkRun&&$('#timer').classList.contains('end')){G.talkRun=true;G.talkEndAt=Date.now()+l*1000}
    save();render()},
  'vote-intro'(){G.talkRun=false;G.vote={round:1,cands:alive(),voters:alive(),idx:0,votes:{}};go('voteIntro');say('投票の時間です。')},
  'vote-begin'(){G.vote.idx=0;G.vote.votes={};go('vote')},
  'vote-me'(){G.sub='act';tmp=null;save();render()},
  'vote-decide'(){if(tmp==null)return;const v=G.vote;v.votes[v.voters[v.idx]]=tmp;v.idx++;tmp=null;SFX.ok();
    if(v.idx>=v.voters.length)finishVote();else{G.sub='pass';save();render()}},
  runoff(){G.vote={round:2,cands:G.tally.tied,voters:alive(),idx:0,votes:{}};go('voteIntro');say('決選投票を します。')},
  lottery(){const T=G.tally,el=$('#lot'),b=$('#lotbtn');b.disabled=true;let k=0;const steps=T.tied.length*4+T.tied.indexOf(T.who);
    const spin=()=>{el.textContent=G.players[T.tied[k%T.tied.length]].name;SFX.tick();
      if(k<steps){k++;setTimeout(spin,60+k*k*.6)}else{SFX.ok();b.disabled=false;b.dataset.act='to-exec';b.textContent='つぎへ'}};spin()},
  'to-exec'(){execute()},
  'to-night'(){G.day++;toNight()},
  again(){G&&G.solo?startSolo():startGame()},
  'quit-end'(){G=null;save();view='title';render()},
  menu(){openMenu()},
};
app.addEventListener('click',e=>{const el=e.target.closest('[data-act]');if(!el)return;const f=ACT[el.dataset.act];
  if(!f)return;if(!['pick','flip'].includes(el.dataset.act))SFX.tap();f(el.dataset.arg,el)});
app.addEventListener('input',e=>{if(e.target.dataset.myname){S.solo.myName=e.target.value;save();return}const i=e.target.dataset.name;if(i!=null){S.names[+i]=e.target.value;save()}});
app.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.dataset.name!=null){const nx=document.querySelector(`[data-name="${+e.target.dataset.name+1}"]`);if(nx)nx.focus();else e.target.blur()}});

/* メニュー */
const modal=$('#modal'),mbox=$('#mbox');
function openMenu(){
  mbox.innerHTML=`<h3>メニュー</h3>
    <div class="srow"><span>音</span><button class="sw ${S.sound?'on':''}" data-m="sound"></button></div>
    <div class="srow"><span>よみあげ</span><button class="sw ${S.voice?'on':''}" data-m="voice"></button></div>
    <button class="btn ai" data-m="rules" style="margin-top:14px">あそびかた</button>
    <button class="btn" data-m="quit">ゲームを やめる</button>
    <button class="btn sub" data-m="close">とじる</button>`;
  modal.classList.add('show')}
modal.addEventListener('click',e=>{if(e.target===modal){modal.classList.remove('show');return}
  const el=e.target.closest('[data-m]');if(!el)return;const m=el.dataset.m;SFX.tap();
  if(m==='sound'){S.sound=!S.sound;el.classList.toggle('on',S.sound);save()}
  else if(m==='voice'){S.voice=!S.voice;el.classList.toggle('on',S.voice);save()}
  else if(m==='close')modal.classList.remove('show');
  else if(m==='rules'){modal.classList.remove('show');rulesBack='game';view='rules';render()}
  else if(m==='quit'){mbox.innerHTML=`<h3>ゲームを やめる?</h3><p style="text-align:center;line-height:1.7">いまの ゲームは きえます。</p>
      <button class="btn" data-m="quit-yes">やめる</button><button class="btn sub" data-m="close">つづける</button>`}
  else if(m==='quit-yes'){modal.classList.remove('show');clearInterval(timerIv);G=null;save();view='title';render()}
});

/* ================= コンピュータと あそぶ ================= */
const CPUS=[['くま','kuma','おれ'],['ぞう','zou','ぼく'],['ねこ','neko','わたし'],['うさぎ','usagi','わたし'],['いぬ','inu','ぼく'],
  ['かえる','kaeru','ぼく'],['りす','risu','わたし'],['ひよこ','hiyoko','わたし'],['ふくろう','fukurou','ぼく']];
const AVIMG={"me": "data:image/webp;base64,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", "kuma": "data:image/webp;base64,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", "inu": "data:image/webp;base64,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", "zou": "data:image/webp;base64,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", "neko": "data:image/webp;base64,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", "usagi": "data:image/webp;base64,UklGRoIJAABXRUJQVlA4WAoAAAAQAAAAfwAAfwAAQUxQSOcDAAABDsq2bautI0m2klRVOD1Xn/EfmKn16icy8gfFTF1m5moxMzNTkxkcsi3dMZ7Z1s6o5j7a915FBAQ3khRJmQ01VDt70Jj1AS6UWU4l5P6dQ87afsOjn+kPV0qm8Jke5fZ4SGf/8XerJtNWe3jtmJVLHv/yHzcTPZtLVo4ZXorBqncmE8nNZ1330k9uyGIQI1mOwjjyGhryp5eas+qhW6WVstpGrj/lpm93Oanf06CYrWDsyTtpV3PTKetHXrYyVp4l4agLviudrO8L01w0em+SfXdBaCVZXg0jBIYz7uiunpl4be5LJnVD3UpCWD4ykWc+UQzPaKGkN/GJMxNmWrIVmZ743C436JVu4bRedP65JmV7mUae8Jh7S6dRaxmGk0UmzJf338at53WlQaml0aLU9Vu5pP/AQJ7wltTXkumlJpBL+EzLk/WX/au9hZZOmkLtkzxdfD7qlQlnK3AyHLXoZC2u/Ox8qYrQvMIKW+lifVxUuIEqxChetEgXbW671/lKZSl63duwvTC788ScTc3SGqEnOgwLygd95PqqIL0+ahaSIg//YpirmSIXcDFPDvt8mKuaQpy7E8jY+cD1XGXZc9ZhNmcvv+2pUbu65lNNNk9KpfuHudrJ5hmR2hpe7PaU1YY1CqzT2T2cO9LJVzxFhZkdZDzihyK6yjOysRkdpFr/uosCYFTtM5vt3BWrHiDoFWY61eax/xYlBozh2Bna31bY+t6wRqni1hCmD3TOU79EgXmdx5BO9djtFw6G9DbVodL73UBAjLJ0MgJPdIWgSDVJmIzn8PDcROTJ6XtKw4JZczrzCRO8NU+o58DYc1bHMSeRp+8elGiwuPt0tsc6nPpOt1dwNDV1lo61ObuKEg9GP9b2iOe7vgDpFUeQcv33rkAEVfvEyMCTVQqSppqBbPNWG2AiGlfPZOnmrzGPJerr2rI8OWd3iXpg8RzmTK5VX6D0iszTA15EBmtLjv5ZBSqoEJM55zoQcyBeqp6DZc8x2e9R53Hh9Whz4BdugIuoL8Lh3bLABa17+BnDGrmqd5TYsB3XoxfXP4wOfqkCGdSXn6LD/lCJDFMQPA0/w/P//wG+I/x2D7/dx+/38Pt9/HEP/rgPf9yLP+7Hn/fAz/v2AfNe/Hk//roH/roP/roX/rof/Lon/rov/ro3/Lo//r4H/r4P/L4X/r4f/L4n/L4v/r43/L4/vu4BX/cBr3uB1/3A657wdV/wujd43R++7hFe9wmve4XX/cLrnuF13/C6d3jdP3zcA3zcB3zcC3zcD3zcE3rcF3zcG3rcH3zcI3rcJ3rcK3zcL3rcM3rc974y7h0+7p8AVlA4IHQFAABwHACdASqAAIAAPmEokUWkIqGVSMaYQAYEsbbF+DyBqAH4vgAgHq25ErIjp9tRzvvpG3lPeSv8z5t2OV+AhvyBMzP/oC/qH/xeBjSZC3qCTL4RhDwduwUQe4WPI78TRLMmjHumqeaW4RGX4hB9MbuSTLvUkE55JiYVZXOfInAdrRpvKNiKm0cDA+s+JphbInSxl135ml9N1eP+05+di6AbDh+Smy7femEWshQBeGuZbmTZ72cZrvwTi87BPFlMwx330Q3VaTiDR9ehMGYV/Pf6F22N5HZ9sd+IIOqsEhiBTQOOFyAIMtK+d3XCAAD+/W5OF8HK7/9cWfjjkmplhvBPOAmtGll1koyfI5n1TL5ZpwzsP0Nvq74xU4E0/wUokGTclHoaXAyQi4WpZBVAc//zktiivqOoxJ1Ln6ovuC6rAd2V4PyWimYFo3K7xmuyKng///DFf/7+if//DjOr3bS8Om/6vpJ2Ci//Q68/mcLXk8vCfN+o0ikvma8LUNvJf/jTcLZiTMTHZbCnIjejbJqtbp4GaeK4aS/pj+fmojmoU0/uf4NNX9Yt7zE7MDIprzfDSU9teT7g/LyHR3TelsE5UoczOuAqxP88Y670mzBvqLOzlPWGptmOow8fekQK7UhA5gZpBpi54heocVB4KmRsP8OKhvbrHUEybZ5tlzv/pOHt+maAO/nbFmyczcOi5v57s3R/PQxsqoNeRzdhnJLuI4RCd0USVBtyl05QD3bNF34CdiEiRr3XwKkgEsMCh+afcHEaLuOITyn0jN2lIXcu/7kbfw/X5tRtxCrb32miBfBmAcA8lvqxSLADIjEW3gNYMey3DhmSE1UmHxqNBsVg1yGHxa4Qk+EpDnXF5FNs88fTzDJRGESqPtzU50M1RtHcwuA3wU5WJn5Mcy/NgVXU5RVPlir9IQXzUEWTSCtHqPC+wsQWSLDlbxvO4BAnvTdmOrNntXF+jWIvS/lddp/bIrhrJpPlC1dWf//JAzhMpwY5yPSq7J5Ud+KFriCcHMdgY+xovX7MRf+J04h83hQEi8RhRSuv6I6g0ZbbWjghxIv+/eXU2IgUUBoF71F/0w2t4t4NTNsP1WNVJVcjQsaSfUYUT3Cxf3+fA3BwLmFUD/ua8Rh1ol0gxuRp5UuXgp7T0wTZ6mBNlyl+hoDrOnZ73rCO3bOL288W0ZvLqMFdhcsBsS0y6ZH/eKPD+PUYYzK+Rf9G+Z/00eBSbrqnGNLDsV3yC/j01zI9q7ZyGX5qpZUWbn2MJD3KndC8YgA9gxwthOwmGs+Zoip0tdygMRzWjyopL6/WbsZgxD2cdoX2XL6j2Eq9A7lYqOoQxQSggMCP2JJG9EYR3XPdJkqE3Bb4A1hTp95krZ4GxC5eaFfRt/5u8/IwyzPeOOzC7X8gHNtRP2ueNOt0hYpEjtCIInyEoiweqvqyB3LaTfTyBIFHi0Av91//+BU8Wf7Dzds3DB+Q3xUksrihSQi+Pyyb49kIbROSnj+8Tu2EwvAt++PuZNJVkieA8kh2SzOxIZE5iXU9Yo3VZH5L+4y11JhqM/+eDV7/x8/5MkOzUtsKCzZTULmW+J28X19crgY/5Y5pRSRjCarnoTTSDVy5UB6v9oOCaeSNfZDMK2TrNU31tAjlOB7QOQQKopg1ZABhJeFHgY5L46Acrv/MvKgAE1HKkwrIzgJfKcUz8n2x8sx3hBS9CSxKpZUhee2yP5Pd0KaY2jWPsPE6cmozb7pWek6Gr2/Bau7OBKpbLri3GARODhJKEbHid2ircOTkYHfAyi476fXfqq/5hHRegU5zOv+LpjLtZAhXk2nWQuQQ9S0FAIPLR0ekSH/rtxJfOd5XtcX/zPWu4kAA", "kaeru": "data:image/webp;base64,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", "risu": "data:image/webp;base64,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", "hiyoko": "data:image/webp;base64,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", "fukurou": "data:image/webp;base64,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"};
function AVH(p){return AVIMG[p.av]?`<img class="avi" src="${AVIMG[p.av]}" alt="">`:(p.av||'')}
if(!S.solo)S.solo={count:7,roles:{wolf:2,madman:0,seer:1,medium:0,knight:1},myName:'',myRole:'random'};
const pick1=a=>a[Math.floor(Math.random()*a.length)];
const pn=i=>G.players[i].name;
function soloValid(){const o=S.solo,v=o.count-SET_ROLES.reduce((s,r)=>s+o.roles[r],0),w=o.roles.wolf;
  if(v<0)return 'やくわりが 人数より 多いです';if(w<1)return '人狼は 1人以上 にしてね';
  if(w*2>=o.count)return '人狼が 多すぎます';
  if(o.myRole!=='random'&&(o.myRole==='villager'?v<1:o.roles[o.myRole]<1))return 'えらんだ やくわりが 0人です';return ''}

function vSSetup(){
  const o=S.solo,n=o.count,v=n-SET_ROLES.reduce((s,r)=>s+o.roles[r],0),err=soloValid();
  const rrows=SET_ROLES.map(r=>`<div class="srow"><div class="rl">${icon(r,28,R[r].c)}${R[r].n}</div>
    <div class="step"><button data-act="srole" data-arg="${r},-1">−</button><b>${o.roles[r]}</b><button data-act="srole" data-arg="${r},1">＋</button></div></div>`).join('');
  const mr=['random',...ROLE_ALL].map(r=>`<button class="${o.myRole===r?'sel':''}" data-act="myrole" data-arg="${r}">${r==='random'?'おまかせ':R[r].t}</button>`).join('');
  return `<div class="scr fade">
    <div class="top"><button class="menu-btn" data-act="to-title" aria-label="もどる">‹</button><span class="ttl">コンピュータと</span><span style="width:44px"></span></div>
    <div class="card"><h3>あなたの なまえ</h3><div class="nrow"><span class="num" style="background:none;width:36px;height:36px"><img class="avi" src="${AVIMG.me}" alt="" style="width:36px;height:36px"></span><input data-myname="1" value="${esc(o.myName)}" maxlength="8" placeholder="あなた"></div></div>
    <div class="card"><div class="srow"><div class="rl" style="font-weight:700">ぜんぶで</div>
      <div class="step"><button data-act="scount" data-arg="-1">−</button><b>${n}</b><span>人</span><button data-act="scount" data-arg="1">＋</button></div></div>
      <div class="small">あなた + どうぶつ ${n-1}ひき</div></div>
    <div class="card"><h3>あなたの やくわり</h3><div class="rolechips">${mr}</div></div>
    <div class="card"><div style="display:flex;justify-content:space-between;align-items:center"><h3 style="margin:0">やくわり</h3>
      <button class="linkbtn" data-act="srec">おすすめにする</button></div>${rrows}
      <div class="srow"><div class="rl">${icon('villager',28,R.villager.c)}${R.villager.n}</div><div class="step"><b style="${v<0?'color:var(--shu)':''}">${v}</b><span class="small" style="width:46px">のこり</span></div></div></div>
    <div class="card"><div class="srow"><div class="rl" style="font-size:15px">1日目の夜から おそう</div><button class="sw ${S.firstAttack?'on':''}" data-act="first" aria-label="1日目の夜からおそう"></button></div></div>
    <div class="err">${err}</div>
    <button class="btn" data-act="sstart" ${err?'disabled':''}>はじめる</button></div>`}
const ROLE_ALL=['wolf','madman','seer','medium','knight','villager'];

function startSolo(){
  const o=S.solo,n=o.count,roles=[];
  SET_ROLES.forEach(r=>{for(let i=0;i<o.roles[r];i++)roles.push(r)});while(roles.length<n)roles.push('villager');shuffle(roles);
  if(o.myRole!=='random'){const k=roles.indexOf(o.myRole);if(k>0)[roles[0],roles[k]]=[roles[k],roles[0]]}
  const cp=shuffle(CPUS.slice()).slice(0,n-1);
  const ppl=[{name:(o.myName||'').trim()||'あなた',av:'me',fp:'わたし',me:true},...cp.map(c=>({name:c[0],av:c[1],fp:c[2]}))];
  G={solo:true,players:ppl.map((p,i)=>Object.assign(p,{role:roles[i],alive:true,memo:[]})),day:1,phase:'sReveal',firstAttack:S.firstAttack,
    log:[],lastExec:null,lastExecDay:0,winner:null,claims:{seer:{},medium:{},acc:{}},feed:[],queue:[],stage:0,said:{},fake:{},noise:{},nsub:'act'};
  view='game';save();render();
}
const ME=0;
const meP=()=>G.players[ME];

/* ---- コンピュータの考え ---- */
function noiseOf(i,j){const k=G.day+'-'+i+'-'+j;if(G.noise[k]==null)G.noise[k]=+(Math.random()*2.5).toFixed(2);return G.noise[k]}
function claimers(k){return Object.keys(G.claims[k]).map(Number)}
function pubSus(){
  const s=G.players.map(()=>0),sc=claimers('seer'),mc=claimers('medium');
  const wS=sc.length?1/sc.length:0,wM=mc.length?1/mc.length:0;
  sc.forEach(c=>{s[c]+=sc.length>1?2.5:-2;G.claims.seer[c].forEach(r=>{s[r.t]+=r.w?7*wS:-3*wS})});
  mc.forEach(c=>{s[c]+=mc.length>1?2.5:-1.5;
    G.claims.medium[c].forEach(r=>sc.forEach(k=>G.claims.seer[k].forEach(q=>{if(q.t===r.t)s[k]+=(q.w===r.w?-2:6)*wM})))});
  Object.keys(G.claims.acc).forEach(d=>Object.values(G.claims.acc[d]).forEach(t=>s[t]+=(+d===G.day?.5:.25)));
  return s}
function cpuSus(i){
  const p=G.players[i],s=pubSus().map((v,j)=>v+noiseOf(i,j));
  if(p.role==='seer'){p.memo.forEach(r=>s[r.t]+=r.w?100:-100);claimers('seer').forEach(c=>{if(c!==i)s[c]+=25})}
  if(p.role==='medium'){claimers('medium').forEach(c=>{if(c!==i)s[c]+=20});
    p.memo.forEach(r=>claimers('seer').forEach(k=>G.claims.seer[k].forEach(q=>{if(q.t===r.t&&q.w!==r.w)s[k]+=30})))}
  if(p.role==='wolf')G.players.forEach((q,j)=>{if(q.role==='wolf')s[j]=-999});
  if(p.role==='madman')claimers('seer').forEach(c=>{if(c!==i)s[c]+=6});
  if(R[p.role].team==='village')claimers('seer').forEach(c=>G.claims.seer[c].forEach(q=>{if(q.t===i&&q.w)s[c]+=40}));
  s[i]=-999;return s}
function argmax(s,cands){let b=null,bv=-1e9;shuffle(cands.slice()).forEach(j=>{if(s[j]>bv){bv=s[j];b=j}});return b}
function wolfPublicPick(i,cands){const s=pubSus();const c=cands.filter(j=>G.players[j].role!=='wolf'&&j!==i);
  return argmax(s.map((v,j)=>v+noiseOf(i,j)),c.length?c:cands.filter(j=>j!==i))}
function cpuVote(i,cands){if(G.players[i].role==='wolf')return wolfPublicPick(i,cands);
  const c=cands.filter(j=>j!==i);return argmax(cpuSus(i),c)}

/* ---- せりふ ---- */
const T={
  acc:['{t}が あやしいと 思う。','{t}、なんだか 目が およいでない?','{fp}は {t}に 投票する つもり。','{t}の 話しかた、ちょっと へんだよね。','うーん…{t}が いちばん あやしいかな。'],
  def:['えっ、ちがうよ! {fp}は 人間だよ!','{fp}を うたがうなんて、{a}こそ あやしい!','まってまって、{fp}は 村人だってば。','{fp}じゃないよ〜。しんじて!'],
  agree:['{fp}も {t}が あやしいと 思ってた。','たしかに {t}は へんかも。'],
  disagree:['{t}は しんじて いいと 思うけどなあ。'],
  counter:['えっ!? 本物の 占い師は {fp}だよ! {c}は うそつき!','まって、占い師は {fp}! {c}は にせものだ!'],
  mcounter:['霊媒師は {fp}だよ! {c}は うそを ついてる!'],
  seerAll:'みんな、きいて! {fp}は 占い師です。',
  quiet:['占い師の人、いないのかな…?','うーん、まだ よく わからないなあ。']
};
const fill=(t,o)=>t.replace(/\{(\w+)\}/g,(m,k)=>o[k]!=null?o[k]:m);
function say1(i,key,o={}){const p=G.players[i];if(key==='def'&&(G.claims.seer[i]||G.claims.medium[i]))return fill(pick1(['ちがうよ! {fp}は 本物の {r}だってば!','{fp}を うたがうの? 本物の {r}だよ!']),{fp:p.fp,r:G.claims.seer[i]?'占い師':'霊媒師'});return fill(Array.isArray(T[key])?pick1(T[key]):T[key],Object.assign({fp:p.fp},o))}
const wr=w=>w?'人狼':'人間';

function addClaim(kind,i,r){(G.claims[kind][i]=G.claims[kind][i]||[]).push(r)}
function fakeTarget(i,preferWolfMate){
  const done=(G.claims.seer[i]||[]).map(r=>r.t);
  const al=alive().filter(j=>j!==i&&!done.includes(j));if(!al.length)return null;
  const me=G.players[i];
  if(me.role==='wolf'){const mates=al.filter(j=>G.players[j].role==='wolf');
    if(preferWolfMate&&mates.length&&Math.random()<.5)return {t:pick1(mates),w:false};
    const vs=al.filter(j=>G.players[j].role!=='wolf');const t=pick1(vs.length?vs:al);
    return {t,w:G.players[t].role!=='wolf'&&Math.random()<.45}}
  const t=pick1(al);return {t,w:Math.random()<.5}}

function genCO(){
  const day=G.day,L=[],before=claimers('seer').length,mBefore=claimers('medium').length;
  const cpu=shuffle(alive().filter(i=>!G.players[i].me));
  cpu.forEach(i=>{const p=G.players[i],had=!!G.claims.seer[i];
    if(p.role==='seer'){const today=p.memo.filter(r=>r.day===day);
      if(had){today.forEach(r=>{addClaim('seer',i,{t:r.t,w:r.w,day});L.push({w:i,co:1,t:`きのうの 夜は ${pn(r.t)}を うらなったよ。けっかは…「${wr(r.w)}」!`})})}
      else if(Math.random()<.65||p.memo.some(r=>r.w)||day>=3){p.memo.forEach(r=>addClaim('seer',i,{t:r.t,w:r.w,day}));
        L.push({w:i,co:1,t:fill(T.seerAll,{fp:p.fp})+' '+p.memo.map(r=>`${pn(r.t)}は「${wr(r.w)}」`).join('、')+'でした。'})}}
    else if(p.role==='medium'){const today=p.memo.filter(r=>r.day===day);
      if(today.length&&(G.claims.medium[i]||Math.random()<.75||today.some(r=>r.w))){today.forEach(r=>{addClaim('medium',i,{t:r.t,w:r.w,day});
        L.push({w:i,co:1,t:`${G.claims.medium[i].length>1?'':p.fp+'は 霊媒師です。'}きのう ついほうされた ${pn(r.t)}は…「${wr(r.w)}」でした。`})})}}
    else if((p.role==='madman'||p.role==='wolf')){
      let fake=had;
      if(!had&&day===1&&!G.fake[p.role]){G.fake[p.role]=1;
        const nW=G.players.filter(q=>q.role==='wolf').length;
        if(p.role==='madman'?Math.random()<.5:(nW>=2&&Math.random()<.35))fake=true}
      if(fake){const r=fakeTarget(i,true);if(r){addClaim('seer',i,Object.assign(r,{day}));
        L.push({w:i,co:1,t:had?`きのうの 夜は ${pn(r.t)}を うらなったよ。けっかは…「${wr(r.w)}」!`:`${fill(T.seerAll,{fp:p.fp})} ${pn(r.t)}は「${wr(r.w)}」でした。`})}}}
  });
  const sc=claimers('seer');
  if(sc.length>=2&&sc.length>before){sc.filter(c=>!G.players[c].me&&G.players[c].alive).forEach(c=>{const o=sc.filter(k=>k!==c);L.push({w:c,t:say1(c,'counter',{c:o.map(pn).join('と ')})})})}
  const mc=claimers('medium');
  if(mc.length>=2&&mc.length>mBefore){mc.filter(c=>!G.players[c].me&&G.players[c].alive).forEach(c=>{const o=mc.filter(k=>k!==c);L.push({w:c,t:say1(c,'mcounter',{c:o.map(pn).join('と ')})})})}
  if(!L.length&&cpu.length)L.push({w:cpu[0],t:say1(cpu[0],'quiet')});
  return L}

function genOpinions(){
  const day=G.day,acc=G.claims.acc[day]=G.claims.acc[day]||{},L=[];
  const cpu=shuffle(alive().filter(i=>!G.players[i].me)),al=alive();
  cpu.forEach(i=>{const p=G.players[i];let t,txt;
    const knownW=p.role==='seer'?p.memo.find(r=>r.w&&G.players[r.t].alive):null;
    if(knownW){t=knownW.t;txt=`${pn(t)}は 人狼だよ! みんな ${pn(t)}に 投票して!`}
    else{t=p.role==='wolf'?wolfPublicPick(i,al):argmax(cpuSus(i),al.filter(j=>j!==i));txt=say1(i,'acc',{t:pn(t)})}
    if(t==null)return;acc[i]=t;L.push({w:i,t:txt})});
  const accused=[...new Set(Object.values(acc))].filter(j=>!G.players[j].me&&G.players[j].alive);
  shuffle(accused).slice(0,3).forEach(j=>{const by=Object.keys(acc).map(Number).filter(k=>acc[k]===j&&k!==j);
    if(by.length)L.push({w:j,t:say1(j,'def',{a:pn(pick1(by))})})});
  return L}

/* あなたの 発言 */
function humanSay(kind,t,w){
  const day=G.day,L=[],me=meP();
  if(kind==='acc'){(G.claims.acc[day]=G.claims.acc[day]||{})[ME]=t;L.push({w:ME,t:`${pn(t)}が あやしいと 思う!`});
    if(!G.players[t].me)L.push({w:t,t:say1(t,'def',{a:me.name})});
    const cpu=shuffle(alive().filter(i=>!G.players[i].me&&i!==t));let ag=0,dis=0;
    cpu.forEach(i=>{const s=cpuSus(i),rank=alive().filter(j=>j!==i).sort((a,b)=>s[b]-s[a]);
      if(ag<2&&(rank.indexOf(t)<2||(G.players[i].role==='wolf'&&G.players[t].role!=='wolf'&&Math.random()<.5))){ag++;L.push({w:i,t:say1(i,'agree',{t:pn(t)})})}
      else if(!dis&&s[t]<-3){dis++;L.push({w:i,t:say1(i,'disagree',{t:pn(t)})})}})}
  else if(kind==='seer'){const first=!G.claims.seer[ME];addClaim('seer',ME,{t,w,day});G.said.seer=day;
    L.push({w:ME,co:1,t:`${first?'わたしは 占い師です! ':''}${pn(t)}を うらなったら「${wr(w)}」でした。`});
    if(first)claimers('seer').filter(c=>c!==ME&&G.players[c].alive).forEach(c=>L.push({w:c,t:say1(c,'counter',{c:me.name})}));
    if(w&&!G.players[t].me)L.push({w:t,t:say1(t,'def',{a:me.name})})}
  else if(kind==='medium'){const first=!G.claims.medium[ME];addClaim('medium',ME,{t:G.lastExec,w,day});G.said.medium=day;
    L.push({w:ME,co:1,t:`${first?'わたしは 霊媒師です! ':''}ついほうされた ${pn(G.lastExec)}は「${wr(w)}」でした。`});
    if(first)claimers('medium').filter(c=>c!==ME&&G.players[c].alive).forEach(c=>L.push({w:c,t:say1(c,'mcounter',{c:me.name})}))}
  else if(kind==='vil'){L.push({w:ME,t:'わたしは 村人だよ。しんじて!'})}
  else if(kind==='trust'){L.push({w:ME,t:`${pn(t)}は しんじて いいと 思う。`})}
  G.queue.push(...L);save();pump()}

/* ---- 会話の 再生 ---- */
let qBusy=false,pumpGen=0;
function speakThen(text,cb){let done=false;const fin=()=>{if(done)return;done=true;cb()};
  if(!S.voice||!('speechSynthesis' in window)){setTimeout(fin,700+text.length*28);return}
  try{const u=new SpeechSynthesisUtterance(text.replace(/[^　-鿿＀-￯A-Za-z0-9]/g,' '));u.lang='ja-JP';u.rate=1.15;
    u.onend=()=>setTimeout(fin,250);u.onerror=()=>setTimeout(fin,400);speechSynthesis.speak(u);setTimeout(fin,9000)}catch(e){setTimeout(fin,1200)}}
function msgHTML(m){if(m.gm)return `<div class="gm">${esc(m.t)}</div>`;const p=G.players[m.w];
  return `<div class="msgrow ${p.me?'me':''}"><div class="av">${AVH(p)}</div><div class="bub ${m.co?'co':''}"><span class="who">${esc(p.name)}</span>${esc(m.t)}</div></div>`}
function pump(){
  if(qBusy||!G||G.phase!=='sTalk')return;
  if(!G.queue.length){updTalkBar();return}
  qBusy=true;const nx=G.queue[0],p=G.players[nx.w];updTalkBar();
  const feed=$('#feed');let ty=null;
  if(feed&&!nx.gm){ty=document.createElement('div');ty.className='typing';ty.innerHTML=`<div class="av sm">${AVH(p)}</div><span class="dots"><span></span><span></span><span></span></span>`;feed.appendChild(ty);feed.scrollTop=1e6}
  const gen=pumpGen;
  setTimeout(()=>{if(gen!==pumpGen)return;if(!G||G.phase!=='sTalk'){qBusy=false;return}
    const m=G.queue.shift();m.day=G.day;G.feed.push(m);save();if(ty)ty.remove();
    const f=$('#feed');if(f){f.insertAdjacentHTML('beforeend',msgHTML(m));f.scrollTop=1e6}
    refreshChips();SFX.tick();
    const fin=()=>{qBusy=false;pump()};
    if(p&&!p.me&&!m.gm)speakThen(m.t,fin);else setTimeout(fin,350)},p&&p.me?150:650)}
function updTalkBar(){const b=$('#talkbar');if(!b)return;const busy=qBusy||G.queue.length;const alive_=meP().alive;
  let main='';
  if(busy)main='<button class="btn sub" disabled>みんなが 話しているよ…</button>';
  else if(G.stage===1)main='<button class="btn kin" data-act="st-op">みんなの 意見を きく</button>';
  else main='<button class="btn" data-act="sv-begin">投票へ</button>';
  b.innerHTML=(alive_?`<button class="btn ai" style="flex:0 0 42%" data-act="speak" ${busy?'disabled':''}>💬 発言する</button>`:'')+main;
  if(!busy&&G.stage===0){G.stage=1;save();updTalkBar()}}
function pchips(){const dead=!meP().alive;
  return G.players.map((p,i)=>{const b=G.claims.seer[i]?'<span class="bd">占</span>':G.claims.medium[i]?'<span class="bd m">霊</span>':'';
    const showRole=dead||p.me||(meP().role==='wolf'&&p.role==='wolf');
    return `<div class="pc ${p.alive?'':'dead'} ${p.me?'meself':''}"><div class="av">${AVH(p)}</div>${b}<div>${esc(p.name)}</div>${showRole?`<div class="rr">${R[p.role].t}</div>`:''}</div>`}).join('')}
function refreshChips(){const c=$('#pchips');if(c)c.innerHTML=pchips()}

/* ---- 画面 ---- */
function vSolo(){
  const ph=G.phase,day=G.day,me=meP();let h='',mode='night';
  if(ph==='sReveal'){const r=me.role;
    const mates=G.players.map((q,i)=>q.role==='wolf'&&!q.me?i:-1).filter(i=>i>=0);
    h=`<div class="scr center">${topbar('やくわり')}
      <div class="small">あなたの やくわりは…</div>
      <div class="flipwrap" data-act="flip"><div class="flipper">
        <div class="face back"><div class="bk">タップで めくる</div></div>
        <div class="face front"><div class="band" style="background:${R[r].c}"></div><div class="ic">${icon(r,'100%',R[r].c)}</div>
          <div class="rn">${R[r].n}</div><div class="team" style="background:${R[r].team==='wolf'?'var(--shu)':'var(--ai)'}">${R[r].team==='wolf'?'人狼チーム':'村人チーム'}</div><div class="rd">${R[r].d}</div></div></div></div>
      <div class="after">${r==='wolf'?`<div class="card"><div class="small">なかまの 人狼</div><div style="font-size:20px;font-weight:700;margin-top:4px">${mates.length?mates.map(i=>AVH(G.players[i])+' '+esc(pn(i))).join('、'):'いない(ひとりだけ)'}</div></div>`:''}
        <div class="card" style="margin-top:8px"><div class="small">いっしょに あそぶ どうぶつたち</div><div class="pchips" style="justify-content:center;flex-wrap:wrap">${pchips()}</div></div>
        <button class="btn kin" data-act="sn-start" style="margin-top:12px">夜へ</button></div></div>`}
  else if(ph==='sNight'){h=vSNight()}
  else if(ph==='sMorning'){mode='day';const v=G.morning.victim;
    const body=v!=null?`<div class="av" style="width:70px;height:70px;font-size:40px;margin:2vh auto 0">${AVH(G.players[v])}</div><div class="bigname" style="font-size:36px">${esc(pn(v))}</div><div class="san">${G.players[v].me?'(あなた)':'さん'}が</div>
      <p class="msg">人狼に おそわれました…${G.players[v].me?'<br><span class="small">これからは ゆうれいとして 見まもろう。みんなの 正体が 見えるよ。</span>':''}</p>`
      :`<p class="msg" style="margin-top:3vh">${G.morning.noAttack?'しずかな 夜でした。':'へいわな 朝です!'}<br>だれも おそわれませんでした。</p>`;
    h=`<div class="scr center fade">${topbar(`${day}日目`)}<div class="sunbig"></div><div class="daylabel">${day}日目の 朝</div>${body}
      <div class="pchips" style="justify-content:center;flex-wrap:wrap">${pchips()}</div><div class="grow"></div>
      ${G.winner?'<button class="btn" data-act="to-end">けっかを 見る</button>':'<button class="btn" data-act="st-begin">話しあいへ</button>'}</div>`}
  else if(ph==='sTalk'){mode='day';
    const msgs=G.feed.filter(m=>m.day===day).map(msgHTML).join('');
    h=`<div class="scr full">${topbar(`${day}日目 話しあい`)}
      <div class="pchips" id="pchips">${pchips()}</div>
      <div class="feed card" id="feed"><div class="gm">${day}日目の 話しあい</div>${msgs}</div>
      <div class="talkbar" id="talkbar"></div></div>`}
  else if(ph==='sVote'){mode='day';const v=G.vote;
    if(me.alive){const opts=v.cands.filter(i=>i!==ME);
      h=`<div class="scr center fade">${topbar(`${day}日目 投票`)}<div class="daylabel" style="font-size:24px;margin-top:0">${v.round===2?'決選投票':'投票'}</div>
        <p class="msg">ついほうしたい人を えらんでね</p>${pickGridAv(opts)}<div class="grow"></div>
        <button class="btn" id="decide" data-act="sv-decide" disabled>けってい</button></div>`}
    else h=`<div class="scr center fade">${topbar(`${day}日目 投票`)}<div class="daylabel" style="font-size:24px">${v.round===2?'決選投票':'投票'}</div>
        <p class="msg">ゆうれいは 投票できません。<br>みんなの 投票を 見まもろう。</p><div class="grow"></div><button class="btn" data-act="sv-decide">投票を 見る</button></div>`}
  else if(ph==='sTally'){mode='day';const T2=G.tally,max=Math.max(...Object.values(T2.counts)),nv=Object.keys(G.vote.votes).length;
    const bars=Object.entries(T2.counts).sort((a,b)=>b[1]-a[1]).map(([i,c])=>`<div class="bar ${c===max?'top':''}"><div class="nm">${AVH(G.players[+i])}${esc(pn(+i))}</div><div class="bg"><div class="fg" data-w="${c/nv*100}"></div></div><div class="ct">${c}</div></div>`).join('');
    const vl=Object.entries(G.vote.votes).map(([a,b])=>`<div class="vrow">${AVH(G.players[+a])}${esc(pn(+a))} → <b>${AVH(G.players[b])}${esc(pn(b))}</b></div>`).join('');
    let res,btn;
    if(T2.type==='exec'){res=`<p class="msg"><b>${esc(pn(T2.who))}</b> が いちばん 多い</p>`;btn='<button class="btn" data-act="to-exec">つぎへ</button>'}
    else if(T2.type==='runoff'){res='<p class="msg">同じ票数です! 決選投票を します</p>';btn='<button class="btn" data-act="s-runoff">決選投票へ</button>'}
    else{res='<p class="msg">また 同じ票数…くじびきで きめます</p><div class="lot" id="lot">?</div>';btn='<button class="btn" id="lotbtn" data-act="lottery">くじを ひく</button>'}
    h=`<div class="scr center fade">${topbar(`${day}日目 投票`)}<div class="daylabel" style="font-size:24px;margin-top:0">投票の けっか</div>
      <div class="card">${bars}</div><div class="card" style="text-align:left"><div class="small" style="margin-bottom:4px">だれが だれに 入れた?</div><div class="vlist" style="column-count:1">${vl}</div></div>
      ${res}<div class="grow"></div>${btn}</div>`}
  else if(ph==='sExec'){mode='day';const x=G.lastExec,xp=G.players[x];
    h=`<div class="scr center fade">${topbar(`${day}日目 夕方`)}<div class="daylabel">ついほう</div>
      <div class="av" style="width:70px;height:70px;font-size:40px;margin:3vh auto 0">${AVH(xp)}</div>
      <div class="bigname" style="font-size:36px">${esc(xp.name)}</div><div class="san">${xp.me?'(あなた)':'さん'}が</div>
      <p class="msg">村から ついほう されました。${xp.me?'<br><span class="small">ゆうれいとして 見まもろう。みんなの 正体が 見えるよ。</span>':''}</p>
      <div class="pchips" style="justify-content:center;flex-wrap:wrap">${pchips()}</div><div class="grow"></div>
      ${G.winner?'<button class="btn" data-act="to-end">けっかを 見る</button>':'<button class="btn ai" data-act="sn-next">夜に なる</button>'}</div>`}
  return {html:h,mode}}

function pickGridAv(list){return `<div class="pick">${list.map(i=>`<button data-act="pick" data-arg="${i}">${AVH(G.players[i])} ${esc(pn(i))}</button>`).join('')}</div>`}

function vSNight(){
  const day=G.day,me=meP(),r=me.role,noAtk=day===1&&!G.firstAttack,others=alive().filter(i=>i!==ME);
  let body='',btn='<button class="btn" id="decide" data-act="sn-decide" disabled>けってい</button>';
  const wait='<button class="btn kin" data-act="sn-resolve">朝を まつ</button>';
  if(!me.alive){body='<p class="msg" style="margin-top:4vh">あなたは ゆうれい。<br>夜の 村を 見まもっています…</p>';btn=wait}
  else if(G.nsub==='result'){const t=G.seerRes,w=G.players[t].role==='wolf';
    body=`<div class="av" style="width:64px;height:64px;font-size:36px;margin:3vh auto 0">${AVH(G.players[t])}</div><div class="bigname" style="font-size:32px">${esc(pn(t))}</div><div class="san">は…</div><div class="verdict ${w?'w':'h'}">${wr(w)}</div>`;btn=wait}
  else if(r==='wolf'){const mates=alive().filter(i=>i!==ME&&G.players[i].role==='wolf');
    body=`<p class="small">なかま:${mates.length?mates.map(i=>AVH(G.players[i])+esc(pn(i))).join('、'):'いない'}</p>`;
    if(noAtk){body+='<p class="msg">さいしょの 夜は おそいません。</p>';btn=wait}
    else body+=`<p class="msg">今夜 おそう人を えらんでね</p>${pickGridAv(alive().filter(i=>G.players[i].role!=='wolf'))}`}
  else if(r==='seer'){if(me.memo.length)body+=`<div class="card memo">これまでの うらない<br>${me.memo.map(m=>`${esc(pn(m.t))}:<span class="${m.w?'w':'h'}">${wr(m.w)}</span>`).join('<br>')}</div>`;
    const un=others.filter(i=>!me.memo.some(m=>m.t===i));
    if(un.length)body+=`<p class="msg">うらなう人を えらんでね</p>${pickGridAv(un)}`;else{body+='<p class="msg">生きている人は もう ぜんいん うらなったよ。</p>';btn=wait}}
  else if(r==='knight'){body+=`<p class="msg">今夜 まもる人を えらんでね</p>${pickGridAv(others)}`}
  else if(r==='medium'){
    if(G.lastExecDay===day-1&&G.lastExec!=null){const w=G.players[G.lastExec].role==='wolf';
      if(!me.memo.some(m=>m.day===day))me.memo.push({t:G.lastExec,w,day});
      body=`<p class="small">きょう ついほうされた</p><div class="bigname" style="font-size:32px">${AVH(G.players[G.lastExec])}${esc(pn(G.lastExec))}</div><div class="san">は…</div><div class="verdict ${w?'w':'h'}">${wr(w)}</div>`}
    else body='<p class="msg" style="margin-top:4vh">きょうは まだ<br>ついほうされた人が いません。</p>';btn=wait}
  else{body=`<p class="msg" style="margin-top:4vh">みんなが ねむっています…<br>${r==='madman'?'<span class="small">あなたは 人狼の みかた。人狼が だれかは わからない。</span>':'<span class="small">人狼が うろついているかも…</span>'}</p>`;btn=wait}
  return `<div class="scr center fade">${topbar(`${day}日目の夜`)}
    <div class="moonbig" style="width:80px;height:80px;margin-top:2vh"></div><div class="daylabel" style="font-size:24px">${day}日目の 夜</div>
    ${me.alive?`<div class="roletag">${icon(r,22)} あなたは ${R[r].n}</div>`:''}
    ${body}<div class="grow"></div>${btn}</div>`}

/* ---- 夜の しょり ---- */
function sResolve(){
  const day=G.day,noAtk=day===1&&!G.firstAttack,al=alive(),pub=pubSus();
  al.forEach(i=>{const p=G.players[i];if(p.me)return;
    if(p.role==='seer'){const cand=al.filter(j=>j!==i&&!p.memo.some(m=>m.t===j));
      if(cand.length){const t=argmax(cpuSus(i),cand);p.memo.push({t,w:G.players[t].role==='wolf',day})}}
    if(p.role==='medium'&&G.lastExecDay===day-1&&G.lastExec!=null&&!p.memo.some(m=>m.day===day))p.memo.push({t:G.lastExec,w:G.players[G.lastExec].role==='wolf',day});
    if(p.role==='knight'){const sc=claimers('seer').filter(c=>G.players[c].alive),mc=claimers('medium').filter(c=>G.players[c].alive);
      const s=cpuSus(i);const score=j=>(sc.length===1&&sc[0]===j?10:sc.includes(j)?4:0)+(mc.includes(j)?5:0)-s[j]*.3+Math.random()*2;
      const c=al.filter(j=>j!==i);G.night.guard=c.reduce((b,j)=>score(j)>score(b)?j:b,c[0])}});
  let victim=null,guarded=0;
  if(!noAtk){const mw=meP().alive&&meP().role==='wolf';
    if(mw&&G.night.wolf!=null)victim=G.night.wolf;
    else{const c=al.filter(j=>G.players[j].role!=='wolf'),sc=claimers('seer'),mc=claimers('medium');
      const score=j=>(sc.includes(j)?(sc.length===1?9:5):0)+(mc.includes(j)?5:0)-pub[j]*.4+Math.random()*3;
      if(c.length)victim=c.reduce((b,j)=>score(j)>score(b)?j:b,c[0])}
    if(victim!=null&&victim===G.night.guard){guarded=victim+1;victim=null}}
  if(victim!=null)G.players[victim].alive=false;
  G.morning={victim,noAttack:noAtk};G.log.push({type:'night',day,victim,guarded});G.winner=checkWin();
  G.phase='sMorning';save();render();SFX.chirp();
  say('朝に なりました。'+(victim!=null?`${pn(victim)}${G.players[victim].me?'':'さん'}が、人狼に おそわれました。`:'だれも おそわれませんでした。'))}
function sNightStart(){G.phase='sNight';G.nsub='act';G.night={wolf:null,guard:null};tmp=null;save();render();SFX.howl();say(`${G.day}日目の夜に なりました。`)}
function sVoteFinish(){const v=G.vote;
  alive().forEach(i=>{if(!G.players[i].me)v.votes[i]=cpuVote(i,v.cands)});
  finishVote()}

Object.assign(ACT,{
  'to-ssetup'(){view='ssetup';render()},
  scount(a){const o=S.solo,n=Math.min(10,Math.max(5,o.count+ +a));if(n===o.count)return;o.count=n;const r=REC[n];SET_ROLES.forEach((k,i)=>o.roles[k]=r[i]);save();keepScroll=true;render()},
  srole(a){const [r,d]=a.split(',');const o=S.solo;o.roles[r]=Math.max(0,Math.min(r==='wolf'?4:r==='madman'?1:1,o.roles[r]+ +d));save();keepScroll=true;render()},
  srec(){const r=REC[S.solo.count];SET_ROLES.forEach((k,i)=>S.solo.roles[k]=r[i]);save();keepScroll=true;render()},
  myrole(a){S.solo.myRole=a;save();keepScroll=true;render()},
  sstart(){if(soloValid())return;SFX.ok();startSolo()},
  'sn-start'(){sNightStart()},
  'sn-next'(){G.day++;sNightStart()},
  'sn-decide'(){if(tmp==null)return;const r=meP().role;
    if(r==='wolf')G.night.wolf=tmp;else if(r==='knight')G.night.guard=tmp;
    else if(r==='seer'){meP().memo.push({t:tmp,w:G.players[tmp].role==='wolf',day:G.day});G.seerRes=tmp;G.nsub='result';tmp=null;save();render();SFX.flip();return}
    tmp=null;sResolve()},
  'sn-resolve'(){sResolve()},
  'st-begin'(){G.phase='sTalk';G.stage=0;G.queue=genCO();save();render();say('話しあいの 時間です。')},
  'st-op'(){G.stage=2;G.queue.push(...genOpinions());save();pump()},
  'sv-begin'(){if(qBusy||G.queue.length)return;G.vote={round:1,cands:alive(),voters:alive(),votes:{}};G.phase='sVote';tmp=null;save();render()},
  'sv-decide'(){if(meP().alive){if(tmp==null)return;G.vote.votes[ME]=tmp}tmp=null;sVoteFinish()},
  's-runoff'(){G.vote={round:2,cands:G.tally.tied,voters:alive(),votes:{}};G.phase='sVote';tmp=null;save();render()},
  speak(){openSpeak()}
});

/* 発言メニュー */
let SP=null;
function openSpeak(){SP={};const me=meP(),day=G.day;
  const canSeer=G.said.seer!==day,canMed=G.said.medium!==day&&G.lastExecDay===day-1&&G.lastExec!=null;
  mbox.innerHTML=`<h3>なにを 言う?</h3><div class="splist">
    <button data-sp="acc">🔍 ○○が あやしい</button>
    <button data-sp="trust">🤝 ○○は しんじられる</button>
    ${canSeer?'<button data-sp="seer">🔮 占い師だと 名のる / 占いけっか</button>':''}
    ${canMed?'<button data-sp="medium">🕯 霊媒師だと 名のる / 霊媒けっか</button>':''}
    <button data-sp="vil">🏠 わたしは 村人だよ</button></div>
    <p class="small" style="text-align:center;margin-top:10px">うそを ついても いいよ</p>
    <button class="btn sub" data-m="close" style="margin-top:6px">やめる</button>`;
  modal.classList.add('show')}
function spPick(title,list,next){mbox.innerHTML=`<h3>${title}</h3><div class="pick">${list.map(i=>`<button data-spt="${i}">${AVH(G.players[i])} ${esc(pn(i))}</button>`).join('')}</div>
  <button class="btn sub" data-m="close" style="margin-top:12px">やめる</button>`;SP.next=next}
function spWR(title){mbox.innerHTML=`<h3>${title}</h3><div class="row2"><button class="btn" data-spw="1">人狼</button><button class="btn ai" data-spw="0">人間</button></div>
  <button class="btn sub" data-m="close" style="margin-top:12px">やめる</button>`}
modal.addEventListener('click',e=>{const a=e.target.closest('[data-sp],[data-spt],[data-spw]');if(!a||!SP)return;SFX.tap();
  const others=alive().filter(i=>i!==ME);
  if(a.dataset.sp){const k=a.dataset.sp;SP.kind=k;
    if(k==='vil'){modal.classList.remove('show');humanSay('vil')}
    else if(k==='medium'){spWR(`${esc(pn(G.lastExec))}は?`)}
    else spPick(k==='seer'?'だれを うらなった?':k==='acc'?'だれが あやしい?':'だれを しんじる?',k==='seer'?G.players.map((p,i)=>i).filter(i=>i!==ME):others)}
  else if(a.dataset.spt!=null){SP.t=+a.dataset.spt;if(SP.kind==='seer')spWR(`${esc(pn(SP.t))}は?`);else{modal.classList.remove('show');humanSay(SP.kind,SP.t)}}
  else if(a.dataset.spw!=null){modal.classList.remove('show');const w=a.dataset.spw==='1';humanSay(SP.kind,SP.kind==='medium'?G.lastExec:SP.t,w)}});

load();
if(G&&G.phase==='talk'&&G.talkRun){G.talkLeftSec=talkLeft();G.talkRun=false}
render();
if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost')&&!/claude/.test(location.hostname)){
  try{navigator.serviceWorker.register('sw.js').catch(()=>{})}catch(e){}}
