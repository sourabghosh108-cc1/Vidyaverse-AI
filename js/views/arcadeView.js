/**
 * Learning Arcade — v1.0
 * 13 educational mini-games integrated with XP, achievements, and streaks.
 * Games 1-10: fully offline. Games 11-13: Claude API powered.
 */

import { store } from "../store.js";
import { ui } from "../ui.js";
import { gamification } from "../gamification.js";

const FLASHCARDS = [
  { q: "Force = Mass × ?", a: "Acceleration", hint: "F = ma", sub: "Physics" },
  { q: "SI unit of electric current?", a: "Ampere", hint: "André-Marie Ampère", sub: "Physics" },
  { q: "Mitochondria is the _____ of the cell", a: "Powerhouse", hint: "ATP production", sub: "Biology" },
  { q: "Speed of light in vacuum?", a: "3 × 10⁸ m/s", hint: "≈ 3×10⁸", sub: "Physics" },
  { q: "Derivative of x²?", a: "2x", hint: "Power rule: n·xⁿ⁻¹", sub: "Maths" },
  { q: "pH of pure water?", a: "7", hint: "Neutral solution", sub: "Chemistry" },
  { q: "sin(90°) = ?", a: "1", hint: "Unit circle top", sub: "Maths" },
  { q: "Avogadro's number?", a: "6.022 × 10²³", hint: "Particles per mole", sub: "Chemistry" },
  { q: "Photosynthesis equation product?", a: "Glucose + Oxygen", hint: "CO₂ + H₂O → …", sub: "Biology" },
  { q: "Area of a circle?", a: "πr²", hint: "r = radius", sub: "Maths" },
  { q: "E = ?", a: "mc²", hint: "Einstein's mass-energy", sub: "Physics" },
  { q: "Boiling point of water at sea level?", a: "100°C", hint: "Standard conditions", sub: "Chemistry" },
];

const MEMORY_PAIRS = [
  { t: "Mitochondria", d: "Powerhouse of the cell" },
  { t: "Nucleus", d: "Control centre of the cell" },
  { t: "Ribosome", d: "Protein synthesis site" },
  { t: "Chloroplast", d: "Site of photosynthesis" },
  { t: "Osmosis", d: "Water movement across membrane" },
  { t: "Newton", d: "Unit of force" },
  { t: "Voltage", d: "Electric potential difference" },
  { t: "Covalent Bond", d: "Sharing of electron pairs" },
];

const FORMULAS = [
  { display: "F = ___ × a", blank: "m", full: "F = m × a", name: "Newton's 2nd Law", sub: "Physics" },
  { display: "v = u + ___t", blank: "a", full: "v = u + at", name: "Equation of motion", sub: "Physics" },
  { display: "E = mc___", blank: "²", full: "E = mc²", name: "Mass-energy equivalence", sub: "Physics" },
  { display: "A = π___²", blank: "r", full: "A = πr²", name: "Area of circle", sub: "Maths" },
  { display: "PV = ___RT", blank: "n", full: "PV = nRT", name: "Ideal Gas Law", sub: "Chemistry" },
  { display: "pH = -log[___]", blank: "H⁺", full: "pH = -log[H⁺]", name: "pH definition", sub: "Chemistry" },
  { display: "sin²θ + cos²θ = ___", blank: "1", full: "sin²θ + cos²θ = 1", name: "Pythagorean identity", sub: "Maths" },
  { display: "λ = h / ___", blank: "p", full: "λ = h / p", name: "de Broglie wavelength", sub: "Physics" },
  { display: "P = I × ___", blank: "V", full: "P = I × V", name: "Electrical power", sub: "Physics" },
  { display: "V = ___ × h", blank: "A", full: "V = A × h", name: "Volume of prism", sub: "Maths" },
];

const TF = [
  { s: "The Earth revolves around the Sun.", a: true },
  { s: "Electrons carry positive charge.", a: false },
  { s: "DNA is double-stranded.", a: true },
  { s: "Sound travels faster than light.", a: false },
  { s: "Water boils at 100°C at sea level.", a: true },
  { s: "Plants absorb CO₂ during photosynthesis.", a: true },
  { s: "The atomic number of Carbon is 6.", a: true },
  { s: "Newton's 1st law is about acceleration.", a: false },
  { s: "Ohm's Law: V = I × R.", a: true },
  { s: "The SI unit of energy is Watt.", a: false },
  { s: "Mitosis produces 4 daughter cells.", a: false },
  { s: "All acids have pH < 7.", a: true },
  { s: "Photons have mass.", a: false },
  { s: "Gold is a good conductor of electricity.", a: true },
  { s: "√144 = 14.", a: false },
  { s: "Humans have 46 chromosomes.", a: true },
  { s: "Momentum = mass × velocity.", a: true },
  { s: "The moon has its own light.", a: false },
  { s: "1 mole = 6.022 × 10²³ particles.", a: true },
  { s: "Density = mass / volume.", a: true },
];

const BINGO_QS = [
  { q: "Unit of force?", a: "newton" }, { q: "Powerhouse of cell?", a: "mitochondria" },
  { q: "pH of acid?", a: "7" }, { q: "Area formula circle?", a: "r" },
  { q: "DNA base types?", a: "4" }, { q: "E = mc²: c is?", a: "light" },
  { q: "Human chromosomes?", a: "46" }, { q: "Boiling point water?", a: "100" },
  { q: "sin(0°) = ?", a: "0" }, { q: "Photosynthesis reactant?", a: "co" },
  { q: "Avogadro's number?", a: "6.022" }, { q: "Newton's 3rd law?", a: "reaction" },
  { q: "FREE", a: "" },
  { q: "Atomic number of H?", a: "1" }, { q: "KE formula?", a: "mv" },
  { q: "Ohm's Law?", a: "vir" }, { q: "Cell wall material?", a: "cellulose" },
  { q: "∫x dx = ?", a: "x2" }, { q: "HCl is?", a: "acid" },
  { q: "Blood pH?", a: "7.4" }, { q: "Derivative of sin(x)?", a: "cos" },
  { q: "Density = mass/?", a: "volume" }, { q: "F = ma; solve for m?", a: "f/a" },
  { q: "Ribosome function?", a: "protein" }, { q: "Speed formula?", a: "d/t" },
];

const TOWER_FLOORS = [
  { f:1,  q:"7 × 8 = ?",                         opts:["54","56","58","60"],              c:1, xp:30, sub:"Maths"     },
  { f:2,  q:"Symbol for Gold?",                   opts:["Go","Gd","Au","Ag"],              c:2, xp:30, sub:"Chemistry" },
  { f:3,  q:"Largest planet in Solar System?",    opts:["Saturn","Jupiter","Neptune","Uranus"], c:1, xp:30, sub:"Science" },
  { f:4,  q:"A hexagon has how many sides?",      opts:["5","6","7","8"],                  c:1, xp:30, sub:"Maths"     },
  { f:5,  q:"🦂 MINI BOSS — F=20N,a=4m/s², m=?", opts:["4 kg","5 kg","6 kg","8 kg"],     c:1, xp:80, sub:"Physics",  tag:"boss" },
  { f:6,  q:"sin(30°) = ?",                       opts:["0","0.5","1","√3/2"],             c:1, xp:50, sub:"Maths"     },
  { f:7,  q:"Hybridisation of C in CO₂?",         opts:["sp³","sp²","sp","dsp²"],          c:2, xp:50, sub:"Chemistry" },
  { f:8,  q:"Powerhouse of the cell?",            opts:["Ribosome","Golgi","Mitochondria","Nucleus"], c:2, xp:50, sub:"Biology" },
  { f:9,  q:"Carnot efficiency at 500K/300K?",    opts:["30%","40%","50%","60%"],          c:1, xp:50, sub:"Physics"   },
  { f:10, q:"⚡ SPEED — ∫2x dx = ?",              opts:["x","x²","x²+C","2x²+C"],         c:2, xp:100,sub:"Maths",    tag:"speed" },
  { f:11, q:"lim(x→0) sinx/x = ?",               opts:["0","∞","1","undefined"],          c:2, xp:70, sub:"Maths"     },
  { f:12, q:"Oxidation state of S in H₂SO₄?",    opts:["+4","+6","+2","+8"],             c:1, xp:70, sub:"Chemistry" },
  { f:13, q:"Okazaki fragments form on?",         opts:["Leading","Both","Lagging","Template"], c:2, xp:70, sub:"Biology" },
  { f:14, q:"NaCl bond type?",                    opts:["Covalent","Ionic","Metallic","Hydrogen"], c:1, xp:70, sub:"Chemistry" },
  { f:15, q:"🤖 BOSS — p doubles → λ changes?",  opts:["Doubles","Halves","Same","Quadruples"], c:1, xp:150,sub:"Physics",tag:"boss" },
];

