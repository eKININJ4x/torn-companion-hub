/* Manual progress uses the same course data and calculations as API mode. */
(function(){
 'use strict';
 const STORE='tc:education:manual:v1';
 const $=id=>document.getElementById(id);
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let saved=null;
 try{saved=JSON.parse(localStorage.getItem(STORE)||'null')}catch{}
 function seedDurations(){for(const [code,seconds] of Object.entries(window.TC_MANUAL_DURATIONS||{})){if(!courseDurations.has(code))courseDurations.set(code,seconds)}}
 function snapshot(){return {completed:[...completed],merits:Number($('merits').value),wsu:$('wsu').checked,principal:$('principal').checked,job:$('manualJob').value,points:Number($('manualJobPoints').value),current:currentCode,ends:currentCourseEndsAt,mode:apiMode?'api':'manual'}}
 function save(){if(apiMode)return; saved=snapshot();try{localStorage.setItem(STORE,JSON.stringify(saved));$('tcManualSaved').textContent='Manual progress saved in this browser.'}catch{$('tcManualSaved').textContent='Browser storage is unavailable. Keep this page open to retain progress.'}}
 function restore(){
  if(!saved)return;
  const valid=new Set(COURSE_LIST.map(c=>c[0]));completed.clear();for(const code of saved.completed||[])if(valid.has(code))completed.add(code);
  $('merits').value=Math.min(10,Math.max(0,Number(saved.merits)||0));$('wsu').checked=!!saved.wsu;$('principal').checked=!!saved.principal;
  $('manualJob').value=['fitness','hair'].includes(saved.job)?saved.job:'';$('manualJobPoints').value=Math.max(0,Number(saved.points)||0);
  currentCode=valid.has(saved.current)&&!completed.has(saved.current)?saved.current:null;
  currentCourseEndsAt=currentCode&&Number.isFinite(Number(saved.ends))&&Number(saved.ends)>0?Number(saved.ends):null;
  currentTimeLeft=currentCourseEndsAt?Math.max(0,(currentCourseEndsAt-Date.now())/1000):null;
 }
 function updateSummary(){
  $('tcManualSummary').textContent=completed.size+' / '+COURSE_LIST.length+' completed · '+(COURSE_LIST.length-completed.size)+' remaining';
  $('tcManualCurrent').value=currentCode||'';
  $('tcManualDays').value=currentCourseEndsAt?Math.max(0,(currentCourseEndsAt-Date.now())/86400000).toFixed(2):'';
  for(const input of document.querySelectorAll('#tcManualCourses input[data-code]')){
   input.checked=completed.has(input.dataset.code);input.closest('label').classList.toggle('tc-done',input.checked);
  }
  for(const details of document.querySelectorAll('#tcManualCourses details')){const codes=[...details.querySelectorAll('input[data-code]')].map(x=>x.dataset.code);details.querySelector('.tc-manual-count').textContent=codes.filter(c=>completed.has(c)).length+' / '+codes.length}
  const missing=COURSE_LIST.filter(([code])=>!completed.has(code)&&code!==currentCode&&!Number.isFinite(Number(courseDurations.get(code))));
  $('tcManualDurationNote').textContent=currentCode&&!currentCourseEndsAt?'Enter the remaining days for your current course to include it in the total estimate.':missing.length?'Duration data is unavailable for '+missing.length+' course(s). Time estimates cover known courses only.':'Offline base durations are included. Your merits, WSU and Principal perk reduce future courses; the current course uses the remaining time you enter.';
 }
 function recalculate(){seedDurations();updateMods();render();updateSummary();if(typeof v3ShellSync==='function')v3ShellSync();save()}
 function setMode(mode,loadSaved=true){
  if(mode==='api'&&!apiMode)save();
  if(mode==='manual'&&apiMode&&loadSaved)restore();
  tab(mode);document.body.classList.toggle('api-active',mode==='api');
  $('tcManualPanel').hidden=mode!=='manual';
  $('tcModeManual').setAttribute('aria-pressed',String(mode==='manual'));$('tcModeApi').setAttribute('aria-pressed',String(mode==='api'));
  const connection=$('newConnect')?.closest('section');if(connection)connection.hidden=mode==='manual';
  if(mode==='manual')recalculate();
  else {if(saved){saved.mode='api';try{localStorage.setItem(STORE,JSON.stringify(saved))}catch{}}}
 }
 document.addEventListener('DOMContentLoaded',()=>{
  const api=$('newConnect')?.closest('section');if(!api)return;
  const controls=document.createElement('section');controls.className='panel tc-mode-controls';controls.innerHTML='<h2>Choose your mode</h2><div class="tc-mode-buttons"><button id="tcModeApi" class="btn" type="button" aria-pressed="true">API Mode</button><button id="tcModeManual" class="btn secondary" type="button" aria-pressed="false">Manual Mode</button></div><p class="muted">Use a Torn API key, or tick completed courses and enter your settings manually.</p>';api.before(controls);
  const panel=document.createElement('section');panel.id='tcManualPanel';panel.className='panel';panel.hidden=true;
  panel.innerHTML='<h2>Manual education progress</h2><p id="tcManualSummary" class="muted"></p><p id="tcManualSaved" class="muted" role="status">Progress is saved in this browser.</p><div class="tc-manual-layout"><div id="tcManualSettings"><div class="panel"><h3>Current course (optional)</h3><label for="tcManualCurrent">Course in progress</label><select id="tcManualCurrent"><option value="">No current course</option></select><label for="tcManualDays">Remaining days (decimals allowed)</label><input id="tcManualDays" type="number" min="0" step="0.01" inputmode="decimal" placeholder="For example: 2.5"><p class="muted small">Enter the actual remaining time. Future-course percentage reductions are not applied again to this timer.</p></div><p id="tcManualDurationNote" class="muted small"></p></div><div><label for="tcManualSearch">Find a course</label><input id="tcManualSearch" type="search" placeholder="Search code or course name"><div class="tc-mode-buttons"><button id="tcManualAll" class="btn secondary" type="button">Mark all completed</button><button id="tcManualClear" class="btn secondary" type="button">Clear completed courses</button></div><div id="tcManualCourses"></div></div></div>';
  api.after(panel);
  const modifiers=$('merits')?.closest('section');if(modifiers){modifiers.classList.remove('hidden');$('tcManualSettings').prepend(modifiers)}
  for(const [degree,courses] of Object.entries(DATA)){
   const details=document.createElement('details');details.className='tc-manual-degree';details.innerHTML='<summary>'+esc(degree)+' <span class="tc-manual-count"></span></summary>';
   for(const [code,name] of courses){const label=document.createElement('label');label.className='tc-manual-course';label.dataset.search=(code+' '+name).toLowerCase();label.innerHTML='<input type="checkbox" data-code="'+esc(code)+'"><span><b>'+esc(code)+'</b> — '+esc(name)+'</span>';details.appendChild(label);
    const option=document.createElement('option');option.value=code;option.textContent=code+' — '+name;$('tcManualCurrent').appendChild(option)}
   $('tcManualCourses').appendChild(details);
  }
  $('tcModeManual').onclick=()=>setMode('manual');$('tcModeApi').onclick=()=>setMode('api');
  // Connecting with a key explicitly returns to API mode.
  $('newConnect').addEventListener('click',()=>setMode('api'),true);
  $('tcManualCourses').addEventListener('change',e=>{const code=e.target.dataset.code;if(!code)return;e.target.checked?completed.add(code):completed.delete(code);if(code===currentCode&&e.target.checked){currentCode=null;currentCourseEndsAt=null;currentTimeLeft=null}recalculate()});
  for(const id of ['merits','wsu','principal','manualJob','manualJobPoints'])$(id).addEventListener(id==='merits'||id==='manualJobPoints'?'input':'change',()=>{if(!apiMode)recalculate()});
  function activeCourse(){currentCode=$('tcManualCurrent').value||null;if(currentCode)completed.delete(currentCode);const input=$('tcManualDays').value,days=Number(input);currentCourseEndsAt=currentCode&&input!==''&&Number.isFinite(days)&&days>=0?Date.now()+days*86400000:null;currentTimeLeft=currentCourseEndsAt?Math.max(0,(currentCourseEndsAt-Date.now())/1000):null;recalculate()}
  $('tcManualCurrent').onchange=activeCourse;$('tcManualDays').onchange=activeCourse;
  $('tcManualAll').onclick=()=>{COURSE_LIST.forEach(([code])=>completed.add(code));currentCode=null;currentCourseEndsAt=null;currentTimeLeft=null;recalculate()};
  $('tcManualClear').onclick=()=>{if(!confirm('Clear all manually completed courses?'))return;completed.clear();recalculate()};
  $('tcManualSearch').oninput=()=>{const q=$('tcManualSearch').value.trim().toLowerCase();for(const d of $('tcManualCourses').querySelectorAll('details')){let visible=0;for(const row of d.querySelectorAll('label')){row.hidden=!!q&&!row.dataset.search.includes(q);if(!row.hidden)visible++}d.hidden=!visible;if(q)d.open=true}};
  $('manualJob').options[1].textContent='Fitness Center (1 star or higher)';$('manualJob').options[2].textContent='Hair Salon (7 stars or higher)';
  seedDurations();if(saved?.mode==='manual')setMode('manual');
 });
})();
