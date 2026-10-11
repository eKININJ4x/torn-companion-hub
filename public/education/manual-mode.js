/* Manual progress uses the same course data and calculations as API mode. */
(function(){
 'use strict';
 const STORE='tc:education:manual:v1';
 // The legacy roadmap renderer expects catalogue maps that were never initialized.
 window.catalogue=new Map();window.catalogueIdToCode=new Map();
 const buildCatalogue=window.buildEducationMap;
 window.buildEducationMap=function(data){
  const result=buildCatalogue.apply(this,arguments);window.catalogueIdToCode=result.byId;window.catalogue=new Map();
  const names=new Map(COURSE_LIST.map(([code,name])=>[normName(name),code]));
  function visit(node){if(!node||typeof node!=='object')return;const text=[node.code,node.name,node.title,node.course].filter(Boolean).join(' ');const code=codeFromText(text)||names.get(normName(node.name||node.title||node.course));if(code)window.catalogue.set(code,node);Object.values(node).forEach(value=>{if(value&&typeof value==='object')visit(value)})}
  visit(data);return result;
 };
 const degreeLabel=degree=>{const code=DATA[degree]?.[0]?.[0]?.match(/^[A-Z]+/)?.[0];return code?'('+code+') '+degree:degree};
 const $=id=>document.getElementById(id);
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let saved=null, apiSnapshot=null;
 try{saved=JSON.parse(localStorage.getItem(STORE)||'null');if(!saved||typeof saved!=='object'||!Array.isArray(saved.completed))saved=null}catch{}
 function seedDurations(){for(const [code,seconds] of Object.entries(window.TC_MANUAL_DURATIONS||{})){if(!courseDurations.has(code))courseDurations.set(code,seconds)}}
 function snapshot(){return {completed:[...completed],merits:Number($('merits').value),wsu:$('wsu').checked,principal:$('principal').checked,job:$('manualJob').value,points:Number($('manualJobPoints').value),current:currentCode,ends:currentCourseEndsAt,mode:apiMode?'api':'manual'}}
 function save(){if(apiMode)return; saved=snapshot();try{localStorage.setItem(STORE,JSON.stringify(saved));$('tcManualSaved').textContent='Manual progress saved in this browser.'}catch{$('tcManualSaved').textContent='Browser storage is unavailable. Keep this page open to retain progress.'}}
 function restore(){
  const state=saved||{completed:[],merits:0,wsu:false,principal:false,job:'',points:0,current:null,ends:null};
  const valid=new Set(COURSE_LIST.map(c=>c[0]));completed.clear();for(const code of state.completed||[])if(valid.has(code))completed.add(code);
  $('merits').value=Math.min(10,Math.max(0,Number(state.merits)||0));$('wsu').checked=!!state.wsu;$('principal').checked=!!state.principal;
  $('manualJob').value=['fitness','hair'].includes(state.job)?state.job:'';$('manualJobPoints').value=Math.max(0,Number(state.points)||0);
  currentCode=valid.has(state.current)&&!completed.has(state.current)?state.current:null;
  currentCourseEndsAt=currentCode&&Number.isFinite(Number(state.ends))&&Number(state.ends)>0?Number(state.ends):null;
  currentTimeLeft=currentCourseEndsAt?Math.max(0,(currentCourseEndsAt-Date.now())/1000):null;
 }
 function updateSummary(){
  $('tcManualSummary').textContent=completed.size+' / '+COURSE_LIST.length+' completed · '+(COURSE_LIST.length-completed.size)+' remaining';
  $('tcManualCurrent').value=currentCode||'';
  $('tcManualDays').value=currentCourseEndsAt?Math.max(0,(currentCourseEndsAt-Date.now())/86400000).toFixed(2):'';
  for(const input of document.querySelectorAll('#tcManualCourses input[data-code]')){
   input.checked=completed.has(input.dataset.code);input.closest('label').classList.toggle('tc-done',input.checked);
  }
  for(const details of document.querySelectorAll('#tcManualCourses details')){const codes=[...details.querySelectorAll('input[data-code]')].map(x=>x.dataset.code);const done=codes.filter(c=>completed.has(c)).length;details.querySelector('.tc-manual-count').textContent=done+' / '+codes.length;const group=details.querySelector('input[data-degree]');group.checked=done===codes.length;group.indeterminate=done>0&&done<codes.length}
  const missing=COURSE_LIST.filter(([code])=>!completed.has(code)&&code!==currentCode&&!Number.isFinite(Number(courseDurations.get(code))));
  $('tcManualDurationNote').textContent=currentCode&&!currentCourseEndsAt?'Enter the remaining days for your current course to include it in the total estimate.':missing.length?'Duration data is unavailable for '+missing.length+' course(s). Time estimates cover known courses only.':'Offline base durations are included. Your merits, WSU and Principal perk reduce future courses; the current course uses the remaining time you enter.';
 }
 function syncManualDashboard(){
  if(apiMode)return;
  const total=COURSE_LIST.length,done=completed.size,pct=Math.round(done/total*100);
  const set=(id,value)=>{if($(id))$(id).textContent=value};
  const rec=v3Recommendations(),next=rec?.code||rec?.next||'—';
  set('newStatus','Manual mode');set('newDiag','Using your saved manual progress. No API key required.');
  set('mDone',done+' / '+total);set('sideCount',done+' / '+total);set('mPct',pct+'%');set('sidePct',pct+'%');set('mRemain',total-done);
  set('mCurrent',currentCode||'—');set('tNow',currentCode||'—');set('mNext',next);set('tNext',next);
  const finish=done===total?'Complete 🎉':currentCode&&!currentCourseEndsAt?'Enter current-course time':$('timeFinishDate').textContent;
  set('mFinish',finish);set('tFinish',finish);set('sCurrent',$('timeTotalRemaining').textContent);
  set('newAchievements',done+' courses completed · '+(total-done)+' remaining · '+pct+'% overall progress');
  if($('mDoneBar'))$('mDoneBar').style.width=pct+'%';
  document.querySelector('.sideProgress')?.style.setProperty('--sidepct',pct+'%');
  for(const el of document.querySelectorAll('[data-degree-count]')){const list=DATA[el.dataset.degreeCount]||[],n=list.filter(([c])=>completed.has(c)).length;el.textContent=n+' / '+list.length;el.closest('.degree')?.style.setProperty('--pct',list.length?Math.round(n/list.length*100)+'%':'0%')}
  set('v3JobReductionValue',$('jobPointEduValue').textContent);set('v3JobReductionDetail',$('jobPointEduDetail').textContent);
 }
 function recalculate(){seedDurations();updateMods();render();updateSummary();syncManualDashboard();save()}
 function captureApi(){return {progress:snapshot(),durations:new Map(courseDurations),job:currentJobPointInfo,status:$('newStatus')?.textContent}}
 function restoreApi(){
  const state=apiSnapshot?.progress||{completed:[],merits:0,wsu:false,principal:false,current:null,ends:null};
  completed.clear();for(const c of state.completed)completed.add(c);
  $('merits').value=state.merits;$('wsu').checked=state.wsu;$('principal').checked=state.principal;
  currentCode=state.current;currentCourseEndsAt=state.ends;currentTimeLeft=state.ends?Math.max(0,(state.ends-Date.now())/1000):null;
  courseDurations=apiSnapshot?.durations||new Map();currentJobPointInfo=apiSnapshot?.job||null;
  $('newStatus').textContent=apiSnapshot?.status||'Not connected';
 }

 function setMode(mode,loadSaved=true){
  if(mode==='api'&&!apiMode){save();restoreApi()}
  if(mode==='manual'&&apiMode&&loadSaved){apiSnapshot=captureApi();restore()}
  tab(mode);document.body.classList.toggle('api-active',mode==='api');
  $('tcManualPanel').hidden=mode!=='manual';
  $('tcModeManual').setAttribute('aria-pressed',String(mode==='manual'));$('tcModeApi').setAttribute('aria-pressed',String(mode==='api'));
  const connection=$('newConnect')?.closest('section');if(connection)connection.hidden=mode==='manual';
  if(mode==='manual')recalculate();
  else {updateMods();v3ShellSync();renderV3JobReduction();$('tFinish').textContent=$('newStatus').textContent==='Connected'?$('timeFinishDate').textContent:'—';if(saved){saved.mode='api';try{localStorage.setItem(STORE,JSON.stringify(saved))}catch{}}}
 }
 document.addEventListener('DOMContentLoaded',()=>{
  const api=$('newConnect')?.closest('section');if(!api)return;
  const controls=document.createElement('section');controls.className='panel tc-mode-controls';controls.innerHTML='<h2>Choose your mode</h2><div class="tc-mode-buttons"><button id="tcModeApi" class="btn" type="button" aria-pressed="true">API Mode</button><button id="tcModeManual" class="btn secondary" type="button" aria-pressed="false">Manual Mode</button></div><p class="muted">Use a Torn API key, or tick completed courses and enter your settings manually.</p>';api.before(controls);
  const panel=document.createElement('section');panel.id='tcManualPanel';panel.className='panel';panel.hidden=true;
  panel.innerHTML='<h2>Manual education progress</h2><p id="tcManualSummary" class="muted"></p><p id="tcManualSaved" class="muted" role="status">Progress is saved in this browser.</p><div class="tc-manual-layout"><div id="tcManualSettings"><div class="panel"><h3>Current course (optional)</h3><label for="tcManualCurrent">Course in progress</label><select id="tcManualCurrent"><option value="">No current course</option></select><label for="tcManualDays">Remaining days (decimals allowed)</label><input id="tcManualDays" type="number" min="0" step="0.01" inputmode="decimal" placeholder="For example: 2.5"><p class="muted small">Enter the actual remaining time. Future-course percentage reductions are not applied again to this timer.</p></div><p id="tcManualDurationNote" class="muted small"></p></div><div><label for="tcManualSearch">Find a course</label><input id="tcManualSearch" type="search" placeholder="Search code or course name"><div class="tc-mode-buttons"><button id="tcManualAll" class="btn secondary" type="button">Mark all completed</button><button id="tcManualClear" class="btn secondary" type="button">Clear completed courses</button></div><div id="tcManualCourses"></div></div></div>';
  api.after(panel);
  const modifiers=$('merits')?.closest('section');if(modifiers){modifiers.classList.remove('hidden');$('tcManualSettings').prepend(modifiers)}
  for(const [degree,courses] of Object.entries(DATA)){
   const details=document.createElement('details');details.className='tc-manual-degree';details.innerHTML='<summary><span class="tc-manual-heading"><input type="checkbox" data-degree="'+esc(degree)+'" aria-label="Mark all '+esc(degree)+' courses completed"><span>'+esc(degreeLabel(degree))+'</span></span><span class="tc-manual-count"></span></summary>';details.querySelector('input[data-degree]').addEventListener('click',e=>e.stopPropagation());
   for(const [code,name] of courses){const label=document.createElement('label');label.className='tc-manual-course';label.dataset.search=(code+' '+name).toLowerCase();label.innerHTML='<input type="checkbox" data-code="'+esc(code)+'"><span><b>'+esc(code)+'</b> — '+esc(name)+'</span>';details.appendChild(label);
    const option=document.createElement('option');option.value=code;option.textContent=code+' — '+name;$('tcManualCurrent').appendChild(option)}
   $('tcManualCourses').appendChild(details);
  }
  // Reuse the existing selector so theme preferences and listeners stay intact.
  const themeRow=$('themeSelect')?.closest('.theme-row');
  if(themeRow){const topbar=document.createElement('div');topbar.className='tc-education-topbar';topbar.appendChild(themeRow);document.querySelector('main')?.prepend(topbar)}
  const roadmapDialog=$('roadmapDialog');
  if(roadmapDialog)document.body.appendChild(roadmapDialog);
  const recommendationPanel=$('v3Stage6Result');
  if(recommendationPanel){
   $('next')?.appendChild(recommendationPanel);
   const tornEducation=document.createElement('a');tornEducation.className='btn secondary tc-torn-education';tornEducation.href='https://www.torn.com/education.php';tornEducation.target='_blank';tornEducation.rel='noopener noreferrer';tornEducation.textContent='Open Torn Education ↗';
   const educationLinks=document.createElement('div');educationLinks.className='tc-mode-buttons';educationLinks.appendChild(tornEducation);$('next')?.querySelector('.sectionHead')?.appendChild(educationLinks);
   const viewCourse=document.createElement('button');viewCourse.id='tcViewRecommendedCourse';viewCourse.type='button';viewCourse.className='btn';viewCourse.textContent='View recommended course';recommendationPanel.appendChild(viewCourse);
   const recommended=()=>window.v3Stage6Recommendation?.();
   const updateButton=()=>{const code=recommended()?.code;viewCourse.disabled=!code;viewCourse.hidden=!code};
   viewCourse.onclick=()=>{const code=recommended()?.code;if(!code)return;const degree=Object.keys(DATA).find(d=>DATA[d].some(([c])=>c===code));if(!degree)return;window.openV3CourseBrowser(degree);const row=[...document.querySelectorAll('#v3CourseRows .v3-course-row')].find(r=>r.querySelector('b')?.textContent===code);if(row){row.click();row.scrollIntoView({block:'center'});row.focus({preventScroll:true})}};
   new MutationObserver(updateButton).observe($('v3Stage6Title'),{childList:true,characterData:true,subtree:true});updateButton();
  }
  // The sidebar must open the interactive dialog, rather than scroll to an old placeholder.
  document.querySelectorAll('nav button[data-go="roadmap"]').forEach(button=>{button.onclick=()=>{document.querySelectorAll('nav button').forEach(b=>b.classList.remove('active'));button.classList.add('active');openRoadmap('all')}});
  document.querySelectorAll('.side-nav nav a[href="#roadmap"]').forEach(link=>{link.onclick=e=>{e.preventDefault();openRoadmap('all')}});
  // Keep abbreviations derived from the actual course codes, while retaining internal degree names.
  document.querySelectorAll('.degree[data-degree]').forEach(card=>{const title=card.querySelector('span');if(title)title.textContent=degreeLabel(card.dataset.degree)});
  $('roadmapDegree')?.querySelectorAll('option').forEach(option=>{if(DATA[option.value])option.textContent=degreeLabel(option.value)});
  $('tcModeManual').onclick=()=>setMode('manual');$('tcModeApi').onclick=()=>setMode('api');
  // Connecting with a key explicitly returns to API mode.
  $('newConnect').addEventListener('click',()=>setMode('api'),true);
  $('tcManualCourses').addEventListener('change',e=>{const degree=e.target.dataset.degree;const code=e.target.dataset.code;if(!code&&!degree)return;const codes=degree?(DATA[degree]||[]).map(([c])=>c):[code];for(const c of codes)e.target.checked?completed.add(c):completed.delete(c);if(codes.includes(currentCode)&&e.target.checked){currentCode=null;currentCourseEndsAt=null;currentTimeLeft=null}recalculate()});
  for(const id of ['merits','wsu','principal','manualJob','manualJobPoints'])$(id).addEventListener(id==='merits'||id==='manualJobPoints'?'input':'change',()=>{if(!apiMode)recalculate()});
  function activeCourse(){currentCode=$('tcManualCurrent').value||null;if(currentCode)completed.delete(currentCode);const input=$('tcManualDays').value,days=Number(input);currentCourseEndsAt=currentCode&&input!==''&&Number.isFinite(days)&&days>=0?Date.now()+days*86400000:null;currentTimeLeft=currentCourseEndsAt?Math.max(0,(currentCourseEndsAt-Date.now())/1000):null;recalculate()}
  $('tcManualCurrent').onchange=activeCourse;$('tcManualDays').onchange=activeCourse;
  $('tcManualAll').onclick=()=>{COURSE_LIST.forEach(([code])=>completed.add(code));currentCode=null;currentCourseEndsAt=null;currentTimeLeft=null;recalculate()};
  $('tcManualClear').onclick=()=>{if(!confirm('Clear all manually completed courses?'))return;completed.clear();recalculate()};
  $('tcManualSearch').oninput=()=>{const q=$('tcManualSearch').value.trim().toLowerCase();for(const d of $('tcManualCourses').querySelectorAll('details')){let visible=0;for(const row of d.querySelectorAll('label')){row.hidden=!!q&&!row.dataset.search.includes(q);if(!row.hidden)visible++}d.hidden=!visible;if(q)d.open=true}};
  $('manualJob').options[1].textContent='Fitness Center (1 star or higher)';$('manualJob').options[2].textContent='Hair Salon (7 stars or higher)';
  // Keep all shell refresh paths aware of manual mode.
  const shellSync=window.v3ShellSync;
  window.v3ShellSync=function(){if(!apiMode){syncManualDashboard();return}return shellSync?.apply(this,arguments)};
  const jobSync=window.renderV3JobReduction;
  window.renderV3JobReduction=function(){if(!apiMode){syncManualDashboard();return}return jobSync?.apply(this,arguments)};
  if(saved?.mode==='manual')setMode('manual');else $('tFinish').textContent='—';
  setInterval(()=>{if(!apiMode){calculateTimes();syncManualDashboard()}},30000);

 });
})();