const BOSSES = [
  { id:"algebra",   name:"Algebra Titan",    emoji:"🧮", color:"#3b82f6", hp:100, dmg:20,
    qs:[ {q:"Solve: 2x+6=20",opts:["5","6","7","8"],c:2}, {q:"Factor: x²−9",opts:["(x+3)(x−3)","(x−3)²","x(x−9)","(x+9)"],c:0},
         {q:"f(x)=3x², f'(x)=?",opts:["3x","6x","3x²","6x²"],c:1}, {q:"Solve: x/4=7",opts:["24","28","32","11"],c:1},
         {q:"√144=?",opts:["11","12","13","14"],c:1} ] },
  { id:"physics",   name:"Physics Overlord", emoji:"⚡", color:"#f59e0b", hp:120, dmg:25,
    qs:[ {q:"5kg at 3m/s², F=?",opts:["8N","12N","15N","20N"],c:2}, {q:"KE: 2kg at 4m/s?",opts:["8J","12J","16J","32J"],c:2},
         {q:"R₁=3Ω,R₂=7Ω series?",opts:["4Ω","10Ω","21Ω","5Ω"],c:1}, {q:"λ×f=?",opts:["speed","energy","momentum","force"],c:0},
         {q:"V=12V,R=4Ω,I=?",opts:["2A","3A","4A","48A"],c:1} ] },
  { id:"chemistry", name:"Chemistry Dragon", emoji:"🐉", color:"#22c55e", hp:110, dmg:22,
    qs:[ {q:"HCl+NaOH→?",opts:["NaCl+H₂O","Na+Cl","NaH+ClOH","NaOHCl"],c:0},
         {q:"S state in H₂SO₄?",opts:["+4","+6","+2","+8"],c:1}, {q:"Avogadro's?",opts:["6×10²²","6.022×10²³","6.022×10²⁴","3.14×10²³"],c:1},
         {q:"Exothermic?",opts:["Photosynthesis","Electrolysis","Combustion","Melting"],c:2},
         {q:"pH of 0.01M HCl?",opts:["1","2","3","4"],c:1} ] },
  { id:"history",   name:"History Emperor",  emoji:"👑", color:"#a855f7", hp:100, dmg:20,
    qs:[ {q:"India independence year?",opts:["1945","1947","1950","1942"],c:1},
         {q:"Constitution adopted?",opts:["15 Aug 47","26 Jan 50","26 Nov 49","2 Oct 48"],c:2},
         {q:"1st PM of India?",opts:["Patel","Nehru","Gandhi","Ambedkar"],c:1},
         {q:"1st Battle of Panipat?",opts:["1526","1556","1761","1600"],c:0},
         {q:"Who drafted the Indian Constitution?",opts:["Gandhi","Nehru","Ambedkar","Patel"],c:2} ] },
];

const MISTAKES = [
  { title:"Newton's 2nd Law Calculation", steps:[
    {txt:"Given: F=30N, m=5kg", w:false},
    {txt:"a = F × m (should be F ÷ m)", w:true},
    {txt:"a = 30 × 5 = 150 m/s²", w:true},
    {txt:"Unit: m/s² ✓", w:false},
  ], exp:"Steps 2 & 3 are wrong. Correct: a = F/m = 30/5 = 6 m/s²"},
  { title:"Quadratic: x²−5x+6=0", steps:[
    {txt:"Need two numbers × to +6, add to −5", w:false},
    {txt:"Pick −2 and −3 ✓", w:false},
    {txt:"(x+2)(x+3)=0 — wrong signs!", w:true},
    {txt:"Roots: x=−2, x=−3 (should be +2,+3)", w:true},
  ], exp:"Step 3 has wrong signs. Correct: (x−2)(x−3)=0 → x=2, x=3"},
  { title:"Photoelectric Effect Energy", steps:[
    {txt:"hν = W₀ + KE_max ✓", w:false},
    {txt:"h=6.63×10⁻³⁴, ν=6×10¹⁴ Hz", w:false},
    {txt:"E = h + ν (addition instead of multiplication!)", w:true},
    {txt:"E ≈ 6×10¹⁴ J — wildly wrong", w:true},
  ], exp:"Step 3 is wrong. E = h × ν ≈ 3.98×10⁻¹⁹ J"},
];

const GAME_META = [
  { id:"flashcard", icon:"⚡", name:"Flashcard Battle",    desc:"Race AI — fastest correct wins bonus XP",           xp:"+30 XP/win",   diff:"Easy",   color:"#3b82f6" },
  { id:"memory",    icon:"🧠", name:"Memory Match",         desc:"Match concepts with definitions on a hidden grid",   xp:"+50 XP/win",   diff:"Medium", color:"#a855f7" },
  { id:"formula",   icon:"🔢", name:"Formula Sprint",       desc:"Fill missing parts of science & maths formulas",     xp:"+40 XP/run",   diff:"Medium", color:"#f59e0b" },
  { id:"truefalse", icon:"⚡", name:"True or False Rush",   desc:"Rapid-fire statements — answer before time's up",   xp:"+20 XP/Q",     diff:"Easy",   color:"#22c55e" },
  { id:"bingo",     icon:"🎯", name:"Concept Bingo",        desc:"Answer questions to mark your 5×5 bingo card",      xp:"+60 XP/bingo", diff:"Medium", color:"#ef4444" },
  { id:"tower",     icon:"🏰", name:"Knowledge Tower",      desc:"Climb 15 floors — boss battles await!",             xp:"+500 XP/top",  diff:"Hard",   color:"#8b5cf6" },
  { id:"boss",      icon:"⚔️", name:"Boss Battles",         desc:"Fight subject bosses — drain HP with knowledge",    xp:"+150 XP/boss", diff:"Hard",   color:"#dc2626" },
  { id:"mistake",   icon:"🔍", name:"Detect the Mistake",   desc:"Find errors in AI-generated wrong solutions",       xp:"+60 XP/find",  diff:"Medium", color:"#06b6d4" },
  { id:"streak",    icon:"🔥", name:"Streak Master",        desc:"Daily missions — maintain streaks for bonus XP",    xp:"+100 XP/day",  diff:"Easy",   color:"#f97316" },
  { id:"treasure",  icon:"🗺️", name:"Treasure Hunt",        desc:"Explore a knowledge map — unlock regions",          xp:"+80 XP/zone",  diff:"Medium", color:"#10b981" },
  { id:"debate",    icon:"🎭", name:"AI Debate Arena",      desc:"Argue against Claude AI — scored on logic",         xp:"+100 XP",      diff:"Hard",   color:"#7c3aed", ai:true },
  { id:"professor", icon:"👨‍🏫",name:"Professor Challenge",  desc:"AI quizzes your conceptual depth",                  xp:"+80 XP",       diff:"Hard",   color:"#b45309", ai:true },
  { id:"eli10",     icon:"🧒", name:"Explain Like I'm 10",  desc:"Simplify tough topics — AI evaluates clarity",      xp:"+70 XP",       diff:"Medium", color:"#0891b2", ai:true },
];

class ArcadeView {
  constructor() { this._tids = []; this.stats = this._load(); }
  _load() { try { return JSON.parse(localStorage.getItem("vv_arcade")||"{}"); } catch { return {}; } }
  _save() { localStorage.setItem("vv_arcade", JSON.stringify(this.stats)); }
  _win(id, xp) {
    if (!this.stats[id]) this.stats[id] = { plays:0, wins:0, xp:0 };
    this.stats[id].plays++; this.stats[id].wins++; this.stats[id].xp += xp; this._save();
  }
  _play(id) { if (!this.stats[id]) this.stats[id]={plays:0,wins:0,xp:0}; this.stats[id].plays++; this._save(); }
  _stop() { this._tids.forEach(id => clearInterval(id)); this._tids = []; }

  render() {
    const c = document.getElementById("view-arcade");
    if (!c) return; this.ensureStyles(); this._stop(); this.renderHub(c);
  }

  renderHub(c) {
    const p = store.getProfile();
    const totalWins = Object.values(this.stats).reduce((s,g)=>s+(g.wins||0),0);
    const totalArcXP = Object.values(this.stats).reduce((s,g)=>s+(g.xp||0),0);
    c.innerHTML = `
      <div class="arc-layout animate-fade-in">
        <header class="card arc-header">
          <div class="arc-hd-row">
            <div><h2>🕹️ Learning Arcade</h2><p>13 educational games · XP · Streaks · Boss Battles</p></div>
            <div class="arc-pills">
              <div class="arc-pill">⚡ ${p.xp.toLocaleString()} XP</div>
              <div class="arc-pill">🏆 ${totalWins} Wins</div>
              <div class="arc-pill">🎮 +${totalArcXP.toLocaleString()} Arcade XP</div>
            </div>
          </div>
        </header>
        <div class="arc-games-grid">
          ${GAME_META.map(g=>`
            <button class="arc-game-card" data-game="${g.id}" style="--gc:${g.color}">
              <div class="arc-card-top">
                <span class="arc-gicon">${g.icon}</span>
                <div class="arc-badges">
                  <span class="arc-diff arc-diff-${g.diff.toLowerCase()}">${g.diff}</span>
                  ${g.ai?'<span class="arc-ai-chip">🤖 Claude</span>':""}
                </div>
              </div>
              <h4 class="arc-gname">${g.name}</h4>
              <p class="arc-gdesc">${g.desc}</p>
              <div class="arc-card-foot">
                <span class="arc-xp-chip">${g.xp}</span>
                <span class="arc-plays">${this.stats[g.id]?.plays||0} plays</span>
              </div>
            </button>`).join("")}
        </div>
      </div>`;
    c.querySelectorAll(".arc-game-card").forEach(card=>{
      card.addEventListener("click",()=>{ this._stop(); this._dispatch(c,card.dataset.game); });
    });
  }

