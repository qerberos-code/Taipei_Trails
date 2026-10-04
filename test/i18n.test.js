import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { messages, translate, localizeTrail, districtNames } from '../i18n.js';
import { TRAILS } from '../trails.js';

test('both catalogs cover the UI and use matching interpolation parameters', async () => {
  assert.deepEqual(Object.keys(messages.en).sort(), Object.keys(messages['zh-Hant']).sort());
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  for (const [, key] of html.matchAll(/(?:data-i18n(?:-aria-label|-placeholder)?|data-prompt-key)="([^"]+)"/g)) {
    assert.ok(messages.en[key], `Missing English UI translation: ${key}`);
  }
  for (const key of Object.keys(messages.en)) {
    const params = value => [...value.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort();
    assert.deepEqual(params(messages.en[key]), params(messages['zh-Hant'][key]), key);
  }
  assert.equal(translate('routeCount', { count: 3 }, 'en'), '3 routes that fit');
  assert.equal(translate('routeCount', { count: 3 }, 'zh-Hant'), '3 條符合條件的路線');
  assert.equal(translate('noMatch', {}, 'unsupported'), messages['zh-Hant'].noMatch);
});

test('all 18 trails have Traditional Chinese copy and English district names without changing route facts', () => {
  for (const trail of TRAILS) {
    const zh = localizeTrail(trail, 'zh-Hant');
    const en = localizeTrail(trail, 'en');
    assert.equal(zh.name, trail.zh);
    assert.equal(en.name, trail.n);
    assert.match(zh.note, /[\u4e00-\u9fff]/);
    assert.match(zh.mrt, /[\u4e00-\u9fff]/);
    assert.ok(districtNames[trail.district]);
    for (const key of ['id', 'lat', 'lng', 'km', 'gain', 'minExperience']) {
      assert.equal(zh[key], trail[key]);
      assert.equal(en[key], trail[key]);
    }
  }
});
