import { I18N, TRAILS } from './data';

export function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const r = (x) => (x * Math.PI) / 180;
  const dLat = r(lat2 - lat1);
  const dLng = r(lng2 - lng1);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Straight-line distance x1.35 for roads, ~22 km/h door to door by MRT or taxi, plus 8 min overhead.
export const travelMin = (km) => Math.round(8 + ((km * 1.35) / 22) * 60);

export function fmt(m, lang) {
  const l = I18N[lang];
  m = Math.round(m);
  if (lang === 'zh') {
    if (m < 60) return m + l.min;
    const h = Math.floor(m / 60), r = m % 60;
    return h + l.h + (r ? ' ' + r + l.min : '');
  }
  if (m < 60) return m + ' min';
  const h = Math.floor(m / 60), r = m % 60;
  return h + 'h' + (r ? ' ' + String(r).padStart(2, '0') : '');
}

const trim = (x) => x.toFixed(1).replace(/\.0$/, '');
const canRun = (t) => t.t === 'run' || t.t === 'both';
const canHike = (t) => t.t === 'hike' || t.t === 'both';

function plan(t, mode, s) {
  const l = I18N[s.lang];
  const D = +s.dist, T = +s.time;
  const perKm = mode === 'run' ? +s.pace : 15 * +s.hike;
  let km = t.km, how;
  if (t.flex) {
    if (D) { if (D > t.flex) return null; km = D; }
    else if (T) km = Math.min(t.flex, Math.max(2, Math.floor((T / perKm) * 2) / 2));
    how = t.km < 3 ? l.laps(trim(km / t.km), t.km) : l.outback(trim(km / 2));
  } else {
    if (D && (km < D * 0.55 || km > D * 1.6)) return null;
    how = l.full;
  }
  const mins = t.flex
    ? km * perKm
    : mode === 'run'
      ? km * +s.pace + (t.gain / 100) * 6
      : (km * 15 + (t.gain / 100) * 10) * +s.hike;
  if (T && mins > T * 1.1) return null;
  let fit = 0;
  if (D) fit += Math.abs(km - D) / D;
  if (T) fit += Math.max(0, (T - mins) / T) * 0.5;
  return { km, mins, how, fit };
}

export function recommend(s) {
  const o = s.origin, maxT = +s.travel, res = [];
  for (const t of TRAILS) {
    const modes = [];
    if ((s.act === 'run' || s.act === 'any') && canRun(t)) modes.push('run');
    if ((s.act === 'hike' || s.act === 'any') && canHike(t)) modes.push('hike');
    const d = haversine(o.lat, o.lng, t.lat, t.lng);
    const tr = travelMin(d);
    if (maxT && tr > maxT) continue;
    let best = null;
    for (const m of modes) {
      const p = plan(t, m, s);
      if (p && (!best || p.fit < best.fit)) best = { ...p, mode: m };
    }
    if (best) res.push({ t, d, tr, ...best });
  }
  res.sort((a, b) => a.tr + a.fit * 25 - (b.tr + b.fit * 25));
  return res.slice(0, 8);
}
