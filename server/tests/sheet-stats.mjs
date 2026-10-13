import assert from 'node:assert/strict';
import {sheetStats} from '../sheet-stats.mjs';
let result=sheetStats([['ID','Hours','Stock','Status'],['A',2.5,4,'Approved'],['A',1,2,'Pending'],['B','bad',0,'Approved'],['',99,99,'Approved'],[]],{recordId:'ID',employeeId:'ID',hours:'Hours',quantity:'Stock',status:'Status'});
assert.deepEqual(result,{records:3,employees:2,completedShifts:2,hours:3.5,quantity:6,invalidNumericValues:1,statuses:{Approved:2,Pending:1}});
assert.throws(()=>sheetStats([['ID'],['A']],{hours:'Missing'}));
assert.throws(()=>sheetStats([['ID','ID']],{recordId:'ID'}));
assert.equal(sheetStats([['Heading'],['Device','Qty'],['Demo device',3]],{recordId:'Device',quantity:'Qty'},2).quantity,3);
console.log('Mapped source statistics tests passed.');