  _dispatch(c,id){
    ({flashcard:()=>this.gameFlashcard(c),memory:()=>this.gameMemory(c),formula:()=>this.gameFormula(c),
      truefalse:()=>this.gameTrueFalse(c),bingo:()=>this.gameBingo(c),tower:()=>this.gameTower(c),
      boss:()=>this.gameBossSelect(c),mistake:()=>this.gameMistake(c),streak:()=>this.gameStreak(c),
      treasure:()=>this.gameTreasure(c),debate:()=>this.gameAI(c,"debate"),
      professor:()=>this.gameAI(c,"professor"),eli10:()=>this.gameAI(c,"eli10"),
    }[id]||(() => {}))();
  }

  _hud(title,sub,right) {
    return `<div class="card arc-ghud"><div class="arc-ghud-l"><h3>${title}</h3><span>${sub}</span></div><div>${right||""}</div></div>`;
  }
  _result(title,headline,stats,won,color) {
    return `<div class="card arc-result" style="border-top:3px solid ${color}">
      <div style="font-size:2.8rem">${won?"🏆":"📚"}</div>
      <h3 style="font-family:var(--font-display);margin:4px 0 14px">${headline}</h3>
      <div class="arc-res-stats">${stats.map(s=>`<div class="arc-rs"><span class="arc-rv">${s.v}</span><span>${s.l}</span></div>`).join("")}</div>
      ${won?'<div class="arc-res-badge">🎉 XP Awarded!</div>':""}
    </div>`;
  }
  _back(c) {
    const btn=document.createElement("button");btn.className="btn btn-outline arc-back";btn.textContent="← Arcade Hub";
    btn.addEventListener("click",()=>{this._stop();this.renderHub(c);});return btn;
  }
  _wrap(c,html) { c.innerHTML=`<div class="arc-wrap animate-fade-in">${html}</div>`; c.querySelector(".arc-wrap").appendChild(this._back(c)); }
  _timer(c,total,onTick,onEnd) {
    let t=total; const id=setInterval(()=>{t--;onTick(t,total);if(t<=0){clearInterval(id);onEnd();}},1000);
    this._tids.push(id); return id;
  }

  // ── GAME 1: FLASHCARD BATTLE ──────────────────────────────────────────────
  gameFlashcard(c) {
    const cards=[...FLASHCARDS].sort(()=>Math.random()-.5);
    let idx=0,score=0,aiScore=0;
    const show=()=>{
      if(idx>=cards.length){
        const xp=score*30+50;gamification.addXP(xp);this._win("flashcard",xp);
        this._wrap(c,`${this._hud("⚡ Flashcard Battle","Complete!","")}
          ${this._result("",""+score>=""+aiScore?"🏆 You Beat the AI!":"🤖 AI Wins!",
            [{l:"Your Score",v:`${score}/${cards.length}`},{l:"AI Score",v:`${aiScore}/${cards.length}`},{l:"XP",v:`+${xp}`}],score>=aiScore,"#3b82f6")}
          <button class="btn btn-primary" id="pa">🔄 Play Again</button>`);
        c.querySelector("#pa").addEventListener("click",()=>this.gameFlashcard(c));return;
      }
      const card=cards[idx];let answered=false,timeLeft=8;this._play("flashcard");
      this._wrap(c,`
        ${this._hud("⚡ Flashcard Battle",`${idx+1}/${cards.length}`,`👤 ${score} — 🤖 ${aiScore}`)}
        <div class="card arc-fc-card">
          <div class="arc-fc-sub">${card.sub}</div>
          <h3 class="arc-fc-q">${card.q}</h3>
          <div class="arc-fc-hint">💡 ${card.hint}</div>
          <div class="arc-trow"><div class="arc-tbar-w"><div class="arc-tbar" id="fc-bar" style="width:100%"></div></div><span id="fc-num">8s</span></div>
        </div>
        <div class="arc-fc-area" id="fc-area">
          <p style="color:var(--text-muted);font-size:.9rem;text-align:center">Did you know the answer?</p>
          <div style="display:flex;gap:10px;justify-content:center;margin-top:10px">
            <button class="btn arc-tf-true" id="fc-yes">✅ Yes!</button>
            <button class="btn arc-tf-false" id="fc-no">❌ Nope</button>
          </div>
        </div>`);
      const aiTid=setTimeout(()=>{if(!answered)aiScore++;},4000+Math.random()*3000);this._tids.push(aiTid);
      const reveal=(knew)=>{
        if(answered)return;answered=true;this._stop();
        const xp=knew?(timeLeft>=6?30:timeLeft>=3?20:10):0;
        if(knew){score++;gamification.addXP(xp);}
        const area=c.querySelector("#fc-area");
        if(area)area.innerHTML=`<div class="arc-fc-ans">Answer: <strong>${card.a}</strong></div>
          <div style="font-weight:700;color:${knew?"#22c55e":"#ef4444"};text-align:center;margin:6px 0">${knew?`✅ +${xp} XP`:"❌ Missed"}</div>
          <button class="btn btn-primary" id="fc-nxt" style="width:100%;margin-top:10px">${idx+1<cards.length?"Next →":"Results"}</button>`;
        c.querySelector("#fc-nxt")?.addEventListener("click",()=>{idx++;show();});
      };
      this._timer(c,8,(t)=>{timeLeft=t;const b=c.querySelector("#fc-bar"),n=c.querySelector("#fc-num");
        if(b){b.style.width=`${(t/8)*100}%`;b.style.background=t<=3?"#ef4444":"#3b82f6";}if(n)n.textContent=`${t}s`;},()=>{if(!answered)reveal(false);});
      c.querySelector("#fc-yes")?.addEventListener("click",()=>reveal(true));
      c.querySelector("#fc-no")?.addEventListener("click",()=>reveal(false));
    };show();
  }

  // ── GAME 2: MEMORY MATCH ─────────────────────────────────────────────────
  gameMemory(c) {
    const pairs=[...MEMORY_PAIRS].sort(()=>Math.random()-.5).slice(0,6);
    const cards=[...pairs.map((p,i)=>({id:i,txt:p.t,type:"t"})),...pairs.map((p,i)=>({id:i,txt:p.d,type:"d"}))].sort(()=>Math.random()-.5);
    let flipped=[],matched=new Set(),moves=0,lock=false;
    this._play("memory");
    const render=()=>{
      this._wrap(c,`${this._hud("🧠 Memory Match",`${matched.size/2}/${pairs.length} Pairs`,`🎯 ${moves} moves`)}
        <div class="arc-mem-grid" id="mgrid">
          ${cards.map((card,i)=>`<div class="arc-mc ${matched.has(card.id)?"arc-mc-match":""}" data-i="${i}" data-id="${card.id}">
            <div class="arc-mc-front">?</div><div class="arc-mc-back">${card.txt}</div></div>`).join("")}
        </div>`);
      c.querySelectorAll(".arc-mc").forEach(el=>{
        el.addEventListener("click",()=>{
          const i=parseInt(el.dataset.i),card=cards[i];
          if(lock||matched.has(card.id)||flipped.includes(i)||flipped.length>=2)return;
          el.classList.add("arc-mc-flip");flipped.push(i);
          if(flipped.length===2){
            moves++;const[a,b]=flipped.map(j=>cards[j]);lock=true;
            if(a.id===b.id&&a.type!==b.type){
              matched.add(a.id);flipped=[];lock=false;
              c.querySelectorAll(".arc-mc").forEach(e=>{if(parseInt(e.dataset.id)===a.id)e.classList.add("arc-mc-match");});
              if(matched.size===pairs.length){setTimeout(()=>{
                const xp=Math.max(50,200-moves*10);gamification.addXP(xp);this._win("memory",xp);
                this._wrap(c,`${this._result("","🎉 All Pairs Matched!",[{l:"Moves",v:moves},{l:"Pairs",v:pairs.length},{l:"XP",v:`+${xp}`}],true,"#a855f7")}
                  <button class="btn btn-primary" id="pa">🔄 Play Again</button>`);
                c.querySelector("#pa").addEventListener("click",()=>this.gameMemory(c));
              },400);}
            }else{setTimeout(()=>{
              c.querySelectorAll(".arc-mc").forEach((e,idx)=>{if(flipped.includes(idx))e.classList.remove("arc-mc-flip");});
              flipped=[];lock=false;},900);}
          }
        });
      });
    };render();
  }

