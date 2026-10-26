(function(){
const PASS = 75;
const MODES = {
  mock:     { label:"Full mock exam", n:60, minutes:120, feedback:false },
  practice: { label:"Practice set", n:20, minutes:0, feedback:true },
  drill:    { label:"Domain drill", n:0, minutes:0, feedback:true },
  missed:   { label:"Missed questions", n:0, minutes:0, feedback:true }
};
const $ = s => document.querySelector(s);
const app = $("#app");
BANK.forEach((q,i)=>{ q.id = i; });
// Saved data refers to questions by position. Drop anything the current bank cannot serve.
const validItem = it => it && BANK[it.id] && Array.isArray(it.order) && it.order.length===BANK[it.id].o.length && Array.isArray(it.pick);
const validSession = s => s && MODES[s.mode] && Array.isArray(s.items) && s.items.length>0 && s.items.every(validItem) && s.cur>=0 && s.cur<s.items.length;

const store = {
  get(k, d){ try { const v = localStorage.getItem("kks:"+k); return v ? JSON.parse(v) : d; } catch(e){ return d; } },
  set(k, v){ try { localStorage.setItem("kks:"+k, JSON.stringify(v)); } catch(e){} }
};

function shuffle(a){ a = a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function esc(s){ return String(s).replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c])); }

function pickMock(n){
  const keys = Object.keys(DOMAINS);
  const tw = keys.reduce((s,k)=>s+DOMAINS[k].w,0);
  const raw = keys.map(k=>({k, v:n*DOMAINS[k].w/tw}));
  raw.forEach(r=>{ r.q = Math.floor(r.v); r.rem = r.v - r.q; });
  let left = n - raw.reduce((s,r)=>s+r.q,0);
  raw.slice().sort((a,b)=>b.rem-a.rem).forEach(r=>{ if(left>0){ r.q++; left--; } });
  let out = [];
  raw.forEach(r=>{
    const pool = shuffle(BANK.filter(q=>q.d===r.k));
    out = out.concat(pool.slice(0, Math.min(r.q, pool.length)));
  });
  if (out.length < n) {
    const used = new Set(out.map(q=>q.id));
    out = out.concat(shuffle(BANK.filter(q=>!used.has(q.id))).slice(0, n-out.length));
  }
  return shuffle(out);
}

function buildSession(mode, opts){
  let qs;
  if (mode==="mock") qs = pickMock(MODES.mock.n);
  else if (mode==="practice") qs = shuffle(BANK).slice(0, MODES.practice.n);
  else if (mode==="drill") qs = shuffle(BANK.filter(q=>q.d===opts.domain));
  else { const m = new Set(getMissed()); qs = shuffle(BANK.filter(q=>m.has(q.id))); }
  return {
    mode, domain: opts && opts.domain, started: Date.now(),
    deadline: MODES[mode].minutes ? Date.now() + MODES[mode].minutes*60000 : 0,
    items: qs.map(q=>({ id:q.id, order: shuffle(q.o.map((_,i)=>i)), pick:[], flag:false, checked:false })),
    cur: 0, done: false
  };
}

let S = null, timer = null;
function getMissed(){ const m = store.get("missed", []); return Array.isArray(m) ? m.filter(id=>BANK[id]) : []; }
function getSession(){ const s = store.get("session", null); if (validSession(s)) return s; if (s) store.set("session", null); return null; }
function save(){ if (S && !S.done) store.set("session", S); else store.set("session", null); }

