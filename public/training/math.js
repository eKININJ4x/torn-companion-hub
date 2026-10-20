(function(root){
'use strict';
const valid=n=>Number.isFinite(n)&&n>0;
function energy(price,energy,hours,days){return {cost:valid(price)&&valid(energy)?price/energy:null,daily:24/hours*energy,monthly:24/hours*energy*days,dailyCost:valid(price)?24/hours*price:null,monthlyCost:valid(price)?24/hours*price*days:null};}
function comparison(price,energy,sePrice,gain,refillEnergy,stat){if(![price,energy,sePrice,gain,refillEnergy,stat].every(valid))return null;const gym=energy/refillEnergy*gain,equivalent=sePrice/price*gym;return {items:sePrice/price,equivalent,costPerStat:price/gym,tipping:equivalent*100,seCostPerStat:sePrice/(stat*.01)};}
function goal(stat,target,price,hours){if(![stat,target,price,hours].every(valid))return null;let current=stat,count=0;while(current<target&&count<100000){current+=Math.min(current*.01,5e12);count++;}if(current<target)return null;return {count,cost:count*price,days:count*hours/24,final:current};}
function selling(price,energy,attackPrice,attackEnergy,gain,refillEnergy,stat,sePrice){if(![energy,attackPrice,attackEnergy,gain,refillEnergy,stat,sePrice].every(valid)||!Number.isFinite(price)||price<0)return null;const profit=energy/attackEnergy*attackPrice-price,gym=energy/refillEnergy*gain;return {profit,gym,funded:profit/sePrice,seGain:profit/sePrice*stat*.01,tipping:profit>0?gym*sePrice/(profit*.01):null};}
const api={energy,comparison,goal,selling};if(typeof module!=='undefined')module.exports=api;else root.TrainingMath=api;
})(typeof window==='undefined'?globalThis:window);