  // ── GAME 3: FORMULA SPRINT ────────────────────────────────────────────────
  gameFormula(c) {
    const items=[...FORMULAS].sort(()=>Math.random()-.5);let idx=0,score=0,streak=0,maxStreak=0;this._play("formula");
    const show=()=>{
      if(idx>=items.length){
        const xp=score*40+maxStreak*20;gamification.addXP(xp);this._win("formula",xp);
        this._wrap(c,`${this._result("","🏆 Formula Sprint Done",[{l:"Correct",v:`${score}/${items.length}`},{l:"Streak",v:maxStreak},{l:"XP",v:`+${xp}`}],score>=items.length*.7,"#f59e0b")}
          <button class="btn btn-primary" id="pa">🔄 Play Again</button>`);
        c.querySelector("#pa").addEventListener("click",()=>this.gameFormula(c));return;
      }
      const f=items[idx];
      this._wrap(c,`${this._hud("🔢 Formula Sprint",`${idx+1}/${items.length}`,`✅ ${score} | 🔥 ${streak}`)}
        <div class="card arc-formula-card">
          <div class="arc-fc-sub">${f.sub}</div>
          <h4 style="color:var(--text-secondary);margin:4px 0 12px">${f.name}</h4>
          <div class="arc-formula-disp">${f.display}</div>
          <p style="color:var(--text-muted);font-size:.88rem;margin:12px 0 6px">Fill in the blank:</p>
          <div style="display:flex;gap:8px"><input id="fi" class="arc-input" placeholder="Your answer…" autocomplete="off"/>
          <button class="btn btn-primary" id="fcheck">Check ✓</button></div>
          <div id="ffb" class="arc-fb hidden"></div>
        </div>`);
      setTimeout(()=>c.querySelector("#fi")?.focus(),80);
      const check=()=>{
        const val=c.querySelector("#fi").value.trim();const ok=val.toLowerCase()===f.blank.toLowerCase();
        if(ok){score++;streak++;if(streak>maxStreak)maxStreak=streak;gamification.addXP(10);}else streak=0;
        const fb=c.querySelector("#ffb");fb.classList.remove("hidden");
        fb.className=`arc-fb ${ok?"arc-fb-ok":"arc-fb-err"}`;
        fb.innerHTML=ok?`✅ Correct! <strong>${f.full}</strong>`:`❌ Answer: <strong>${f.blank}</strong> → ${f.full}`;
        const btn=c.querySelector("#fcheck");btn.textContent=idx+1<items.length?"Next →":"Results";btn.onclick=()=>{idx++;show();};
      };
      c.querySelector("#fcheck").addEventListener("click",check);
      c.querySelector("#fi").addEventListener("keydown",e=>{if(e.key==="Enter")check();});
    };show();
  }

  // ── GAME 4: TRUE OR FALSE RUSH ────────────────────────────────────────────
  gameTrueFalse(c) {
    const items=[...TF].sort(()=>Math.random()-.5);let idx=0,score=0,streak=0,maxStreak=0;this._play("truefalse");
    const show=()=>{
      if(idx>=items.length){
        const xp=score*20+maxStreak*15;gamification.addXP(xp);this._win("truefalse",xp);
        this._wrap(c,`${this._result("","🎉 True/False Rush Done",[{l:"Correct",v:`${score}/${items.length}`},{l:"Best Streak",v:maxStreak},{l:"XP",v:`+${xp}`}],score>=items.length*.75,"#22c55e")}
          <button class="btn btn-primary" id="pa">🔄 Play Again</button>`);
        c.querySelector("#pa").addEventListener("click",()=>this.gameTrueFalse(c));return;
      }
      const item=items[idx];let answered=false;
      this._wrap(c,`${this._hud("⚡ True or False Rush",`${idx+1}/${items.length}`,`✅ ${score} | 🔥 ${streak}`)}
        <div class="card arc-tf-card">
          ${streak>=3?`<div class="arc-streak-badge">🔥 ${streak} Streak!</div>`:""}
          <p class="arc-tf-stmt">${item.s}</p>
          <div class="arc-trow"><div class="arc-tbar-w" style="flex:1"><div class="arc-tbar" id="tfbar" style="width:100%"></div></div><span id="tfnum">6s</span></div>
        </div>
        <div class="arc-tf-btns">
          <button class="btn arc-tf-true" id="tf-t">✅ TRUE</button>
          <button class="btn arc-tf-false" id="tf-f">❌ FALSE</button>
        </div>`);
      const answer=(choice)=>{
        if(answered)return;answered=true;this._stop();
        const ok=choice===item.a;
        if(ok){score++;streak++;if(streak>maxStreak)maxStreak=streak;gamification.addXP(20);}else streak=0;
        const tb=c.querySelector("#tf-t"),fb=c.querySelector("#tf-f");
        if(tb)tb.className=`btn arc-tf-true ${item.a?"arc-tf-glow":"arc-tf-dim"}`;
        if(fb)fb.className=`btn arc-tf-false ${!item.a?"arc-tf-glow":"arc-tf-dim"}`;
        const card=c.querySelector(".arc-tf-card");
        if(card){const r=document.createElement("div");r.className=`arc-fb ${ok?"arc-fb-ok":"arc-fb-err"}`;r.style.cssText="text-align:center;margin-top:8px";r.textContent=ok?`✅ Correct! +20 XP`:`❌ Answer: ${item.a?"TRUE":"FALSE"}`;card.appendChild(r);}
        setTimeout(()=>{idx++;show();},1100);
      };
      this._timer(c,6,(t)=>{const b=c.querySelector("#tfbar"),n=c.querySelector("#tfnum");if(b){b.style.width=`${(t/6)*100}%`;b.style.background=t<=2?"#ef4444":"#22c55e";}if(n)n.textContent=`${t}s`;},()=>{if(!answered)answer(null);});
      c.querySelector("#tf-t").addEventListener("click",()=>answer(true));
      c.querySelector("#tf-f").addEventListener("click",()=>answer(false));
    };show();
  }

  // ── GAME 5: CONCEPT BINGO ─────────────────────────────────────────────────
  gameBingo(c) {
    const marked=new Set([12]);let activeQ=null,activeIdx=null;this._play("bingo");
    const checkBingo=()=>{
      const sz=5;const lines=[
        ...[0,1,2,3,4].map(r=>[0,1,2,3,4].map(col=>r*sz+col)),
        ...[0,1,2,3,4].map(col=>[0,1,2,3,4].map(r=>r*sz+col)),
        [[0,6,12,18,24]],[[4,8,12,16,20]],
      ].flat();
      return lines.some(line=>Array.isArray(line)&&line.every(i=>marked.has(i)));
    };
    const renderB=()=>{
      const bingo=checkBingo();
      this._wrap(c,`${this._hud("🎯 Concept Bingo",`${marked.size}/25 Marked`,bingo?"🎉 BINGO!":"Get 5 in a row!")}
        <div class="arc-bingo-board">
          <div class="arc-bingo-hdr"><span>B</span><span>I</span><span>N</span><span>G</span><span>O</span></div>
          <div class="arc-bingo-grid">
            ${BINGO_QS.map((q,i)=>`<div class="arc-bc ${marked.has(i)?"arc-bc-m":""} ${i===12?"arc-bc-free":""}" data-i="${i}">
              ${i===12?"⭐":marked.has(i)?"✅":`Q${i+1}`}</div>`).join("")}
          </div>
        </div>
        ${activeQ?`<div class="card" style="padding:18px">
          <p style="color:var(--text-muted);font-size:.82rem;margin:0 0 6px">Q${(activeIdx||0)+1}: </p>
          <p style="font-weight:600;margin:0 0 10px">${activeQ.q}</p>
          ${activeQ.a?`<div style="display:flex;gap:8px"><input id="bi" class="arc-input" placeholder="Your answer…"/>
          <button class="btn btn-primary" id="bcheck">Check</button></div>
          <div id="bfb" class="arc-fb hidden"></div>`:""}
          </div>`:`<div style="text-align:center;color:var(--text-muted);font-size:.88rem;padding:12px">👆 Click any cell to answer its question</div>`}
        ${bingo||marked.size>=25?`<button class="btn btn-primary" id="bdone">🏆 Claim Reward!</button>`:""}`);
      c.querySelectorAll(".arc-bc:not(.arc-bc-m):not(.arc-bc-free)").forEach(el=>{
        el.addEventListener("click",()=>{activeIdx=parseInt(el.dataset.i);activeQ=BINGO_QS[activeIdx];renderB();});
      });
      if(activeQ?.a){
        const doCheck=()=>{
          const val=(c.querySelector("#bi")?.value||"").trim().toLowerCase();
          const ans=activeQ.a.toLowerCase();const pass=val.length>=1&&(val.includes(ans)||ans.includes(val));
          const fb=c.querySelector("#bfb");fb.classList.remove("hidden");
          if(pass){gamification.addXP(20);marked.add(activeIdx);activeQ=null;activeIdx=null;fb.className="arc-fb arc-fb-ok";fb.textContent="✅ Correct! Cell marked.";setTimeout(renderB,500);}
          else{fb.className="arc-fb arc-fb-err";fb.textContent=`❌ Answer: ${activeQ.a}`;}
        };
        c.querySelector("#bcheck")?.addEventListener("click",doCheck);
        c.querySelector("#bi")?.addEventListener("keydown",e=>{if(e.key==="Enter")doCheck();});
        setTimeout(()=>c.querySelector("#bi")?.focus(),80);
      }
      c.querySelector("#bdone")?.addEventListener("click",()=>{
        const xp=marked.size>=25?120:60;gamification.addXP(xp);this._win("bingo",xp);
        this._wrap(c,`${this._result("","🎉 BINGO!",[{l:"Cells",v:marked.size},{l:"XP",v:`+${xp}`}],true,"#ef4444")}
          <button class="btn btn-primary" id="pa">🔄 New Board</button>`);
        c.querySelector("#pa").addEventListener("click",()=>this.gameBingo(c));
      });
    };renderB();
  }

