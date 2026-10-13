// Add as a NEW file. Existing doGet/PIN/photo/backup functions remain untouched.
// Bind ONLY to a separate demonstration spreadsheet. Never copy production data here.
// Script Properties: OPERAOS_TOKEN (random secret), OPERAOS_TEST_RESOURCE=true,
// OPERAOS_SHEET_ID (spreadsheet ID), OPERAOS_TAB (default Attendance).
function doPost(e) {
  var lock=LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    var p=PropertiesService.getScriptProperties(),b=JSON.parse(e.postData.contents),organisation=p.getProperty('OPERAOS_ORGANISATION')||'mtg';
    if(!p.getProperty('OPERAOS_TOKEN')||b.token!==p.getProperty('OPERAOS_TOKEN'))throw new Error('Unauthorised');
    if(b.sheetId!==p.getProperty('OPERAOS_SHEET_ID'))throw new Error('Spreadsheet mismatch');
    if(p.getProperty('OPERAOS_TEST_RESOURCE')!=='true'||b.organisation!==organisation||b.protocol!=='operaos-v1')throw new Error('Not a test resource');
    var sheet=SpreadsheetApp.openById(p.getProperty('OPERAOS_SHEET_ID')).getSheetByName(p.getProperty('OPERAOS_TAB')||'Attendance');
    if(!sheet)throw new Error('Attendance tab missing');
    var fields=['id','organisation','employeeId','employeeName','checkIn','checkOut','hours','demo','breakMinutes','dailyHours','status'];
    var mapping=b.mapping||{},headers=sheet.getRange(1,1,1,Math.max(sheet.getLastColumn(),1)).getValues()[0].map(String);
    fields.forEach(function(k){if(!mapping[k]||headers.indexOf(mapping[k])<0)throw new Error('Missing mapped column: '+k)});
    if(new Set(fields.map(function(k){return mapping[k]})).size!==fields.length)throw new Error('Duplicate mapping');
    function read(){if(sheet.getLastRow()<2)return [];return sheet.getRange(2,1,sheet.getLastRow()-1,headers.length).getValues().map(function(row){var r={};fields.forEach(function(k){var v=row[headers.indexOf(mapping[k])];r[k]=v instanceof Date?v.toISOString():v});r.demo=r.demo===true||r.demo==='true';r.hours=Number(r.hours);r.breakMinutes=Number(r.breakMinutes);r.dailyHours=Number(r.dailyHours);return r}).filter(function(r){return r.id&&r.organisation===organisation&&r.demo===true})}
    if(b.operation==='test')return reply({ok:true,protocol:'operaos-v1',organisation:organisation,testResource:true});
    if(b.operation==='list')return reply({ok:true,organisation:organisation,testResource:true,records:read()});
    if(b.operation!=='upsert')throw new Error('Unknown operation');
    var r=b.record;if(!r||r.organisation!==organisation||r.demo!==true||!/^DEMO-/.test(r.employeeId)||!r.id||!isFinite(Number(r.hours)))throw new Error('Invalid demonstration record');
    var existing=read(),match=existing.find(function(x){return x.id===r.id});
    if(!match&&!r.checkOut&&existing.some(function(x){return x.employeeId===r.employeeId&&!x.checkOut}))throw new Error('Duplicate open shift');
    var rowIndex=sheet.getLastRow()+1;
    if(match){var ids=sheet.getRange(2,headers.indexOf(mapping.id)+1,sheet.getLastRow()-1,1).getValues();for(var i=0;i<ids.length;i++)if(String(ids[i][0])===r.id){rowIndex=i+2;break}}
    var values=rowIndex<=sheet.getLastRow()?sheet.getRange(rowIndex,1,1,headers.length).getValues()[0]:headers.map(function(){return ''});
    fields.forEach(function(k){var v=r[k]===undefined?'':r[k];if(typeof v==='string'&&/^[=+@-]/.test(v))v="'"+v;values[headers.indexOf(mapping[k])]=v});
    sheet.getRange(rowIndex,1,1,headers.length).setValues([values]);SpreadsheetApp.flush();
    return reply({ok:true,organisation:organisation,testResource:true,id:r.id});
  } catch(err){return reply({ok:false,error:String(err.message)})} finally {if(lock.hasLock())lock.releaseLock()}
}
function reply(data){data.spreadsheetId=PropertiesService.getScriptProperties().getProperty('OPERAOS_SHEET_ID');return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON)}
