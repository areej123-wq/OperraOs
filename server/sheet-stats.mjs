// Aggregate only mapped columns. Raw personal sheet rows are never persisted here.
export function sheetStats(values,mapping={},headerRow=1){
 if(!Array.isArray(values)||values.some(r=>!Array.isArray(r)))throw Error('Invalid sheet rows');
 const headers=(values[headerRow-1]||[]).map(x=>String(x).trim());
 const index={};for(const [key,label] of Object.entries(mapping)){if(!label)continue;let positions=headers.flatMap((h,i)=>h===label?[i]:[]);if(positions.length!==1)throw Error('Mapped header must exist exactly once: '+label);index[key]=positions[0]}
 const num=x=>{if(x===null||x===undefined||String(x).trim()==='')return null;let n=Number(String(x).replace(/,/g,''));return Number.isFinite(n)&&n>=0?n:null};
 let stats={records:0,employees:0,completedShifts:0,hours:0,quantity:0,invalidNumericValues:0,statuses:{}};const employees=new Set();
 for(const row of values.slice(headerRow)){if(!row.some(x=>x!==null&&x!==undefined&&String(x).trim()!==''))continue;if(index.recordId!==undefined&&!String(row[index.recordId]||'').trim())continue;stats.records++;if(index.employeeId!==undefined&&String(row[index.employeeId]||'').trim())employees.add(String(row[index.employeeId]).trim());for(const k of ['hours','quantity'])if(index[k]!==undefined){let n=num(row[index[k]]);if(n===null){if(String(row[index[k]]??'').trim())stats.invalidNumericValues++}else{stats[k]+=n;if(k==='hours'&&n>0)stats.completedShifts++}}if(index.status!==undefined){let s=String(row[index.status]||'Unspecified').trim();stats.statuses[s]=(stats.statuses[s]||0)+1}}
 stats.employees=employees.size;stats.hours=Number(stats.hours.toFixed(4));return stats;
}