  // ── GAME 6: KNOWLEDGE TOWER ───────────────────────────────────────────────
  gameTower(c) {
    let fi=0,lives=3,totalXP=0;this._play("tower");
    const showFloor=()=>{
      if(fi>=TOWER_FLOORS.length||lives<=0){
        const won=fi>=TOWER_FLOORS.length&&lives>0;
        if(won)gamification.addXP(200);this._win("tower",totalXP+(won?200:0));
        this._wrap(c,`${this._result("",won?"🏆 Tower Conquered!":"💀 Tower Defeated",
          [{l:"Floors",v:fi},{l:"Lives",v:lives},{l:"XP",v:`+${totalXP}`}],won,"#8b5cf6")}
          <button class="btn btn-primary" id="pa">🔄 Try Again</button>`);
        c.querySelector("#pa").addEventListener("click",()=>this.gameTower(c));return;
      }
      const f=TOWER_FLOORS[fi];const pct=(fi/TOWER_FLOORS.length)*100;
      this._wrap(c,`${this._hud("🏰 Knowledge Tower",`Floor ${f.f}/15`,`❤️ ${lives} | ⚡ ${totalXP} XP`)}
        <div class="arc-tower-prog"><div class="arc-tower-fill" style="width:${pct}%"></div></div>
        <div class="card arc-qcard ${f.tag?"arc-qcard-"+f.tag:""}">
          ${f.tag?`<div class="arc-ftag arc-ftag-${f.tag}">${{boss:"🦂 BOSS",speed:"⚡ SPEED"}[f.tag]}</div>`:""}
          <div style="font-size:.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Floor ${f.f} · ${f.sub}</div>
          <p class="arc-qtext">${f.q}</p>
          <div class="arc-opts-grid">
            ${f.opts.map((o,i)=>`<button class="qa-opt arc-topt" data-i="${i}"><span class="qa-opt-lt">${String.fromCharCode(65+i)}</span><span class="qa-opt-tx">${o}</span></button>`).join("")}
          </div>
        </div>
        <div class="arc-lives">${Array.from({length:3},(_,i)=>`<span>${i<lives?"❤️":"🖤"}</span>`).join("")}</div>`);
      c.querySelectorAll(".arc-topt").forEach(btn=>{
        btn.addEventListener("click",()=>{
          c.querySelectorAll(".arc-topt").forEach(b=>b.disabled=true);
          const i=parseInt(btn.dataset.i),ok=i===f.c;
          btn.classList.add(ok?"correct":"incorrect");c.querySelector(`.arc-topt[data-i="${f.c}"]`).classList.add("correct");
          if(ok){totalXP+=f.xp;gamification.addXP(f.xp);ui.showToast(`+${f.xp} XP — Floor ${f.f} cleared!`,"success");}
          else{lives--;ui.showToast(`Wrong! ${lives} lives left`,"warning");}
          setTimeout(()=>{fi++;showFloor();},900);
        });
      });
    };showFloor();
  }

  // ── GAME 7: BOSS BATTLES ─────────────────────────────────────────────────
  gameBossSelect(c) {
    this._wrap(c,`${this._hud("⚔️ Boss Battles","Choose your Boss","Defeat with knowledge!")}
      <div class="arc-boss-grid">
        ${BOSSES.map(b=>`<button class="arc-boss-card" data-bid="${b.id}" style="--bc:${b.color}">
          <span class="arc-boss-emoji">${b.emoji}</span><h4>${b.name}</h4>
          <div style="font-size:.78rem;color:var(--text-muted)">${b.hp} HP · ${b.qs.length} Rounds</div>
        </button>`).join("")}
      </div>`);
    c.querySelectorAll(".arc-boss-card").forEach(btn=>btn.addEventListener("click",()=>this.gameBossFight(c,btn.dataset.bid)));
  }

  gameBossFight(c,bid) {
    const boss=BOSSES.find(b=>b.id===bid);let bossHP=boss.hp,playerHP=100,qi=0;
    const dmg=Math.floor(boss.hp/boss.qs.length);this._play("boss");
    const round=()=>{
      if(bossHP<=0||playerHP<=0||qi>=boss.qs.length){
        const won=bossHP<=0||(qi>=boss.qs.length&&playerHP>0);
        const xp=won?150:50;if(won)gamification.addXP(150);this._win("boss",xp);
        this._wrap(c,`${this._result("",won?`🏆 ${boss.name} Defeated!`:`💀 Defeated by ${boss.name}`,
          [{l:"Boss HP",v:bossHP},{l:"Your HP",v:playerHP},{l:"XP",v:`+${xp}`}],won,boss.color)}
          <button class="btn btn-primary" id="rm">🔄 Rematch!</button>
          <button class="btn btn-outline" id="bk">← Boss Select</button>`);
        c.querySelector("#rm").addEventListener("click",()=>this.gameBossFight(c,bid));
        c.querySelector("#bk").addEventListener("click",()=>this.gameBossSelect(c));return;
      }
      const q=boss.qs[qi];
      this._wrap(c,`<div class="arc-battle-hud">
        <div class="arc-fighter"><span>🧑‍🎓 You</span><div class="arc-hp-w"><div class="arc-hp player" style="width:${playerHP}%"></div></div><span>${playerHP} HP</span></div>
        <div class="arc-vs">⚔️</div>
        <div class="arc-fighter"><span>${boss.emoji} ${boss.name}</span><div class="arc-hp-w"><div class="arc-hp boss" style="width:${(bossHP/boss.hp)*100}%;background:${boss.color}"></div></div><span>${bossHP}/${boss.hp}</span></div>
        </div>
        <div class="card arc-qcard"><p class="arc-qtext">${q.q}</p>
        <div class="arc-opts-grid">
          ${q.opts.map((o,i)=>`<button class="qa-opt arc-bopt" data-i="${i}"><span class="qa-opt-lt">${String.fromCharCode(65+i)}</span><span class="qa-opt-tx">${o}</span></button>`).join("")}
        </div></div>
        <button class="btn btn-outline arc-back" id="bk">← Boss Select</button>`);
      c.querySelector("#bk").addEventListener("click",()=>this.gameBossSelect(c));
      c.querySelectorAll(".arc-bopt").forEach(btn=>{
        btn.addEventListener("click",()=>{
          c.querySelectorAll(".arc-bopt").forEach(b=>b.disabled=true);
          const i=parseInt(btn.dataset.i),ok=i===q.c;
          btn.classList.add(ok?"correct":"incorrect");c.querySelector(`.arc-bopt[data-i="${q.c}"]`).classList.add("correct");
          if(ok){bossHP=Math.max(0,bossHP-dmg);gamification.addXP(30);ui.showToast(`⚔️ Hit! Boss −${dmg} HP`,"success");}
          else{playerHP=Math.max(0,playerHP-boss.dmg);ui.showToast(`💥 Boss attacks! −${boss.dmg} HP`,"warning");}
          qi++;setTimeout(round,900);
        });
      });
    };round();
  }

  // ── GAME 8: DETECT THE MISTAKE ────────────────────────────────────────────
  gameMistake(c) {
    const problems=[...MISTAKES].sort(()=>Math.random()-.5);let idx=0,score=0;this._play("mistake");
    const show=()=>{
      if(idx>=problems.length){
        const xp=score*60;gamification.addXP(xp);this._win("mistake",xp);
        this._wrap(c,`${this._result("",score===problems.length?"🏆 Logic Detective!":"📚 Good Effort",
          [{l:"Found",v:`${score}/${problems.length}`},{l:"XP",v:`+${xp}`}],score>=2,"#06b6d4")}
          <button class="btn btn-primary" id="pa">🔄 Play Again</button>`);
        c.querySelector("#pa").addEventListener("click",()=>this.gameMistake(c));return;
      }
      const p=problems[idx];let sel=new Set();
      this._wrap(c,`${this._hud("🔍 Detect the Mistake",`${idx+1}/${problems.length}`,`✅ ${score} found`)}
        <div class="card" style="padding:20px">
          <h4 style="font-family:var(--font-display);margin:0 0 6px">${p.title}</h4>
          <p style="color:var(--text-muted);font-size:.83rem;margin:0 0 12px">Click the wrong step(s):</p>
          ${p.steps.map((step,i)=>`<div class="arc-step" data-si="${i}">
            <span class="arc-step-n">Step ${i+1}</span><span class="arc-step-t">${step.txt}</span>
          </div>`).join("")}
          <div id="mfb" class="arc-fb hidden"></div>
          <button class="btn btn-primary" id="mcheck" style="width:100%;margin-top:14px">Check Selection</button>
        </div>`);
      c.querySelectorAll(".arc-step").forEach(el=>{
        el.addEventListener("click",()=>{const i=parseInt(el.dataset.si);if(sel.has(i))sel.delete(i);else sel.add(i);el.classList.toggle("arc-step-sel",sel.has(i));});
      });
      c.querySelector("#mcheck").addEventListener("click",()=>{
        const actualW=new Set(p.steps.map((s,i)=>s.w?i:-1).filter(i=>i>=0));
        const ok=[...actualW].every(i=>sel.has(i))&&sel.size===actualW.size;
        if(ok){score++;gamification.addXP(60);}
        const fb=c.querySelector("#mfb");fb.classList.remove("hidden");fb.className=`arc-fb ${ok?"arc-fb-ok":"arc-fb-err"}`;fb.innerHTML=`${ok?"✅":"❌"} ${p.exp}`;
        const btn=c.querySelector("#mcheck");btn.textContent=idx+1<problems.length?"Next →":"Results";btn.onclick=()=>{idx++;show();};
      });
    };show();
  }

