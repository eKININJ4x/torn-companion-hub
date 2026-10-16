/**
 * Torn Companion - isolated, opt-in background market monitor.
 * Deploy separately from the public hub.
 * Requires KV binding WATCH_STATE and secrets TORN_API_KEY, DISCORD_WEBHOOK_URL,
 * ADMIN_TOKEN. Never expose any of those values in public code.
 */
const MAX_ITEMS = 20;
const API = 'https://api.torn.com/v2';
function json(value,status=200){return new Response(JSON.stringify(value),{status,headers:{'content-type':'application/json;charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}})}
function authorized(req,env){
 const expected=env.ADMIN_TOKEN;
 const received=req.headers.get('Authorization')||'';
 // Admin endpoints are not accessible without a configured admin token.
 return !!expected && received.startsWith('Bearer ') && received.slice(7)===expected;
}
function validWatchlist(value){
 if(!Array.isArray(value)||value.length>MAX_ITEMS)throw Error('Expected up to '+MAX_ITEMS+' items.');
 const seen=new Set();
 return value.map(v=>{
  const id=Number(v.id),target=Number(v.target);
  if(!Number.isInteger(id)||id<1||!Number.isSafeInteger(target)||target<=0||seen.has(id))throw Error('Invalid or duplicate item ID / target.');
  seen.add(id);
  return {id,target};
 });
}
async function marketPrice(id,key){
 const response=await fetch(API+'/market/'+id+'/itemmarket?limit=20',{headers:{Authorization:'ApiKey '+key,'Accept':'application/json'}});
 if(!response.ok)throw Error('Torn HTTP '+response.status);
 const d=await response.json();
 if(d.error)throw Error('Torn error '+(d.error.code||'unknown'));
 const raw=Array.isArray(d.itemmarket)?d.itemmarket:Array.isArray(d.itemmarket?.listings)?d.itemmarket.listings:[];
 const values=raw.map(v=>Number(v.price??v.cost)).filter(v=>Number.isFinite(v)&&v>=0);
 return values.length?Math.min(...values):null;
}
function money(v){return '$'+v.toLocaleString('en-US')}
async function sendDiscord(env,id,price,target){
 const destination=new URL(env.DISCORD_WEBHOOK_URL);
 if(!(destination.protocol==='https:'&&['discord.com','discordapp.com'].includes(destination.hostname)&&destination.pathname.startsWith('/api/webhooks/')))throw Error('Invalid Discord webhook host.');
 const content='🔔 **Torn Companion market alert**\nItem #'+id+' has a listing at **'+money(price)+'** (watch price: '+money(target)+').\nOpen Torn to buy manually: https://www.torn.com/page.php?sid=ItemMarket#/market/view=search&itemID='+id;
 const res=await fetch(destination.toString(),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({content,allowed_mentions:{parse:[]}})});
 if(!res.ok)throw Error('Discord HTTP '+res.status);
}
async function tick(env){
 if(!env.WATCH_STATE||!env.TORN_API_KEY||!env.DISCORD_WEBHOOK_URL)return {status:'not-configured'};
 const raw=await env.WATCH_STATE.get('watchlist');
 const watchlist=validWatchlist(raw?JSON.parse(raw):[]);
 let checked=0,sent=0,errors=[];
 for(const {id,target} of watchlist){
  try{
   const price=await marketPrice(id,env.TORN_API_KEY);
   const stateKey='alert:'+id;
   const previous=await env.WATCH_STATE.get(stateKey,{type:'json'});
   // An item above target (or with no listings) resets the suppression state.
   if(price===null||price>target){await env.WATCH_STATE.delete(stateKey)}
   else if(!previous||previous.target!==target){
    // Record a durable suppression marker before sending, to avoid repeat
    // flood on webhook failure. Status can be inspected in KV.
    await env.WATCH_STATE.put(stateKey,JSON.stringify({target,price,at:Date.now()}));
    await sendDiscord(env,id,price,target);
    sent++;
   }
   checked++;
  }catch(e){errors.push({id,error:String(e.message||e).slice(0,160)})}
 }
 return {status:'ok',checked,sent,errors};
}
export default {
 async fetch(request,env){
  const url=new URL(request.url);
  const origin=request.headers.get('Origin');
  const allowed=['https://torn-companion-hub.torn-companion.workers.dev'];
  const cors=origin&&allowed.includes(origin)?{'access-control-allow-origin':origin,'access-control-allow-methods':'GET, PUT, OPTIONS','access-control-allow-headers':'Authorization, Content-Type','vary':'Origin'}:{};
  if(request.method==='OPTIONS'&&url.pathname==='/admin/watchlist')return new Response(null,{status:204,headers:cors});
  const send=(data,status=200)=>{const response=json(data,status);for(const [k,v] of Object.entries(cors))response.headers.set(k,v);return response};
  if(url.pathname==='/health'&&request.method==='GET')return send({service:'tc-market-background',ready:!!(env.WATCH_STATE&&env.TORN_API_KEY&&env.DISCORD_WEBHOOK_URL)});
  if(!authorized(request,env))return send({error:'Unauthorized'},401);
  if(url.pathname==='/admin/watchlist'&&request.method==='GET'){
   const watchlist=await env.WATCH_STATE.get('watchlist');
   return send({watchlist:watchlist?JSON.parse(watchlist):[]});
  }
  if(url.pathname==='/admin/watchlist'&&request.method==='PUT'){
   try{
    const body=await request.text();
    if(body.length>4096)return send({error:'Payload too large'},413);
    const list=validWatchlist(JSON.parse(body));
    await env.WATCH_STATE.put('watchlist',JSON.stringify(list));
    // Reset states when targets change or items are removed.
    const keys=await env.WATCH_STATE.list({prefix:'alert:'});
    for(const k of keys.keys){const id=Number(k.name.slice(6)),v=list.find(x=>x.id===id);const prev=await env.WATCH_STATE.get(k.name,{type:'json'});if(!v||v.target!==prev?.target)await env.WATCH_STATE.delete(k.name)}
    return send({saved:true,count:list.length});
   }catch(e){return send({error:String(e.message||e)},400)}
  }
  return send({error:'Not found'},404);
 },
 async scheduled(event,env,ctx){ctx.waitUntil(tick(env).then(result=>console.log(JSON.stringify(result))).catch(error=>console.error('Market monitoring:',error.message)))}
};
