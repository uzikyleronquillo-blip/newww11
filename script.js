const questions = [
  {c:"Common Jobs",q:"Which job usually teaches students in a school?",a:["Teacher","Pilot","Dentist"],correct:0},
  {c:"Common Jobs",q:"Who prepares food professionally in a restaurant?",a:["Chef","Architect","Cashier"],correct:0},
  {c:"Common Jobs",q:"Who helps people when they have a tooth problem?",a:["Dentist","Photographer","Farmer"],correct:0},
  {c:"Uncommon Jobs",q:"Who tests video games to find bugs and problems?",a:["Game Tester","Bus Driver","Baker"],correct:0},
  {c:"Uncommon Jobs",q:"Who professionally studies and trains animals for films or shows?",a:["Animal Trainer","Accountant","Receptionist"],correct:0},
  {c:"Uncommon Jobs",q:"Who creates and tests flavors for food products?",a:["Flavorist","Nurse","Mechanic"],correct:0},
  {c:"Creative Jobs",q:"Which job creates visual designs for posters and brands?",a:["Graphic Designer","Plumber","Security Guard"],correct:0},
  {c:"Creative Jobs",q:"Who creates characters and artwork for animated films?",a:["Animator","Chef","Electrician"],correct:0},
  {c:"Creative Jobs",q:"Who writes music for films, games, or performances?",a:["Composer","Cashier","Surgeon"],correct:0},
  {c:"Technical Jobs",q:"Which job develops computer programs and applications?",a:["Software Developer","Waiter","Painter"],correct:0},
  {c:"Technical Jobs",q:"Who designs and maintains computer networks?",a:["Network Engineer","Singer","Florist"],correct:0},
  {c:"Technical Jobs",q:"Who works with machines, circuits, and electrical systems?",a:["Electrical Engineer","Journalist","Chef"],correct:0}
];

const cats=["🐱","😺","😸","😹","😻"];
let players=[], current=0, scores=[], locked=false, timeLeft=20, timerId=null;

const $=id=>document.getElementById(id);

function renderInputs(){
  $("playerInputs").innerHTML="";
  for(let i=0;i<players.length;i++){
    const input=document.createElement("input");
    input.placeholder=`Player ${i+1} / Team ${i+1}`;
    input.value=players[i]||"";
    input.addEventListener("input",e=>players[i]=e.target.value);
    $("playerInputs").appendChild(input);
  }
  $("addPlayer").style.display=players.length>=5?"none":"inline-block";
}
function addPlayer(){ if(players.length<5){players.push("");renderInputs();}}
$("addPlayer").onclick=addPlayer;
addPlayer(); addPlayer(); addPlayer();

$("startGame").onclick=()=>{
  players=players.map((x,i)=>x.trim()||`Team ${i+1}`);
  scores=players.map(()=>0);
  current=0;
  $("setup").classList.add("hidden");
  $("results").classList.add("hidden");
  $("game").classList.remove("hidden");
  $("qTotal").textContent=questions.length;
  loadQuestion();
};

function loadQuestion(){
  locked=false;
  $("nextBtn").classList.add("hidden");
  const item=questions[current];
  $("qNum").textContent=current+1;
  $("category").textContent=item.c;
  $("question").textContent=item.q;
  $("message").textContent="🐾 Choose an answer! The first correct cat gets the point.";
  $("maze").innerHTML="";
  const shuffled=[...item.a].map((answer,i)=>({answer,i})).sort(()=>Math.random()-.5);

  players.forEach((name,p)=>{
    const lane=document.createElement("div");
    lane.className="lane";
    lane.innerHTML=`<div class="lane-title">${cats[p]} ${escapeHtml(name)}</div><div class="track"></div><div class="cat">${cats[p]}</div>`;
    const track=lane.querySelector(".track");
    shuffled.forEach(x=>{
      const b=document.createElement("button");
      b.className="answer";
      b.textContent=x.answer;
      b.onclick=()=>choose(p,x.i,b,lane);
      track.appendChild(b);
    });
    $("maze").appendChild(lane);
  });
  startTimer();
  updateScores();
}

function choose(p,index,button,lane){
  if(locked)return;
  if(index===questions[current].correct){
    locked=true;
    scores[p]++;
    button.classList.add("correct");
    lane.querySelector(".cat").style.left="88%";
    $("message").textContent=`🏆 ${players[p]} reached the correct answer first! +1 point`;
    clearInterval(timerId);
    document.querySelectorAll(".answer").forEach(b=>b.disabled=true);
    $("nextBtn").classList.remove("hidden");
    updateScores();
  }else{
    button.classList.add("wrong");
    button.disabled=true;
    $("message").textContent=`❌ ${players[p]} chose the wrong answer. Try another answer!`;
  }
}

$("nextBtn").onclick=()=>{
  current++;
  if(current>=questions.length) showResults();
  else loadQuestion();
};

function startTimer(){
  clearInterval(timerId);
  timeLeft=20;
  $("timer").textContent=timeLeft;
  timerId=setInterval(()=>{
    timeLeft--;
    $("timer").textContent=timeLeft;
    if(timeLeft<=0){
      clearInterval(timerId);
      if(!locked){
        locked=true;
        $("message").textContent="⏰ Time's up! No point this round.";
        document.querySelectorAll(".answer").forEach(b=>b.disabled=true);
        $("nextBtn").classList.remove("hidden");
      }
    }
  },1000);
}
function updateScores(){
  $("scores").innerHTML=players.map((p,i)=>`<div class="score">${cats[i]} <strong>${escapeHtml(p)}</strong><br>⭐ ${scores[i]}</div>`).join("");
}
function showResults(){
  clearInterval(timerId);
  $("game").classList.add("hidden");
  $("results").classList.remove("hidden");
  const order=players.map((p,i)=>({p,i,s:scores[i]})).sort((a,b)=>b.s-a.s);
  $("resultList").innerHTML=order.map((x,pos)=>`<div class="result"><span>${pos+1}. ${cats[x.i]} ${escapeHtml(x.p)}</span><strong>${x.s} point${x.s===1?"":"s"}</strong></div>`).join("");
}
$("restart").onclick=()=>{
  $("results").classList.add("hidden");
  $("setup").classList.remove("hidden");
  renderInputs();
};
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}
