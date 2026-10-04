import en from './locales/en.js';
import zhHant from './locales/zh-Hant.js';
import trailsZhHant from './locales/trails-zh-Hant.js';

export const messages = { 'zh-Hant': zhHant, en };
export const DEFAULT_LOCALE = 'zh-Hant';
const STORAGE_KEY = 'ttf-locale';
let locale = DEFAULT_LOCALE;
const listeners = new Set();

export function translate(key, params = {}, language = locale) {
  const template = messages[language]?.[key] ?? messages[DEFAULT_LOCALE][key] ?? key;
  return template.replace(/\{(\w+)\}/g, (match, name) => String(params[name] ?? match));
}
export const t = (key, params) => translate(key, params);
export const getLocale = () => locale;
export function onLocaleChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export function applyTranslations(root = document) {
  root.querySelectorAll('[data-i18n]').forEach(element => {
    element.textContent = t(element.dataset.i18n);
  });
  for (const attribute of ['aria-label', 'placeholder']) {
    root.querySelectorAll(`[data-i18n-${attribute}]`).forEach(element => {
      element.setAttribute(attribute, t(element.getAttribute(`data-i18n-${attribute}`)));
    });
  }
  root.querySelectorAll('[data-prompt-key]').forEach(element => {
    element.dataset.prompt = t(element.dataset.promptKey);
  });
}
export function setLocale(value) {
  if (!Object.hasOwn(messages, value)) return;
  locale = value;
  try { localStorage.setItem(STORAGE_KEY, locale); } catch { /* Preferences still work without storage. */ }
  document.documentElement.lang = locale;
  document.title = t('title');
  applyTranslations();
  const select = document.getElementById('language');
  if (select) select.value = locale;
  listeners.forEach(listener => listener(locale));
}
export function initI18n() {
  let saved;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch { /* Use the default. */ }
  setLocale(Object.hasOwn(messages, saved) ? saved : DEFAULT_LOCALE);
  document.getElementById('language')?.addEventListener('change', event => setLocale(event.target.value));
}
export function formatDuration(value) {
  const minutes = Math.round(value);
  if (minutes < 60) return t('durationMinutes', { minutes });
  const hours = Math.floor(minutes / 60), remainder = minutes % 60;
  return remainder ? t('durationMixed', { hours, minutes: remainder }) : t('durationHours', { hours });
}
export function localizeTrail(trail, language = locale) {
  return language === 'en' ? { ...trail, name: trail.n } : { ...trail, ...trailsZhHant[trail.id], name: trail.zh };
}
export const districtNames = {
  '大安區': 'Da’an District', '信義區': 'Xinyi District', '中山區': 'Zhongshan District',
  '松山區': 'Songshan District', '大同區': 'Datong District', '士林區': 'Shilin District',
  '內湖區': 'Neihu District', '北投區': 'Beitou District', '文山區': 'Wenshan District',
  '新店區': 'Xindian District', '石碇區': 'Shiding District',
};
export const localizeDistrict = district => locale === 'en' ? districtNames[district] ?? district : district;
export const stationNames = {
  'Taipei Main Station': '台北車站', Ximen: '西門', Zhongshan: '中山', Shuanglian: '雙連',
  'Minquan W. Rd': '民權西路', Yuanshan: '圓山', Dongmen: '東門', Daan: '大安',
  'Zhongxiao Fuxing': '忠孝復興', 'Zhongxiao Dunhua': '忠孝敦化', 'Nanjing Fuxing': '南京復興',
  'Songjiang Nanjing': '松江南京', 'Xinyi Anhe': '信義安和',
  'Taipei 101 / World Trade Center': '台北 101／世貿', 'City Hall': '市政府',
  'Songshan Airport': '松山機場', Neihu: '內湖', Nangang: '南港', Gongguan: '公館',
  Beitou: '北投', Tamsui: '淡水', Banqiao: '板橋',
};
export const localizeStation = name => locale === 'en' ? name : stationNames[name] ?? name;
function stationOrigin(name) {
  if (locale === 'zh-Hant' && name === 'Taipei Main Station') return localizeStation(name);
  return t('stationOrigin', { name: localizeStation(name) });
}
export function localizeOrigin(origin) {
  if (origin.kind === 'station') return stationOrigin(origin.stationName);
  if (origin.kind === 'example' || origin.name === 'Taipei 101 / World Trade Center (example)') return t('exampleOrigin');
  if (origin.kind === 'pinned' || origin.name === 'Pinned location') return t('pinnedOrigin');
  if (origin.kind === 'approximate') return t('approximateOrigin', { name: origin.name });
  // Keep station preferences saved before i18n usable in either language.
  const station = Object.keys(stationNames).find(name => origin.name === `${name} MRT`);
  return station ? stationOrigin(station) : origin.name;
}
