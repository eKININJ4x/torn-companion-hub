document.addEventListener('DOMContentLoaded',()=>{
 const button=document.getElementById('tcCopyPdaScript');
 button?.addEventListener('click',async()=>{
  const status=document.getElementById('tcPdaCopyStatus');button.disabled=true;status.textContent='Loading the installation script…';
  try{
   const response=await fetch('/scripts/tc-oc.user.js');
   if(!response.ok)throw Error('The script could not be downloaded. Try the Install TC OC button.');
   const script=await response.text();if(!script.startsWith('// ==UserScript=='))throw Error('The installation script was not returned.');
   try{await navigator.clipboard.writeText(script);status.textContent='Script copied. Paste it into Torn PDA’s new userscript editor.'}
   catch{const box=document.getElementById('tcPdaScriptText');box.hidden=false;box.value=script;box.focus();box.select();status.textContent='Copy the complete script from the box below, then paste it into Torn PDA.'}
  }catch(e){status.textContent=e.message}finally{button.disabled=false}
 });
});