// ---------- Home ----------
function home(){
  clearInterval(timer);
  let hist = store.get("history", []); if (!Array.isArray(hist)) hist = [];
  const missed = getMissed();
  const resume = getSession();
  const last = hist.slice(-8).reverse();
  const domOpts = Object.keys(DOMAINS).map(k=>`<option value="${k}">${esc(DOMAINS[k].name)} (${BANK.filter(q=>q.d===k).length})</option>`).join("");
  app.innerHTML = `
  <header class="mast blueprint">
    <p class="eyebrow">Unofficial practice simulator</p>
    <h1>Kong Konnect Certified Associate</h1>
    <p class="sub">Practice exams, domain drills and hands-on labs</p>
    <p class="lede">${BANK.length} scenario questions mapped to the October 2026 exam outline. The mock exam uses 60 questions, 120 minutes and a 75% pass mark. Questions are written from Kong documentation; they are not real exam items.</p>
  </header>
  ${resume ? `<div class="resume"><span>You have an unfinished ${esc(MODES[resume.mode].label.toLowerCase())}, question ${resume.cur+1} of ${resume.items.length}.</span><span class="row"><button class="btn" id="resume">Resume</button><button class="btn ghost" id="discard">Discard</button></span></div>` : ""}
  <section class="modes">
    <article class="mode primary">
      <h2>Full mock exam</h2>
      <p>60 questions weighted by domain, 120-minute timer, no feedback until you submit. Flag questions and review them before submitting.</p>
      <button class="btn" data-start="mock">Start mock exam</button>
    </article>
    <article class="mode">
      <h2>Practice set</h2>
      <p>20 random questions. The answer and explanation appear after each one.</p>
      <button class="btn ghost" data-start="practice">Start practice</button>
    </article>
    <article class="mode">
      <h2>Domain drill</h2>
      <p>Every question of one domain, with immediate feedback.</p>
      <label class="sr" for="dsel">Domain</label>
      <select id="dsel">${domOpts}</select>
      <button class="btn ghost" data-start="drill">Start drill</button>
    </article>
    <article class="mode">
      <h2>Missed questions</h2>
      <p>${missed.length ? `${missed.length} question${missed.length>1?"s":""} you answered wrong. Answer one right and it leaves the list.` : "Questions you miss in any mode collect here."}</p>
      <button class="btn ghost" data-start="missed" ${missed.length?"":"disabled"}>Review missed</button>
    </article>
  </section>
  <section class="split">
    <div>
      <h3>Recent attempts</h3>
      ${last.length ? `<table class="hist"><thead><tr><th>Date</th><th>Mode</th><th class="num">Score</th><th>Result</th></tr></thead><tbody>${last.map(h=>`<tr><td>${new Date(h.at).toLocaleDateString("en-US",{month:"short",day:"numeric"})} ${new Date(h.at).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}</td><td>${esc(h.label)}</td><td class="num">${h.score}%</td><td><span class="pill ${h.score>=PASS?"ok":"bad"}">${h.score>=PASS?"Pass":"Below 75%"}</span></td></tr>`).join("")}</tbody></table>` : `<p class="muted">No attempts yet. Take the mock exam once as a baseline before studying.</p>`}
    </div>
    <div>
      <h3>Domain weights used in the mock</h3>
      <ul class="weights">${Object.keys(DOMAINS).map(k=>`<li><span>${esc(DOMAINS[k].name)}</span><span class="bar"><i style="width:${DOMAINS[k].w*4}%"></i></span><span class="num">${DOMAINS[k].w}%</span></li>`).join("")}</ul>
      <p class="muted small">Kong does not publish weights. These follow the outline: Platform Fundamentals, Core Services, Applications, Management & Operations.</p>
    </div>
  </section>
  <section>
    <h3>Hands-on drills</h3>
    <p class="muted">The real exam may include performance-based lab tasks. Do these in a Konnect trial; the simulator cannot grade them.</p>
    <div class="drills">${DRILLS.map((d,i)=>`<details class="drill"><summary><span class="dn">${i+1}</span>${esc(d.t)}</summary><p>${esc(d.s)}</p>${d.c?`<pre><code>${esc(d.c)}</code></pre>`:""}</details>`).join("")}</div>
  </section>
`;
  app.querySelectorAll("[data-start]").forEach(b=>b.onclick=()=>{
    const mode = b.dataset.start;
    S = buildSession(mode, { domain: $("#dsel").value });
    if (!S.items.length) return;
    save(); exam(true);
  });
  const r = $("#resume"); if (r) r.onclick = ()=>{ S = resume; if (S.deadline && S.deadline<=Date.now()) finish(true); else exam(true); };
  const dd = $("#discard"); if (dd) dd.onclick = ()=>{ store.set("session", null); home(); };
  window.scrollTo(0,0);
}

// ---------- Exam ----------
function fmt(ms){ ms=Math.max(0,ms); const t=Math.floor(ms/1000); const h=Math.floor(t/3600), m=Math.floor(t%3600/60), s=t%60; return (h?h+":":"")+String(m).padStart(h?2:1,"0")+":"+String(s).padStart(2,"0"); }
function isRight(it){ const q=BANK[it.id]; return it.pick.length===q.a.length && q.a.every(a=>it.pick.includes(a)); }