  // ── GAME 9: STREAK MASTER ─────────────────────────────────────────────────
  gameStreak(c) {
    const SK="vv_streak_missions";let M;try{M=JSON.parse(localStorage.getItem(SK)||"null");}catch{M=null;}
    const today=new Date().toDateString();
    if(!M||M.date!==today){M={date:today,tasks:[
      {id:"m1",label:"Play Flashcard Battle",icon:"⚡",xp:30,done:false},
      {id:"m2",label:"Complete Memory Match",icon:"🧠",xp:50,done:false},
      {id:"m3",label:"Reach Floor 5 in Tower",icon:"🏰",xp:40,done:false},
      {id:"m4",label:"Complete Formula Sprint",icon:"🔢",xp:30,done:false},
      {id:"m5",label:"Get 10 T/F correct",icon:"⚡",xp:40,done:false},
    ]};localStorage.setItem(SK,JSON.stringify(M));}
    this._play("streak");
    const render=()=>{
      const done=M.tasks.filter(t=>t.done).length;
      this._wrap(c,`${this._hud("🔥 Streak Master",`${done}/${M.tasks.length} Done`,`🗓️ ${today}`)}
        <div class="card" style="padding:20px">
          <h3 style="font-family:var(--font-display);margin:0 0 10px">📋 Today's Missions</h3>
          <div class="arc-sprog-w"><div class="arc-sprog" style="width:${(done/M.tasks.length)*100}%"></div></div>
          <p style="color:var(--text-muted);font-size:.82rem;margin:6px 0 14px">Complete all for +200 Bonus XP!</p>
          ${M.tasks.map(t=>`<div class="arc-mission ${t.done?"arc-mission-done":""}">
            <span>${t.done?"✅":t.icon}</span>
            <span class="arc-mission-lbl">${t.label}</span>
            <span style="color:#fbbf24;font-weight:700;font-size:.82rem">${t.done?"Done!":"+"+t.xp+" XP"}</span>
            ${!t.done?`<button class="btn btn-outline btn-sm arc-mdo" data-id="${t.id}" style="padding:4px 10px">✓ Mark Done</button>`:""}
          </div>`).join("")}
          ${done===M.tasks.length?`<div class="arc-streak-bonus">🎁 All done! Bonus XP awarded!</div>`:""}
        </div>`);
      c.querySelectorAll(".arc-mdo").forEach(btn=>{
        btn.addEventListener("click",()=>{
          const t=M.tasks.find(t=>t.id===btn.dataset.id);
          if(t&&!t.done){t.done=true;gamification.addXP(t.xp);localStorage.setItem(SK,JSON.stringify(M));
            if(M.tasks.every(t=>t.done)){gamification.addXP(200);this._win("streak",200);}render();}
        });
      });
    };render();
  }

  // ── GAME 10: TREASURE HUNT ────────────────────────────────────────────────
  gameTreasure(c) {
    const zones=[
      {id:"physics",name:"Physics Valley",emoji:"⚡",color:"#3b82f6",req:null,
        qs:[{q:"F=10N,m=2kg,a=?",opts:["4","5","6","8"],c:1},{q:"Unit of power?",opts:["Joule","Watt","Newton","Pascal"],c:1}]},
      {id:"chemistry",name:"Chemistry Caves",emoji:"🧪",color:"#22c55e",req:"physics",
        qs:[{q:"pH of neutral water?",opts:["5","6","7","8"],c:2},{q:"H₂O atoms?",opts:["2","3","4","5"],c:1}]},
      {id:"biology",name:"Biology Jungle",emoji:"🌿",color:"#f59e0b",req:"chemistry",
        qs:[{q:"Powerhouse of cell?",opts:["Nucleus","Ribosome","Mitochondria","Chloroplast"],c:2},{q:"DNA stands for?",opts:["Deoxyribose NA","Dioxyribose NA","Deoxyribonucleic Acid","Direct NA"],c:2}]},
      {id:"maths",name:"Maths Mountains",emoji:"🔢",color:"#a855f7",req:"biology",
        qs:[{q:"∫x dx = ?",opts:["x²","x²/2","x²/2+C","2x"],c:2},{q:"lim sinx/x (x→0)?",opts:["0","1","∞","undef"],c:1}]},
    ];
    let unlocked=new Set(["physics"]),completed=new Set();this._play("treasure");
    const renderMap=()=>{
      this._wrap(c,`${this._hud("🗺️ Treasure Hunt",`${completed.size}/4 Zones`,"Unlock all regions!")}
        <div class="arc-treasure-map">
          ${zones.map(z=>{const un=unlocked.has(z.id),done=completed.has(z.id);
            return `<button class="arc-zone ${un?"":"arc-zone-lock"} ${done?"arc-zone-done":""}" data-zid="${z.id}" style="--zc:${z.color}" ${un?"":"disabled"}>
              <span style="font-size:2rem">${z.emoji}</span>
              <span style="font-weight:700;font-size:.9rem">${z.name}</span>
              <span style="font-size:.78rem;color:var(--text-muted)">${done?"✅ Complete":un?"▶ Enter":"🔒 Locked"}</span>
            </button>`;}).join("")}
        </div>
        ${completed.size===4?`<div class="arc-streak-bonus">🏆 All zones conquered!</div>`:""}`);
      c.querySelectorAll(".arc-zone:not([disabled])").forEach(btn=>btn.addEventListener("click",()=>playZone(btn.dataset.zid)));
    };
    const playZone=(zid)=>{
      const zone=zones.find(z=>z.id===zid);let qi=0,zs=0;
      const sq=()=>{
        if(qi>=zone.qs.length){gamification.addXP(80);this._win("treasure",80);completed.add(zid);
          const nxt=zones.find(z=>z.req===zid);if(nxt)unlocked.add(nxt.id);renderMap();return;}
        const q=zone.qs[qi];
        this._wrap(c,`${this._hud(`${zone.emoji} ${zone.name}`,`Q${qi+1}/${zone.qs.length}`,`⚡ ${zs*40} XP`)}
          <div class="card arc-qcard"><p class="arc-qtext">${q.q}</p>
          <div class="arc-opts-grid">
            ${q.opts.map((o,i)=>`<button class="qa-opt arc-zopt" data-i="${i}"><span class="qa-opt-lt">${String.fromCharCode(65+i)}</span><span class="qa-opt-tx">${o}</span></button>`).join("")}
          </div></div>`);
        c.querySelectorAll(".arc-zopt").forEach(btn=>{
          btn.addEventListener("click",()=>{
            c.querySelectorAll(".arc-zopt").forEach(b=>b.disabled=true);
            const i=parseInt(btn.dataset.i),ok=i===q.c;
            btn.classList.add(ok?"correct":"incorrect");c.querySelector(`.arc-zopt[data-i="${q.c}"]`).classList.add("correct");
            if(ok){zs++;gamification.addXP(20);}qi++;setTimeout(sq,900);
          });
        });
      };sq();
    };renderMap();
  }

