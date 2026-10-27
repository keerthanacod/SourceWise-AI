const API = "http://127.0.0.1:8000";
const $ = (id) => document.getElementById(id);
let pageText = "", pageUrl = "", indexedFiles = 0;

function addMessage(role, text, evidence = []) {
  const chat = $("chat");
  const welcome = chat.querySelector(".welcome");
  if (welcome) welcome.remove();
  const bubble = document.createElement("div");
  bubble.className = `message ${role}`;
  if (role === "assistant") {
    const label = document.createElement("div"); label.className = "label";
    label.textContent = "SourceWise AI"; bubble.appendChild(label);
  }
  const content = document.createElement("div"); content.textContent = text; bubble.appendChild(content);
  if (evidence.length) {
    const ev = document.createElement("div"); ev.className = "evidence";
    const heading = document.createElement("strong"); heading.textContent = "Evidence"; ev.appendChild(heading);
    evidence.slice(0, 4).forEach((item, i) => {
      const p = document.createElement("p"); p.textContent = `[${i+1}] ${item.source || "Source"}: ${item.text || item}`; ev.appendChild(p);
    });
    bubble.appendChild(ev);
  }
  chat.appendChild(bubble); bubble.scrollIntoView({block:"end",behavior:"smooth"});
}
async function checkBackend() {
  try { const r = await fetch(`${API}/api/health`); const d = await r.json();
    $("backendStatus").textContent = d.ok ? `Backend connected • ${d.model}${d.model_available ? "" : " (model missing)"}` : (d.message || "Backend not ready");
  } catch { $("backendStatus").textContent = "Backend offline — start backend/app.py"; }
}
$("readPage").addEventListener("click", async () => {
  $("readPage").disabled = true; $("pageStatus").textContent = "Reading current tab…";
  try {
    const [tab] = await chrome.tabs.query({active:true,lastFocusedWindow:true});
    if (!tab?.id || !/^https?:/.test(tab.url || "")) throw new Error("Open a normal http/https webpage first. Chrome internal pages cannot be read.");
    const result = await chrome.scripting.executeScript({target:{tabId:tab.id},func:()=>({title:document.title,url:location.href,text:(document.body?.innerText||"").slice(0,60000)})});
    const data = result?.[0]?.result;
    if (!data?.text?.trim()) throw new Error("No readable text found on this page.");
    pageText=data.text; pageUrl=data.url; $("pageTitle").textContent=data.title||data.url;
    $("pageStatus").textContent=data.url; $("pageWords").textContent=`${pageText.length.toLocaleString()} characters`;
    const r=await fetch(`${API}/api/page`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:data.title,url:data.url,text:data.text})});
    const d=await r.json(); if(!r.ok) throw new Error(d.error||"Could not send page to backend.");
    $("pageStatus").textContent="Page text ready as evidence.";
  } catch(e) { $("pageStatus").textContent=e.message; }
  finally { $("readPage").disabled=false; }
});
$("clearPage").addEventListener("click",()=>{pageText="";pageUrl="";$("pageTitle").textContent="No page read yet";$("pageStatus").textContent="Click “Read page” to use the current tab as evidence.";$("pageWords").textContent="0 characters";});
$("files").addEventListener("change",async(event)=>{
  const selected=[...event.target.files];if(!selected.length)return;$("fileStatus").textContent="Indexing files…";
  try {for(const file of selected){const form=new FormData();form.append("file",file);const r=await fetch(`${API}/api/upload`,{method:"POST",body:form});const d=await r.json();if(!r.ok)throw new Error(d.error||`Could not index ${file.name}`);indexedFiles++;}
    $("fileStatus").textContent=`${indexedFiles} file(s) indexed`;
  } catch(e){$("fileStatus").textContent=e.message;}finally{event.target.value="";}
});
$("askForm").addEventListener("submit",async(event)=>{
  event.preventDefault();const question=$("question").value.trim();if(!question)return;addMessage("user",question);$("question").value="";$("send").disabled=true;$("send").textContent="Thinking…";
  try {const r=await fetch(`${API}/api/ask`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question,mode:$("mode").value,page_text:pageText,page_url:pageUrl})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Question failed.");addMessage("assistant",d.answer,d.evidence||[]);}
  catch(e){addMessage("assistant",`${e.message}\n\nCheck that the Python backend is running and Ollama has a downloaded model.`);}
  finally{$("send").disabled=false;$("send").textContent="Ask ↗";}
});
checkBackend();setInterval(checkBackend,12000);