function exam(moved){
  const M = MODES[S.mode];
  const it = S.items[S.cur], q = BANK[it.id];
  const multi = q.a.length > 1;
  const answered = S.items.filter(x=>x.pick.length).length;
  const showFb = M.feedback && it.checked;
  app.innerHTML = `
  <div class="bar-top">
    <button class="btn link" id="quit">Save and exit</button>
    <span class="mlabel">${esc(M.label)}${S.domain && S.mode==="drill" ? " · "+esc(DOMAINS[S.domain].name):""}</span>
    <span class="prog">${answered}/${S.items.length} answered</span>
    ${S.deadline ? `<span class="clock" id="clock" aria-live="off">${fmt(S.deadline-Date.now())}</span>`:""}
  </div>
  <div class="layout">
    <main class="qcard">
      <div class="qmeta"><span>Question ${S.cur+1} of ${S.items.length}</span><span class="tag">${esc(DOMAINS[q.d].name)}</span></div>
      <h2 class="qtext">${esc(q.q)}</h2>
      ${q.code?`<pre class="qcode"><code>${esc(q.code)}</code></pre>`:""}
      ${multi?`<p class="hint">Select ${q.a.length} answers.</p>`:""}
      <div class="opts" role="${multi?"group":"radiogroup"}">
        ${it.order.map((oi,pos)=>{
          const sel = it.pick.includes(oi);
          let cls = sel ? "sel" : "";
          if (showFb){ if (q.a.includes(oi)) cls += " right"; else if (sel) cls += " wrong"; }
          return `<button class="opt ${cls}" data-o="${oi}" ${showFb?"disabled":""} aria-pressed="${sel}"><span class="key">${"ABCDE"[pos]}</span><span>${esc(q.o[oi])}</span></button>`;
        }).join("")}
      </div>
      ${showFb ? `<div class="fb ${isRight(it)?"ok":"bad"}"><strong>${isRight(it)?"Correct.":"Not quite."}</strong> ${esc(q.x)}</div>`:""}
      <div class="actions">
        <button class="btn ghost" id="prev" ${S.cur===0?"disabled":""}>Previous</button>
        ${M.feedback ? "" : `<button class="btn ghost flagb ${it.flag?"on":""}" id="flag">${it.flag?"Flagged":"Flag for review"}</button>`}
        ${M.feedback && !it.checked ? `<button class="btn" id="check" ${it.pick.length===q.a.length?"":"disabled"}>Check answer</button>` :
          (S.cur < S.items.length-1 ? `<button class="btn" id="next">Next</button>` : `<button class="btn" id="finish">${M.feedback?"See results":"Review and submit"}</button>`)}
      </div>
    </main>
    <aside class="nav">
      <p class="navh">Questions</p>
      <div class="grid">${S.items.map((x,i)=>{
        let c = x.pick.length ? "a" : "";
        if (M.feedback && x.checked) c = isRight(x) ? "r" : "w";
        return `<button class="cell ${c} ${x.flag?"f":""} ${i===S.cur?"cur":""}" data-go="${i}" aria-label="Question ${i+1}">${i+1}</button>`;
      }).join("")}</div>
      ${M.feedback ? "" : `<p class="legend"><span class="cell a"></span>answered <span class="cell f"></span>flagged</p><button class="btn ghost wide" id="submit2">Review and submit</button>`}
    </aside>
  </div>`;

  app.querySelectorAll(".opt").forEach(b=>b.onclick=()=>{
    const o = +b.dataset.o;
    // Multi-answer: at the limit, a new pick replaces the oldest one instead of being ignored.
    if (multi){ it.pick = it.pick.includes(o) ? it.pick.filter(x=>x!==o) : it.pick.concat(o).slice(-q.a.length); }
    else it.pick = [o];
    save(); exam();
  });
  app.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>{ S.cur=+b.dataset.go; save(); exam(true); });
  const on=(id,f)=>{ const e=$("#"+id); if(e) e.onclick=f; };
  on("prev", ()=>{ S.cur--; save(); exam(true); });
  on("next", ()=>{ S.cur++; save(); exam(true); });
  on("flag", ()=>{ it.flag=!it.flag; save(); exam(); });
  on("check", ()=>{ it.checked=true; trackMiss(it); save(); exam(); });
  on("finish", ()=> M.feedback ? finish() : reviewSubmit());
  on("submit2", reviewSubmit);
  on("quit", ()=>{ save(); home(); });

  clearInterval(timer);
  if (S.deadline){
    timer = setInterval(()=>{
      const left = S.deadline-Date.now(); const c=$("#clock");
      if (c){ c.textContent = fmt(left); c.classList.toggle("low", left<10*60000); }
      if (left<=0){ clearInterval(timer); finish(true); }
    }, 1000);
  }
  if (moved) window.scrollTo(0,0);
}

function trackMiss(it){
  const m = new Set(getMissed());
  if (isRight(it)) m.delete(it.id); else m.add(it.id);
  store.set("missed", [...m]);
}

function reviewSubmit(){
  const un = S.items.filter(x=>!x.pick.length).length, fl = S.items.filter(x=>x.flag).length;
  window.scrollTo(0,0);
  app.innerHTML = `
  <div class="confirm">
    <h2>Submit the exam?</h2>
    <p>${un ? `${un} question${un>1?"s are":" is"} unanswered and will count as wrong.` : "All questions are answered."} ${fl ? `${fl} flagged for review.` : ""}</p>
    <div class="grid big">${S.items.map((x,i)=>`<button class="cell ${x.pick.length?"a":""} ${x.flag?"f":""}" data-go="${i}">${i+1}</button>`).join("")}</div>
    <div class="actions"><button class="btn ghost" id="back">Back to questions</button><button class="btn" id="submit">Submit exam</button></div>
  </div>`;
  app.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>{ S.cur=+b.dataset.go; save(); exam(true); });
  $("#back").onclick = ()=>exam(true);
  $("#submit").onclick = ()=>finish();
}