  // ── GAMES 11-13: CLAUDE AI ────────────────────────────────────────────────
  gameAI(c,id) {
    const META={
      debate:{icon:"🎭",name:"AI Debate Arena",prompt:"Debate Topic:",ph:"e.g. 'Social media harms students'"},
      professor:{icon:"👨‍🏫",name:"Professor Challenge",prompt:"Subject:",ph:"e.g. 'Thermodynamics'"},
      eli10:{icon:"🧒",name:"Explain Like I'm 10",prompt:"Complex Topic:",ph:"e.g. 'Quantum entanglement'"},
    };
    const m=META[id];
    const key=localStorage.getItem("vidyaverse_ai_claude_key")||"";
    if(!key){
      this._wrap(c,`${this._hud(m.icon+" "+m.name,"Claude AI Required","")}
        <div class="card arc-ai-gate">
          <div style="font-size:3rem;margin-bottom:12px">🤖</div>
          <h3 style="font-family:var(--font-display);margin:0 0 8px">Claude API Key Required</h3>
          <p style="color:var(--text-secondary);font-size:.9rem;margin:0 0 16px">Add your Anthropic API key in Settings → AI Configuration to unlock this game.</p>
          <button class="btn btn-primary" onclick="window.location.hash='#settings'">⚙️ Go to Settings</button>
        </div>`);return;
    }
    this._wrap(c,`${this._hud(m.icon+" "+m.name,"Claude AI Mode","🤖 Active")}
      <div class="card" style="padding:24px">
        <div class="arc-ai-badge">🤖 Claude AI Active</div>
        <label style="font-size:.85rem;font-weight:600;color:var(--text-secondary);display:block;margin:10px 0 4px">${m.prompt}</label>
        <input id="ai-in" class="arc-input" placeholder="${m.ph}" style="width:100%;margin-bottom:10px"/>
        <button class="btn btn-primary" id="ai-go" style="width:100%">🚀 Start</button>
        <div id="ai-sess" style="margin-top:14px;display:none"></div>
      </div>`);
    const PROMPTS={
      debate:(t)=>`You are a debate opponent. Topic: "${t}". Take the opposite side. Give 3 strong arguments in ~100 words, then ask the student to counter one point.`,
      professor:(t)=>`You are a strict professor. Test the student's knowledge of "${t}" with 3 progressively harder conceptual questions. Be concise.`,
      eli10:(t)=>`The student will explain "${t}" to a 10-year-old. First give a 2-sentence expert overview, then prompt them to explain it simply.`,
    };
    c.querySelector("#ai-go").addEventListener("click",async()=>{
      const topic=c.querySelector("#ai-in").value.trim();
      if(!topic){ui.showToast("Enter a topic first!","warning");return;}
      const sess=c.querySelector("#ai-sess");sess.style.display="block";
      sess.innerHTML=`<div style="color:var(--text-muted);text-align:center;padding:12px">🤖 Claude is thinking… <span style="animation:spin 1s linear infinite;display:inline-block">⏳</span></div>`;
      try{
        const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",
          headers:{"x-api-key":key,"anthropic-version":"2023-06-01","content-type":"application/json","anthropic-dangerous-direct-browser-access":"true"},
          body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:400,messages:[{role:"user",content:PROMPTS[id](topic)}]})});
        const d=await r.json();const txt=d?.content?.[0]?.text||"No response.";
        sess.innerHTML=`<div class="arc-ai-response">
          <div style="font-size:.78rem;font-weight:700;color:var(--text-muted);margin-bottom:6px">🤖 Claude says:</div>
          <div style="font-size:.9rem;line-height:1.7">${txt.replace(/\n/g,"<br>")}</div>
        </div>
        <textarea id="ai-rep" class="arc-input" rows="4" placeholder="Your response…" style="width:100%;margin-top:12px;resize:vertical"></textarea>
        <button class="btn btn-primary" id="ai-send" style="width:100%;margin-top:8px">📨 Submit for Grading</button>
        <div id="ai-gr" style="margin-top:10px;display:none"></div>`;
        c.querySelector("#ai-send").addEventListener("click",async()=>{
          const rep=c.querySelector("#ai-rep").value.trim();if(!rep)return;
          const gr=c.querySelector("#ai-gr");gr.style.display="block";
          gr.innerHTML=`<div style="color:var(--text-muted);text-align:center;padding:10px">🤖 Evaluating… <span style="animation:spin 1s linear infinite;display:inline-block">⏳</span></div>`;
          try{
            const r2=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",
              headers:{"x-api-key":key,"anthropic-version":"2023-06-01","content-type":"application/json","anthropic-dangerous-direct-browser-access":"true"},
              body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:200,messages:[{role:"user",content:`Rate this response about "${topic}" for a ${id} game. Student said: "${rep}". Give Score /10 + brief feedback. Format: "Score: X/10 — [feedback]"`}]})});
            const d2=await r2.json();const eval_txt=d2?.content?.[0]?.text||"Could not evaluate.";
            gamification.addXP(80);this._win(id,80);
            gr.innerHTML=`<div class="arc-ai-response"><strong>📊 AI Evaluation:</strong><br><br>${eval_txt.replace(/\n/g,"<br>")}<br><br><span style="color:#22c55e;font-weight:700">✅ +80 XP Awarded!</span></div>`;
          }catch(e){gr.innerHTML=`<div class="arc-fb arc-fb-err">Error: ${e.message}</div>`;}
        });
      }catch(e){sess.innerHTML=`<div class="arc-fb arc-fb-err">API Error: ${e.message}</div>`;}
    });
  }

  // ── STYLES ────────────────────────────────────────────────────────────────
  ensureStyles() {
    if (document.getElementById("arc-sty")) return;
    const s = document.createElement("style"); s.id = "arc-sty";
    s.innerHTML = `
.arc-layout{padding:24px;max-width:1100px;margin:0 auto;display:flex;flex-direction:column;gap:20px}
.arc-header.card{padding:24px 28px}
.arc-hd-row{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
.arc-hd-row h2{font-family:var(--font-display);margin:0 0 4px 0}
.arc-hd-row p{color:var(--text-secondary);font-size:.9rem;margin:0}
.arc-pills{display:flex;gap:8px;flex-wrap:wrap}
.arc-pill{background:linear-gradient(135deg,rgba(59,130,246,.12),rgba(139,92,246,.12));border:1px solid rgba(139,92,246,.25);border-radius:var(--radius-pill);padding:6px 14px;font-size:.82rem;font-weight:600}
.arc-games-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px}
.arc-game-card{background:var(--card-bg);border:1.5px solid var(--border-color);border-radius:var(--radius-lg);padding:16px;text-align:left;cursor:pointer;font-family:var(--font-body);transition:all .2s;position:relative;overflow:hidden}
.arc-game-card::after{content:"";position:absolute;bottom:0;left:0;right:0;height:3px;background:var(--gc);opacity:0;transition:opacity .2s}
.arc-game-card:hover{border-color:var(--gc);transform:translateY(-3px);box-shadow:0 10px 26px rgba(0,0,0,.2)}
.arc-game-card:hover::after{opacity:1}
.arc-card-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.arc-gicon{font-size:1.7rem}
.arc-badges{display:flex;gap:4px;align-items:center;flex-wrap:wrap}
.arc-diff{padding:2px 7px;border-radius:var(--radius-pill);font-size:.68rem;font-weight:700}
.arc-diff-easy{background:rgba(34,197,94,.15);color:#22c55e}
.arc-diff-medium{background:rgba(245,158,11,.15);color:#f59e0b}
.arc-diff-hard{background:rgba(239,68,68,.15);color:#ef4444}
.arc-ai-chip{background:rgba(139,92,246,.15);color:#a855f7;padding:2px 7px;border-radius:var(--radius-pill);font-size:.68rem;font-weight:700}
.arc-gname{font-size:.92rem;font-weight:700;margin:0 0 5px;color:var(--text-primary)}
.arc-gdesc{font-size:.78rem;color:var(--text-muted);line-height:1.5;margin:0 0 10px}
.arc-card-foot{display:flex;align-items:center;justify-content:space-between}
.arc-xp-chip{background:rgba(251,191,36,.15);color:#fbbf24;padding:3px 8px;border-radius:var(--radius-pill);font-size:.73rem;font-weight:700}
.arc-plays{font-size:.73rem;color:var(--text-muted)}
.arc-wrap{padding:20px;max-width:860px;margin:0 auto;display:flex;flex-direction:column;gap:14px}
.arc-back{align-self:flex-start}
.arc-ghud.card{display:flex;align-items:center;justify-content:space-between;padding:12px 18px}
.arc-ghud-l h3{font-family:var(--font-display);font-size:1rem;margin:0}
.arc-ghud-l span{font-size:.78rem;color:var(--text-muted)}
.arc-result{padding:28px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:12px}
.arc-res-stats{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
.arc-rs{text-align:center;padding:12px 14px;background:var(--surface-color);border:1px solid var(--border-color);border-radius:var(--radius-md);min-width:80px}
.arc-rv{display:block;font-size:1.35rem;font-weight:800;font-family:var(--font-display);color:var(--text-primary)}
.arc-rs span:last-child{font-size:.73rem;color:var(--text-muted)}
.arc-res-badge{background:linear-gradient(135deg,rgba(251,191,36,.15),rgba(245,158,11,.1));border:1px solid rgba(251,191,36,.3);border-radius:var(--radius-pill);padding:6px 16px;font-size:.85rem;font-weight:700;color:#fbbf24}
.arc-tbar-w{height:6px;background:var(--border-color);border-radius:3px;overflow:hidden;flex:1}
.arc-tbar{height:100%;background:#3b82f6;border-radius:3px;transition:width .9s linear,background .3s}
.arc-trow{display:flex;align-items:center;gap:10px;margin-top:12px}
.arc-fc-card{padding:26px;text-align:center}
.arc-fc-sub{font-size:.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px}
.arc-fc-q{font-size:1.25rem;font-weight:700;font-family:var(--font-display);margin:0 0 10px}
.arc-fc-hint{font-size:.83rem;color:var(--text-secondary);padding:7px 12px;background:var(--surface-color);border-radius:var(--radius-md);display:inline-block}
.arc-fc-area{text-align:center}
.arc-fc-ans{font-size:1.1rem;font-weight:700;padding:10px;background:var(--surface-color);border-radius:var(--radius-md);margin-bottom:8px}
.arc-mem-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.arc-mc{height:76px;background:var(--surface-color);border:2px solid var(--border-color);border-radius:var(--radius-md);cursor:pointer;position:relative;transform-style:preserve-3d;transition:transform .4s;display:flex;align-items:center;justify-content:center}
.arc-mc.arc-mc-flip,.arc-mc.arc-mc-match{transform:rotateY(180deg)}
.arc-mc-front,.arc-mc-back{position:absolute;width:100%;height:100%;display:flex;align-items:center;justify-content:center;backface-visibility:hidden;border-radius:calc(var(--radius-md) - 2px);padding:5px;font-size:.75rem;text-align:center;line-height:1.3}
.arc-mc-back{background:linear-gradient(135deg,rgba(59,130,246,.18),rgba(139,92,246,.18));color:var(--text-primary);transform:rotateY(180deg);font-weight:600}
.arc-mc.arc-mc-match{border-color:#22c55e;background:rgba(34,197,94,.08)}
.arc-formula-card{padding:26px}
.arc-formula-disp{font-size:1.8rem;font-weight:800;font-family:var(--font-display);color:var(--text-primary);padding:14px;background:var(--surface-color);border-radius:var(--radius-md);text-align:center}
.arc-input{padding:10px 13px;background:var(--surface-color);border:1.5px solid var(--border-color);border-radius:var(--radius-md);color:var(--text-primary);font-family:var(--font-body);font-size:.95rem;box-sizing:border-box}
.arc-input:focus{outline:none;border-color:var(--color-primary,#3b82f6)}
.arc-fb{padding:10px 13px;border-radius:var(--radius-md);font-size:.87rem;margin-top:8px}
.arc-fb.hidden{display:none}
.arc-fb-ok{background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.3);color:#22c55e}
.arc-fb-err{background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.3);color:#ef4444}
.arc-tf-card{padding:26px;text-align:center}
.arc-streak-badge{background:linear-gradient(135deg,#f59e0b22,#ef444422);border:1px solid #f59e0b55;border-radius:var(--radius-pill);display:inline-block;padding:3px 10px;font-size:.8rem;font-weight:700;color:#f59e0b;margin-bottom:8px}
.arc-tf-stmt{font-size:1.1rem;font-weight:600;line-height:1.5;margin:0 0 12px}
.arc-tf-btns{display:flex;gap:12px;justify-content:center}
.arc-tf-true{flex:1;max-width:180px;padding:14px;background:rgba(34,197,94,.12);border:2px solid #22c55e;border-radius:var(--radius-lg);color:#22c55e;font-size:1rem;font-weight:700;cursor:pointer;font-family:var(--font-body);transition:all .15s}
.arc-tf-false{flex:1;max-width:180px;padding:14px;background:rgba(239,68,68,.08);border:2px solid #ef4444;border-radius:var(--radius-lg);color:#ef4444;font-size:1rem;font-weight:700;cursor:pointer;font-family:var(--font-body);transition:all .15s}
.arc-tf-true:hover{background:rgba(34,197,94,.25)}
.arc-tf-false:hover{background:rgba(239,68,68,.18)}
.arc-tf-glow{opacity:1;box-shadow:0 0 14px currentColor}
.arc-tf-dim{opacity:.4}
.arc-bingo-board{display:flex;flex-direction:column;align-items:center;gap:4px}
.arc-bingo-hdr{display:grid;grid-template-columns:repeat(5,1fr);gap:4px;max-width:400px;width:100%;text-align:center;font-weight:900;font-size:1.1rem;color:var(--color-primary,#3b82f6)}
.arc-bingo-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:4px;max-width:400px;width:100%}
.arc-bc{height:64px;background:var(--surface-color);border:1.5px solid var(--border-color);border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:.72rem;font-weight:600;color:var(--text-muted);transition:all .18s;padding:3px;text-align:center}
.arc-bc:hover:not(.arc-bc-m):not(.arc-bc-free){border-color:var(--color-primary,#3b82f6);background:rgba(59,130,246,.08)}
.arc-bc-m{background:linear-gradient(135deg,rgba(59,130,246,.18),rgba(139,92,246,.18));border-color:#3b82f6;color:#3b82f6;font-size:1rem}
.arc-bc-free{background:linear-gradient(135deg,rgba(251,191,36,.12),rgba(245,158,11,.08));border-color:#fbbf24;color:#fbbf24}
.arc-tower-prog{height:8px;background:var(--border-color);border-radius:4px;overflow:hidden}
.arc-tower-fill{height:100%;background:linear-gradient(90deg,#8b5cf6,#a855f7);transition:width .4s}
.arc-qcard{padding:22px}
.arc-qcard-boss{border-top:3px solid #dc2626}
.arc-qcard-speed{border-top:3px solid #f59e0b}
.arc-qtext{font-size:1.05rem;font-weight:600;line-height:1.6;margin:0 0 14px}
.arc-opts-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.arc-topt,.arc-bopt,.arc-zopt{display:flex;align-items:center;gap:10px;padding:12px 13px;background:var(--surface-color);border:1.5px solid var(--border-color);border-radius:var(--radius-lg);cursor:pointer;text-align:left;font-family:var(--font-body);transition:all .15s}
.arc-topt:hover:not(:disabled),.arc-bopt:hover:not(:disabled),.arc-zopt:hover:not(:disabled){border-color:#8b5cf6;background:rgba(139,92,246,.08)}
.arc-ftag{display:inline-block;padding:3px 10px;border-radius:var(--radius-pill);font-size:.73rem;font-weight:700;margin-bottom:8px}
.arc-ftag-boss{background:rgba(220,38,38,.12);color:#dc2626;border:1px solid rgba(220,38,38,.25)}
.arc-ftag-speed{background:rgba(245,158,11,.12);color:#f59e0b;border:1px solid rgba(245,158,11,.25)}
.arc-lives{display:flex;gap:6px;justify-content:center;font-size:1.3rem}
.arc-boss-grid,.arc-treasure-map{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
.arc-boss-card{padding:18px;background:var(--surface-color);border:1.5px solid var(--border-color);border-radius:var(--radius-lg);cursor:pointer;font-family:var(--font-body);transition:all .2s;display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center}
.arc-boss-card:hover{border-color:var(--bc);transform:translateY(-2px);box-shadow:0 8px 22px rgba(0,0,0,.15)}
.arc-boss-emoji{font-size:2.2rem}
.arc-boss-card h4{margin:0;font-family:var(--font-display)}
.arc-battle-hud{display:grid;grid-template-columns:1fr auto 1fr;gap:10px;align-items:center;padding:14px;background:var(--card-bg);border:1px solid var(--border-color);border-radius:var(--radius-lg)}
.arc-fighter{display:flex;flex-direction:column;gap:4px;text-align:center;font-size:.82rem;font-weight:600}
.arc-hp-w{height:8px;background:var(--border-color);border-radius:4px;overflow:hidden}
.arc-hp{height:100%;border-radius:4px;transition:width .4s}
.arc-hp.player{background:#22c55e}
.arc-hp.boss{background:#ef4444}
.arc-vs{font-size:1.1rem;font-weight:900;text-align:center}
.arc-step{display:flex;align-items:flex-start;gap:10px;padding:9px 12px;margin-bottom:6px;background:var(--surface-color);border:1.5px solid var(--border-color);border-radius:var(--radius-md);cursor:pointer;transition:all .15s}
.arc-step:hover{border-color:#3b82f6;background:rgba(59,130,246,.06)}
.arc-step-sel{border-color:#ef4444!important;background:rgba(239,68,68,.08)!important}
.arc-step-n{font-size:.7rem;font-weight:700;color:var(--text-muted);white-space:nowrap;margin-top:2px}
.arc-step-t{font-size:.87rem;line-height:1.5}
.arc-mission{display:flex;align-items:center;gap:10px;padding:11px 0;border-bottom:1px solid var(--border-color)}
.arc-mission-done{opacity:.55}
.arc-mission-lbl{flex:1;font-size:.87rem}
.arc-sprog-w{height:6px;background:var(--border-color);border-radius:3px;overflow:hidden;margin-bottom:6px}
.arc-sprog{height:100%;background:linear-gradient(90deg,#f97316,#ef4444);transition:width .3s}
.arc-streak-bonus{background:linear-gradient(135deg,rgba(251,191,36,.12),rgba(245,158,11,.08));border:1px solid rgba(251,191,36,.3);border-radius:var(--radius-md);padding:10px;text-align:center;font-weight:700;color:#fbbf24;margin-top:10px}
.arc-zone{padding:16px;background:var(--surface-color);border:1.5px solid var(--border-color);border-radius:var(--radius-lg);cursor:pointer;font-family:var(--font-body);transition:all .2s;display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center}
.arc-zone:hover:not([disabled]){border-color:var(--zc);transform:translateY(-2px)}
.arc-zone-lock{opacity:.38;cursor:not-allowed}
.arc-zone-done{border-color:#22c55e;background:rgba(34,197,94,.07)}
.arc-ai-gate{padding:28px;text-align:center;max-width:460px;margin:0 auto}
.arc-ai-badge{background:rgba(139,92,246,.12);border:1px solid rgba(139,92,246,.25);color:#a855f7;border-radius:var(--radius-pill);display:inline-block;padding:4px 12px;font-size:.8rem;font-weight:700;margin-bottom:10px}
.arc-ai-response{padding:14px;background:var(--surface-color);border-radius:var(--radius-md);border:1px solid var(--border-color)}
@media(max-width:640px){
  .arc-layout,.arc-wrap{padding:14px}
  .arc-games-grid{grid-template-columns:repeat(2,1fr);gap:10px}
  .arc-boss-grid,.arc-treasure-map{grid-template-columns:1fr}
  .arc-opts-grid{grid-template-columns:1fr}
  .arc-mem-grid{grid-template-columns:repeat(3,1fr)}
  .arc-bingo-grid,.arc-bingo-hdr{max-width:100%}
  .arc-bc{height:50px;font-size:.66rem}
}`;
    document.head.appendChild(s);
  }
}

export const arcadeView = new ArcadeView();
