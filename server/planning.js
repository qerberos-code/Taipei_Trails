import { TRAILS } from '../trails.js';
import trailTranslations from '../locales/trails-zh-Hant.js';

export const LEVELS = ['beginner', 'intermediate', 'expert'];
export const DATA_NOTE = '內建示範資料；距離、爬升、登山口座標及能力分級尚未逐條官方核對，未接入即時路況。';
export const SOURCES = [
  { title: 'NPS Hiking Safety：飲水與行前準備', url: 'https://www.nps.gov/grsm/planyourvisit/hikingsafety.htm' },
  { title: 'NPS Ten Essentials：裝備與備用糧食', url: 'https://www.nps.gov/articles/10essentials.htm' },
];

export function findTrail(id) {
  return TRAILS.find(trail => trail.id === id) ?? null;
}

export function trailDetails(trail, experience = 'beginner') {
  const factor = experience === 'beginner' ? 1.25 : 1;
  return {
    ...trail,
    mrtZh: trailTranslations[trail.id]?.mrt ?? trail.mrt,
    noteZh: trailTranslations[trail.id]?.note ?? trail.note,
    estimatedMinutes: Math.ceil((trail.km * 15 + trail.gain / 10) * factor),
    estimateNote: '依距離與爬升粗估，未含休息；經驗分級不代表個人體能，專家亦不自動縮短時間。',
    dataNote: DATA_NOTE,
  };
}

function normalizeArea(value) {
  return value.replaceAll('臺', '台').replace(/[市區縣\s]/g, '').toLowerCase();
}

export function searchTrails({ area = null, experience = 'beginner', maxDistanceKm = null, maxMinutes = null }) {
  const level = LEVELS.indexOf(experience ?? 'beginner');
  const regions = area ? area.split(/[、,，\/]|或|與|以及/).map(normalizeArea).filter(Boolean) : [];
  const routes = TRAILS
    .filter(t => t.t !== 'run')
    .filter(t => LEVELS.indexOf(t.minExperience) <= level)
    .filter(t => !regions.length || regions.some(region =>
      region === '大台北' || normalizeArea(t.city).includes(region) || normalizeArea(t.district).includes(region)))
    .map(t => trailDetails(t, experience ?? 'beginner'))
    .filter(t => maxDistanceKm === null || t.km <= maxDistanceKm)
    .filter(t => maxMinutes === null || t.estimatedMinutes <= maxMinutes)
    .sort((a, b) => a.estimatedMinutes - b.estimatedMinutes)
    .slice(0, 6);
  return { routes, filters: { area, experience: experience ?? 'beginner', maxDistanceKm, maxMinutes }, dataNote: DATA_NOTE };
}

export function preparationPlan({ hours, people = 1, heat = 'unknown' }) {
  const roundUp = value => Math.ceil(value * 2) / 2;
  const waterLow = roundUp(hours * 0.5 + 0.5);
  const waterHigh = roundUp(hours * (heat === 'normal' ? 0.5 : 1) + 0.5);
  const snacks = Math.max(1, Math.ceil(hours / 2));
  return {
    hours, people, heat,
    waterLitersPerPerson: [waterLow, waterHigh],
    waterLitersForGroup: [roundUp(waterLow * people), roundUp(waterHigh * people)],
    foodPerPerson: { snackPortions: snacks, spareSnackPortions: 1, mealPortions: hours >= 4 ? 1 : 0 },
    gearPerPerson: [
      { name: '防滑鞋', quantity: 1, unit: '雙' },
      { name: '雨衣', quantity: 1, unit: '件' },
      { name: '保暖層（依海拔與溫度調整）', quantity: 1, unit: '件' },
      { name: '帽子', quantity: 1, unit: '頂' },
      { name: '防曬用品', quantity: 1, unit: '份' },
      { name: '手機與離線地圖', quantity: 1, unit: '組' },
      { name: '頭燈與備用電力', quantity: 1, unit: '組' },
      { name: '哨子', quantity: 1, unit: '個' },
      { name: '緊急保暖毯', quantity: 1, unit: '張' },
    ],
    sharedGearForGroup: [
      { name: '行動電源（確認容量足以補充全組手機）', quantity: 1, unit: '個' },
      { name: '簡易急救包（每人另帶個人所需藥物）', quantity: 1, unit: '組' },
      { name: '垃圾袋', quantity: 1, unit: '個' },
    ],
    assumptions: [
      '每人份量；以當日往返健行、不確定沿途能補水為前提。',
      'gearPerPerson 為每人裝備，團體總量須乘以人數；sharedGearForGroup 才可共用。',
      '0.5 公升／小時作為一般規劃起點，炎熱或天氣未知時提供較寬的 0.5～1 公升範圍；另加 0.5 公升備用水並進位。這是攜帶量粗估，不是強制飲用速度。',
      '點心每約兩小時 1 份、另備 1 份，以及四小時以上 1 份餐食，為本專案的打包估算，非官方營養標準；依食量、休息和回程時間調整。',
      '沒有即時天氣、補水點或商店資料；不得保證沿途有水或食物可買。',
    ],
    sources: SOURCES,
  };
}

export function transportPlan(trail, origin, mode = 'transit') {
  const params = new URLSearchParams({ api: '1', destination: `${trail.lat},${trail.lng}`, travelmode: mode });
  if (origin) params.set('origin', `${origin.lat},${origin.lng}`);
  return {
    trailName: trail.zh,
    accessNote: trail.mrt,
    accessNoteZh: trailTranslations[trail.id]?.mrt ?? trail.mrt,
    navigationUrl: `https://www.google.com/maps/dir/?${params}`,
    note: '附近捷運／轉乘資訊來自示範資料；未查詢即時班次、車資、停車位或道路管制，請開啟導航確認。',
  };
}
