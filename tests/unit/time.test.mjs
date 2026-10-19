import {test} from 'node:test';
import assert from 'node:assert/strict';
import {businessDay,atShanghai,manualDeadline,autoSubmitCutoff,autoDeadline,isoSql,sqlDate} from '../../backend/time.mjs';
test('business day uses Shanghai even when the process uses UTC',()=>{assert.equal(businessDay(new Date('2026-10-19T15:59:59Z')),'2026-10-19');assert.equal(businessDay(new Date('2026-10-19T16:00:00Z')),'2026-10-20')});
test('22:00 submits only records eligible for the daily cutoff',()=>{assert.equal(autoSubmitCutoff(new Date('2026-10-19T13:59:59Z')),'2026-10-18');assert.equal(autoSubmitCutoff(new Date('2026-10-19T14:00:00Z')),'2026-10-19')});
test('23:30 boundary leaves a review window for late submissions',()=>{assert.equal(manualDeadline(new Date('2026-10-19T15:29:59Z')).toISOString(),'2026-10-19T15:30:00.000Z');assert.equal(manualDeadline(new Date('2026-10-19T15:30:00Z')).toISOString(),'2026-10-20T15:30:00.000Z');assert.equal(manualDeadline(new Date('2026-10-19T15:59:59Z')).toISOString(),'2026-10-20T15:30:00.000Z')});
test('automatic backlog retains original due date after downtime',()=>{assert.equal(autoDeadline('2026-10-18').toISOString(),'2026-10-18T15:30:00.000Z');assert.equal(atShanghai('2026-10-19','22:00').toISOString(),'2026-10-19T14:00:00.000Z')});
test('end-of-year and leap-day deadlines advance correctly',()=>{assert.equal(manualDeadline(new Date('2026-12-31T15:45:00Z')).toISOString(),'2027-01-01T15:30:00.000Z');assert.equal(manualDeadline(new Date('2028-02-28T15:45:00Z')).toISOString(),'2028-02-29T15:30:00.000Z')});
test('MySQL UTC timestamps round trip',()=>{const date=new Date('2026-10-19T14:00:00.123Z');assert.equal(isoSql(date),'2026-10-19 14:00:00.123');assert.equal(sqlDate(isoSql(date)).getTime(),date.getTime())});
