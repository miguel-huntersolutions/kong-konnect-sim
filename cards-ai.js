/* Prompt "Explicar" de las tarjetas: arma el prompt de estudio y lo copia al portapapeles. */
window.KKAI=(function(){
function buildPrompt(c,d,lang){
  const pts=c.p.map(x=>"- "+x).join("\n");
  if(lang==="es") return `Actúa como instructor experto en Kong Konnect. Me estoy preparando para el examen Kong Konnect Certified Associate, que es de selección múltiple y en inglés.

Tema: ${c.h}
Dominio del examen: ${d}
Pregunta de mi tarjeta de estudio: ${c.q}
Respuesta corta de la tarjeta:
${pts}
${c.t?"Trampa frecuente en el examen: "+c.t+"\n":""}
Quiero entender el tema, no memorizarlo. Sigue este orden:
1. Explica el concepto en lenguaje simple, en menos de 150 palabras, y luego con una analogía del mundo real.
2. Muestra cómo funciona en Konnect: componentes que participan y el flujo paso a paso. Si aplica, incluye un ejemplo corto de configuración (YAML de decK, Admin API o pasos en la UI de Konnect).
3. Compáralo en una tabla corta con los conceptos con los que más se confunde en el examen.
4. ${c.t?"Explica la trampa anterior: a qué respuesta equivocada suele llevar y cómo reconocerla en el enunciado de una pregunta.":"Señala la trampa más frecuente del examen sobre este tema y cómo reconocerla en el enunciado de una pregunta."}
5. Hazme 3 preguntas de práctica tipo examen, en inglés, con 4 opciones cada una y dificultad creciente. No muestres las respuestas: espera las mías, califícalas y explica por qué cada opción es correcta o incorrecta.
6. Cierra con un resumen de 3 líneas para repasar la noche antes del examen.

Toma como referencia la documentación oficial vigente de Kong (developer.konghq.com). Si algo cambió hace poco o no estás seguro, dilo en vez de suponer. Responde en español, pero deja en inglés los nombres de componentes, comandos y las preguntas de práctica.`;
  return `Act as an expert Kong Konnect instructor. I am preparing for the Kong Konnect Certified Associate exam, which is multiple choice and in English.

Topic: ${c.h}
Exam domain: ${d}
Question on my study card: ${c.q}
Short answer from the card:
${pts}
${c.t?"Common exam trap: "+c.t+"\n":""}
I want to understand this topic, not memorize it. Follow this order:
1. Explain the concept in plain language in under 150 words, then with a real-world analogy.
2. Show how it works in Konnect: the components involved and the flow step by step. When it applies, include a short configuration example (decK YAML, Admin API or Konnect UI steps).
3. Compare it in a short table with the concepts it is most often confused with on the exam.
4. ${c.t?"Explain the trap above: which wrong answer it usually leads to and how to recognize it in the wording of a question.":"Point out the most common exam trap on this topic and how to recognize it in the wording of a question."}
5. Give me 3 exam-style practice questions with 4 options each, increasing in difficulty. Do not show the answers: wait for mine, grade them and explain why each option is right or wrong.
6. Close with a 3-line summary I can review the night before the exam.

Use the current official Kong documentation (developer.konghq.com) as your reference. If something changed recently or you are not sure, say so instead of guessing.`;
}
function toast(msg){const t=document.createElement("div");t.className="toast";t.setAttribute("role","status");t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),2600);}
function manualCopy(text,L){
  const o=document.createElement("div");o.className="pbox";
  o.innerHTML=`<div><p>${L.manual}</p><textarea readonly></textarea><button class="btn">${L.close}</button></div>`;
  const ta=o.querySelector("textarea"); ta.value=text; document.body.appendChild(o); ta.focus(); ta.select();
  o.querySelector("button").onclick=()=>o.remove();
}
function copyPrompt(text,L,btn){
  const ok=()=>{btn.classList.add("on");setTimeout(()=>btn.classList.remove("on"),1500);toast(L.copied);};
  const legacy=()=>{try{const ta=document.createElement("textarea");ta.value=text;ta.setAttribute("readonly","");ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.select();const r=document.execCommand("copy");ta.remove();return r;}catch(e){return false}};
  if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(text).then(ok,()=>{legacy()?ok():manualCopy(text,L)});}
  else { legacy()?ok():manualCopy(text,L); }
}

return {buildPrompt,copyPrompt};
})();
