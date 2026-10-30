const chat = document.querySelector("#chat");
const input = document.querySelector("#message");
const sendBtn = document.querySelector("#sendBtn");
const statusEl = document.querySelector("#status");
let mode = "Daily conversation";
let history = [];
let todayTurns = 0;
let installPrompt = null;

function addBubble(text, who="assistant", extra="") {
  const el = document.createElement("div");
  el.className = `bubble ${who} ${extra}`;
  el.textContent = text;
  chat.appendChild(el);
  chat.scrollTop = chat.scrollHeight;
  return el;
}
function setStatus(s){ statusEl.textContent=s; }
document.querySelectorAll(".mode").forEach(btn => btn.addEventListener("click", () => {
  document.querySelectorAll(".mode").forEach(x=>x.classList.remove("active"));
  btn.classList.add("active"); mode=btn.dataset.mode;
  addBubble(`Practice mode changed to: ${mode}. Tell me when you're ready.`, "assistant");
}));
async function send(text) {
  text = (text || input.value).trim();
  if (!text) return;
  input.value = "";
  addBubble(text, "user");
  history.push({role:"user",content:text});
  todayTurns++;
  document.querySelector("#turns").textContent=todayTurns;
  sendBtn.disabled = true; setStatus("Your AI teacher is thinking...");
  const loading = addBubble("Thinking…", "assistant");
  try {
    const response = await fetch("/api/chat", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({messages:history,mode,language:document.querySelector("#language").value})
    });
    const data = await response.json();
    loading.remove();
    if (!response.ok) throw new Error(data.error || "Request failed");
    addBubble(data.reply);
    history.push({role:"assistant",content:data.reply});
    document.querySelector("#score").textContent = "✓";
    if ("speechSynthesis" in window) {
      // Read replies aloud when the learner chooses the speaker button or enables it later.
    }
    setStatus("Good work. Keep speaking!");
  } catch(err) {
    loading.remove();
    addBubble(err.message, "assistant", "error");
    setStatus("Check your connection or app setup.");
  } finally { sendBtn.disabled=false; input.focus(); }
}
sendBtn.addEventListener("click",()=>send());
input.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}});
document.querySelectorAll("[data-prompt]").forEach(b=>b.addEventListener("click",()=>send(b.dataset.prompt)));
document.querySelector("#clearBtn").addEventListener("click",()=>{
  history=[]; chat.innerHTML="";
  addBubble("Fresh practice started! Tell me about your day in 2–3 English sentences.");
});
const micBtn=document.querySelector("#micBtn");
const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
if(SpeechRecognition){
  const recognition=new SpeechRecognition(); recognition.lang="en-IN"; recognition.interimResults=false;
  micBtn.addEventListener("click",()=>{
    try{recognition.start();micBtn.classList.add("listening");setStatus("Listening… speak now.");}catch(e){}
  });
  recognition.onresult=e=>{input.value=e.results[0][0].transcript;setStatus("Speech captured. Tap send.");};
  recognition.onerror=()=>setStatus("Voice input unavailable. You can type instead.");
  recognition.onend=()=>micBtn.classList.remove("listening");
}else{
  micBtn.addEventListener("click",()=>setStatus("Voice typing works in supported browsers such as Chrome on Android."));
}
window.addEventListener("beforeinstallprompt",e=>{
  e.preventDefault(); installPrompt=e; document.querySelector("#installBtn").classList.remove("hidden");
});
document.querySelector("#installBtn").addEventListener("click",async()=>{
  if(!installPrompt)return; installPrompt.prompt(); await installPrompt.userChoice; installPrompt=null;
  document.querySelector("#installBtn").classList.add("hidden");
});
if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("/sw.js"));
document.querySelector("#streak").textContent=localStorage.getItem("speakStreak")||"1";
