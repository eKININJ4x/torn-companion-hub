const PREFIX='feedback:v1:';
const TOOLS=['General / Hub','Education Companion','Faction Armory','War Payouts','TC OC Utility Manager','OC Minimums','Item Market Watcher','Training & Stat Enhancers'];
const TYPES=['Bug report','Suggestion','General feedback'];
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json;charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer'}});
const clean=(v,max)=>typeof v==='string'?v.trim().slice(0,max):'';
async function boundedBody(request){const reader=request.body?.getReader();if(!reader)throw Error('Empty request');let size=0,parts=[];while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>10000){await reader.cancel();throw Error('Payload too large');}parts.push(value);}const bytes=new Uint8Array(size);let offset=0;for(const p of parts){bytes.set(p,offset);offset+=p.length;}return JSON.parse(new TextDecoder().decode(bytes));}
async function authorized(request,env){const token=request.headers.get('authorization')||'';if(!/^Bearer [^\s]{1,256}$/.test(token))return false;try{if(!env.FEEDBACK_ADMIN)return false;const r=await env.FEEDBACK_ADMIN.fetch('https://feedback-admin/admin/watchlist',{headers:{Authorization:token},signal:AbortSignal.timeout(10000),redirect:'error'});if(!r.ok)return false;const d=await r.json();return Array.isArray(d.watchlist);}catch{return false;}}
export default {
 async fetch(request,env){
 const url=new URL(request.url);
 if(!url.pathname.startsWith('/api/feedback'))return env.ASSETS.fetch(request);
 if(url.pathname!=='/api/feedback')return json({error:'Not found'},404);
 if(!env.FEEDBACK_STORE)return json({error:'Feedback storage is temporarily unavailable. Please try again later.'},503);
 try{
 if(request.method==='GET'){
  if(!env.FEEDBACK_LIMIT||!(await env.FEEDBACK_LIMIT.limit({key:'admin:'+(request.headers.get('CF-Connecting-IP')||'unknown')})).success)return json({error:'Please wait a minute before trying the inbox again.'},429);
  if(!await authorized(request,env))return json({error:'Administrator token not accepted. Use the existing background Worker ADMIN_TOKEN.'},401);
  const cursor=url.searchParams.get('cursor');if(cursor&&cursor.length>2048)return json({error:'Invalid cursor'},400);
  const list=await env.FEEDBACK_STORE.list({prefix:PREFIX,limit:50,...(cursor?{cursor}:{})});
  const entries=(await Promise.all(list.keys.map(k=>env.FEEDBACK_STORE.get(k.name,{type:'json'})))).filter(Boolean);
  return json({entries,cursor:list.list_complete?null:list.cursor});
 }
 if(request.method!=='POST')return json({error:'Method not allowed'},405);
 if(request.headers.get('origin')!==url.origin)return json({error:'Submit feedback from the Torn Companion form.'},403);
 if(!(request.headers.get('content-type')||'').startsWith('application/json'))return json({error:'Expected JSON'},415);
 if(!env.FEEDBACK_LIMIT)return json({error:'Feedback spam protection is temporarily unavailable.'},503);
 const ip=request.headers.get('CF-Connecting-IP')||'unknown';
 const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('tc-feedback:'+new Date().toISOString().slice(0,10)+':'+ip));const hash=Array.from(new Uint8Array(bytes),x=>x.toString(16).padStart(2,'0')).join('');
 if(!(await env.FEEDBACK_LIMIT.limit({key:hash})).success)return json({error:'Too many submissions. Please wait a minute and try again.'},429);
 const d=await boundedBody(request);
 if(d.website)return json({error:'Submission blocked by spam protection.'},400);
 if(!TOOLS.includes(d.tool)||!TYPES.includes(d.type))return json({error:'Choose a valid tool and feedback type.'},400);
 if(typeof d.message!=='string'||d.message.trim().length<10||d.message.length>4000||typeof d.summary!=='string'||d.summary.trim().length<5||d.summary.length>120)return json({error:'Enter a title (5–120 characters) and feedback (10–4,000 characters).'},400);
 if(d.consent!==true)return json({error:'Please confirm the feedback privacy notice.'},400);
 if(typeof d.name!=='string'||d.name.length>80)return json({error:'Optional Torn name must be no more than 80 characters.'},400);
 // No raw IP, API keys, user agent or administrator token is written to storage.
 const id=crypto.randomUUID(),time=Date.now(),record={id,time,tool:d.tool,type:d.type,summary:clean(d.summary,120),message:clean(d.message,4000),name:clean(d.name,80)};
 if(/(?:https?:\/\/)?api\.torn\.com[^\s]*[?&]key=/i.test(record.message)||/\b(?:api[ _-]?key|authorization|bearer)\s*[:=]\s*\S{12,}/i.test(record.message))return json({error:'Remove API keys or credentials before submitting.'},400);
 const key=PREFIX+String(9999999999999-time)+':'+id;
 await env.FEEDBACK_STORE.put(key,JSON.stringify(record),{expirationTtl:15552000});
 return json({saved:true,id},201);
 }catch(e){return json({error:e.message==='Payload too large'?'Feedback is too large.':e instanceof SyntaxError?'Invalid form data.':'Feedback could not be processed. Please try again shortly.'},e.message==='Payload too large'?413:e instanceof SyntaxError?400:503);}
 }
};