// ---------- Results ----------
function finish(timeUp){
  clearInterval(timer);
  S.done = true;
  // Mock: every question counts. Feedback modes: checked ones were tracked already, add answered-but-unchecked ones.
  S.items.forEach(x=>{ if (!MODES[S.mode].feedback || (x.pick.length && !x.checked)) trackMiss(x); });
  const total = S.items.length, right = S.items.filter(isRight).length;
  const score = Math.round(right/total*100);
  const byD = {};
  S.items.forEach(x=>{ const d=BANK[x.id].d; byD[d]=byD[d]||{r:0,n:0}; byD[d].n++; if(isRight(x)) byD[d].r++; });
  let hist = store.get("history", []); if (!Array.isArray(hist)) hist = [];
  hist.push({ at: Date.now(), label: MODES[S.mode].label + (S.mode==="drill" ? ": "+DOMAINS[S.domain].name : ""), score, mins: Math.round((Date.now()-S.started)/60000) });
  store.set("history", hist.slice(-50));
  store.set("session", null);
  const weak = Object.keys(byD).filter(d=>byD[d].r/byD[d].n < .7).map(d=>DOMAINS[d].name);
  const pass = score >= PASS;
  app.innerHTML = `
  <section class="result ${pass?"ok":"bad"}">
    <p class="eyebrow">${esc(MODES[S.mode].label)}${timeUp?" · time expired":""}</p>
    <div class="scoreline"><span class="big">${score}%</span><span class="verdict">${pass?"Above the 75% pass mark":"Below the 75% pass mark"}</span></div>
    <p>${right} of ${total} correct in ${Math.round((Date.now()-S.started)/60000)} minutes. ${weak.length ? "Below 70%: "+esc(weak.join(", "))+"." : "No domain below 70%."}</p>
    <div class="actions"><button class="btn" id="home">Back to start</button><button class="btn ghost" id="again">Same mode again</button></div>
  </section>
  <section>
    <h3>Score by domain</h3>
    <ul class="dres">${Object.keys(byD).sort((a,b)=>byD[a].r/byD[a].n-byD[b].r/byD[b].n).map(d=>{ const p=Math.round(byD[d].r/byD[d].n*100); return `<li><span>${esc(DOMAINS[d].name)}</span><span class="bar"><i class="${p>=PASS?"ok":p>=60?"mid":"bad"}" style="width:${p}%"></i><b style="left:${PASS}%"></b></span><span class="num">${byD[d].r}/${byD[d].n}</span></li>`; }).join("")}</ul>
  </section>
  <section>
    <h3>Answer review</h3>
    <div class="filters"><button class="chip on" data-f="all">All</button><button class="chip" data-f="wrong">Wrong only</button></div>
    <ol class="review">${S.items.map((x,i)=>{ const q=BANK[x.id], ok=isRight(x);
      return `<li class="${ok?"rk":"rw"}"><p class="rq"><span class="pill ${ok?"ok":"bad"}">${ok?"Correct":"Wrong"}</span> <span class="muted small">${esc(DOMAINS[q.d].name)}</span></p><p class="rt">${i+1}. ${esc(q.q)}</p>${q.code?`<pre class="qcode"><code>${esc(q.code)}</code></pre>`:""}
      <ul class="ra">${x.order.map(oi=>[q.o[oi],oi]).map(([o,oi])=>`<li class="${q.a.includes(oi)?"c":""} ${x.pick.includes(oi)&&!q.a.includes(oi)?"x":""}">${q.a.includes(oi)?"✓":x.pick.includes(oi)?"✗":"·"} ${esc(o)}${x.pick.includes(oi)?' <span class="muted small">(your answer)</span>':""}</li>`).join("")}</ul>
      <p class="rx">${esc(q.x)}</p></li>`; }).join("")}</ol>
  </section>`;
  $("#home").onclick = home;
  const mode = S.mode, dom = S.domain;
  $("#again").onclick = ()=>{ S = buildSession(mode, {domain:dom}); if(!S.items.length){ home(); return; } save(); exam(true); };
  app.querySelectorAll("[data-f]").forEach(c=>c.onclick=()=>{
    app.querySelectorAll("[data-f]").forEach(x=>x.classList.toggle("on", x===c));
    app.querySelectorAll(".review > li").forEach(li=>li.hidden = c.dataset.f==="wrong" && li.classList.contains("rk"));
  });
  window.scrollTo(0,0);
}

home();
})();
