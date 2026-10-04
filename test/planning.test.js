import test from 'node:test';
import assert from 'node:assert/strict';
import { searchTrails, preparationPlan, transportPlan, findTrail } from '../server/planning.js';

test('beginner recommendations exclude intermediate and expert terrain', () => {
  const result = searchTrails({ area: '北投區', experience: 'beginner' });
  assert.deepEqual(result.routes.map(t => t.id), ['junjianyan']);
  assert.ok(searchTrails({ experience: 'beginner' }).routes.every(t => t.minExperience === 'beginner' && t.t !== 'run'));
});

test('distance and time are strict upper bounds and unsupported districts stay empty', () => {
  assert.deepEqual(searchTrails({ area: '北投', maxDistanceKm: 2.9 }).routes, []);
  assert.deepEqual(searchTrails({ area: '北投', maxMinutes: 74 }).routes, []);
  assert.equal(searchTrails({ area: '北投', maxMinutes: 75 }).routes.length, 1);
  assert.deepEqual(searchTrails({ area: '中和' }).routes, []);
  assert.ok(searchTrails({ area: '北投、士林' }).routes.every(t => ['北投區', '士林區'].includes(t.district)));
});

test('experts can find advanced routes but do not automatically walk faster', () => {
  const result = searchTrails({ area: '石碇', experience: 'expert' });
  assert.equal(result.routes[0].id, 'huangdi');
  assert.equal(result.routes[0].estimatedMinutes, 150);
  assert.deepEqual(searchTrails({ area: '石碇', experience: 'intermediate' }).routes, []);
});

test('preparation quantities distinguish per-person and group, with explicit assumptions', () => {
  const result = preparationPlan({ hours: 2.5, people: 3, heat: 'unknown' });
  assert.deepEqual(result.waterLitersPerPerson, [2, 3]);
  assert.deepEqual(result.waterLitersForGroup, [6, 9]);
  assert.equal(result.foodPerPerson.snackPortions, 2);
  assert.equal(result.foodPerPerson.spareSnackPortions, 1);
  assert.equal(result.foodPerPerson.mealPortions, 0);
  assert.equal(result.gearPerPerson.find(item => item.name.startsWith('頭燈')).quantity, 1);
  assert.ok(!result.sharedGearForGroup.some(item => item.name.includes('頭燈')));
  assert.equal(preparationPlan({ hours: 4, heat: 'normal' }).foodPerPerson.mealPortions, 1);
  assert.ok(result.assumptions.some(note => note.includes('不是強制飲用速度')));
  assert.equal(result.sources.length, 2);
});

test('transport uses selected origin and mode without claiming schedules', () => {
  const result = transportPlan(findTrail('elephant'), { lat: 25.0478, lng: 121.517 }, 'transit');
  const url = new URL(result.navigationUrl);
  assert.equal(url.searchParams.get('origin'), '25.0478,121.517');
  assert.equal(url.searchParams.get('destination'), '25.0275,121.5707');
  assert.equal(url.searchParams.get('travelmode'), 'transit');
  assert.ok(result.note.includes('未查詢即時班次'));
  assert.equal(transportPlan(findTrail('junjianyan'), null).accessNoteZh, '石牌／唭哩岸');
});
