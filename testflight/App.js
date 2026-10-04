import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator, FlatList, Linking, Modal, Pressable, ScrollView,
  StyleSheet, Text, TextInput, View, useColorScheme,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18N, STATIONS } from './src/data';
import { fmt, recommend } from './src/logic';

const LIGHT = { bg: '#eef2ee', surface: '#ffffff', ink: '#18241f', muted: '#5b6b64', line: '#d3ddd7', accent: '#1f6b4e', accentInk: '#ffffff', accentSoft: '#dcebe3', travel: '#c25a12', travelSoft: '#fbe9dc', warn: '#9a6b00' };
const DARK = { bg: '#101714', surface: '#17211d', ink: '#e4ece7', muted: '#97a8a0', line: '#2a3832', accent: '#5cc49a', accentInk: '#0c1612', accentSoft: '#1d3a2e', travel: '#f29a5c', travelSoft: '#3a2516', warn: '#e2b54a' };

const DEFAULTS = { lang: 'en', act: 'any', dist: '5', time: '60', travel: '30', pace: '6', hike: '1', origin: { st: 13, lat: 25.033, lng: 121.5637 } };
const STORE_KEY = 'ttf-app-v1';

export default function App() {
  return (
    <SafeAreaProvider>
      <Main />
    </SafeAreaProvider>
  );
}

function Main() {
  const dark = useColorScheme() === 'dark';
  const c = dark ? DARK : LIGHT;
  const st = useMemo(() => makeStyles(c), [dark]);
  const [s, setS] = useState(DEFAULTS);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(null); // 'gps' | 'hotel' | null
  const [msg, setMsg] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const l = I18N[s.lang];
  const zh = s.lang === 'zh';

  useEffect(() => {
    AsyncStorage.getItem(STORE_KEY)
      .then((v) => { if (v) setS({ ...DEFAULTS, ...JSON.parse(v) }); })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);
  useEffect(() => { if (loaded) AsyncStorage.setItem(STORE_KEY, JSON.stringify(s)).catch(() => {}); }, [s, loaded]);

  const set = (patch) => setS((prev) => ({ ...prev, ...patch }));
  const results = useMemo(() => recommend(s), [s]);

  const originName = () => {
    const o = s.origin;
    if (o.st != null && STATIONS[o.st]) return STATIONS[o.st][zh ? 1 : 0] + l.mrtSuffix;
    if (o.gps) return l.myLoc;
    if (o.custom) return o.custom + l.approx;
    return l.pinned;
  };

  async function ensurePermission() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  }

  async function useGps() {
    setMsg(''); setBusy('gps');
    try {
      if (!(await ensurePermission())) { setMsg(l.gpsDenied); return; }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      set({ origin: { gps: true, lat: pos.coords.latitude, lng: pos.coords.longitude } });
    } catch { setMsg(l.gpsFail); }
    finally { setBusy(null); }
  }

  async function setHotel() {
    const q = query.trim();
    if (!q) return;
    setMsg('');
    const m = q.match(/@?(-?\d{1,2}\.\d{3,})\s*,\s*(-?\d{2,3}\.\d{3,})/);
    if (m) { set({ origin: { lat: +m[1], lng: +m[2] } }); setQuery(''); return; }
    setBusy('hotel');
    try {
      await ensurePermission(); // Android needs it for geocoding; harmless on iOS
      const hits = await Location.geocodeAsync(/taipei|台北|臺北|新北/i.test(q) ? q : `${q}, Taipei, Taiwan`);
      const h = hits.find((x) => x.latitude > 24.6 && x.latitude < 25.4 && x.longitude > 121.2 && x.longitude < 122.1);
      if (h) { set({ origin: { custom: q, lat: h.latitude, lng: h.longitude } }); setQuery(''); }
      else setMsg(l.notFound);
    } catch { setMsg(l.fail); }
    finally { setBusy(null); }
  }

  const openNav = (t) => {
    const o = s.origin;
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&origin=${o.lat},${o.lng}&destination=${t.lat},${t.lng}&travelmode=transit`);
  };
  const openInfo = (t) => {
    Linking.openURL(`https://www.google.com/search?q=${encodeURIComponent(zh ? t.zh + ' 步道' : `${t.zh} ${t.n} trail`)}`);
  };

  const parts = [];
  if (+s.dist) parts.push(s.dist + ' km');
  if (+s.time) parts.push(zh ? `${l.onTrail} ${fmt(+s.time, s.lang)}` : `${fmt(+s.time, s.lang)} ${l.onTrail}`);
  if (+s.travel) parts.push(l.away(s.travel));

  return (
    <SafeAreaView style={st.safe} edges={['top', 'left', 'right']}>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <ScrollView contentContainerStyle={st.wrap} keyboardShouldPersistTaps="handled">
        <View style={st.hrow}>
          <Text style={st.h1}>{l.title}</Text>
          <View style={st.lang}>
            {[['en', 'EN'], ['zh', '中文']].map(([k, label]) => (
              <Pressable key={k} onPress={() => set({ lang: k })} style={[st.langBtn, s.lang === k && st.langOn]} accessibilityRole="button" accessibilityState={{ selected: s.lang === k }}>
                <Text style={[st.langTxt, s.lang === k && st.langTxtOn]}>{label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <Text style={st.intro}>{l.intro}</Text>

        <View style={st.panel}>
          <Text style={st.lbl}>{l.where}</Text>
          <View style={st.here}>
            <View style={st.dot} />
            <Text style={st.hereTxt} numberOfLines={2}>{l.from}<Text style={{ fontWeight: '700' }}>{originName()}</Text></Text>
          </View>
          <View style={st.row}>
            <Pressable style={[st.btn, { flex: 1 }]} onPress={useGps} disabled={!!busy}>
              {busy === 'gps' ? <ActivityIndicator color={c.accentInk} /> : <Text style={st.btnTxt}>{l.gps}</Text>}
            </Pressable>
            <Pressable style={[st.btn, st.ghost, { flex: 1 }]} onPress={() => setPickerOpen(true)}>
              <Text style={[st.btnTxt, { color: c.accent }]}>{l.pickStation}</Text>
            </Pressable>
          </View>
          <View style={st.row}>
            <TextInput
              style={st.input} value={query} onChangeText={setQuery} onSubmitEditing={setHotel}
              placeholder={l.hotelPh2} placeholderTextColor={c.muted} returnKeyType="search" autoCorrect={false}
            />
            <Pressable style={st.btn} onPress={setHotel} disabled={!!busy}>
              {busy === 'hotel' ? <ActivityIndicator color={c.accentInk} /> : <Text style={st.btnTxt}>{l.set}</Text>}
            </Pressable>
          </View>
          {!!msg && <Text style={st.msg}>{msg}</Text>}

          <Chips st={st} label={l.activity} value={s.act} onChange={(v) => set({ act: v })}
            options={[['run', l.run], ['hike', l.hike], ['any', l.either]]} />
          <Chips st={st} label={l.distance} value={s.dist} onChange={(v) => set({ dist: v })}
            options={[['3', '3 km'], ['5', '5 km'], ['10', '10 km'], ['0', l.any]]} />
          <Chips st={st} label={l.timeOn} value={s.time} onChange={(v) => set({ time: v })}
            options={[['30', l.t30], ['60', l.t60], ['120', l.t120], ['240', l.t240], ['0', l.any]]} />
          <Chips st={st} label={l.maxTravel} value={s.travel} onChange={(v) => set({ travel: v })}
            options={[['15', l.m15], ['30', l.t30], ['60', l.t60], ['0', l.any]]} />
          <Chips st={st} label={l.pace} value={s.pace} onChange={(v) => set({ pace: v })}
            options={[['5', '5:00'], ['5.5', '5:30'], ['6', '6:00'], ['6.5', '6:30'], ['7', '7:00'], ['8', '8:00']]} />
          <Chips st={st} label={l.hikeStyle} value={s.hike} onChange={(v) => set({ hike: v })}
            options={[['1.25', l.relaxed], ['1', l.steady], ['0.8', l.fast]]} />
        </View>

        <View style={st.summary}>
          <Text style={st.h2}>{results.length ? l.fit(results.length) : l.nomatch}</Text>
          <Text style={st.sub}>{parts.join(' · ')}</Text>
        </View>

        {!results.length && <View style={st.empty}><Text style={st.emptyTxt}>{l.empty}</Text></View>}

        {results.map((r, i) => {
          const t = r.t;
          return (
            <View key={t.n} style={[st.card, i === 0 && st.cardTop]}>
              <View style={st.ctop}>
                <Text style={st.h3}>
                  {zh ? t.zh : t.n}<Text style={st.alt}>  {zh ? t.n : t.zh}</Text>
                </Text>
                <View style={st.badge}><Text style={st.badgeTxt}>{i === 0 ? l.top : ''}{r.mode === 'run' ? l.run : l.hike}</Text></View>
              </View>
              <View style={st.stats}>
                <Stat st={st} label={l.sDist} value={`${r.km.toFixed(1)} km`} />
                <Stat st={st} label={l.sClimb} value={`${t.flex ? 0 : t.gain} m`} />
                <Stat st={st} label={l.sOn} value={fmt(r.mins, s.lang)} />
                <Stat st={st} label={l.sTravel} value={fmt(r.tr, s.lang)} travel />
              </View>
              <Text style={st.plan}>{l.planTxt(r.how, zh ? t.mrtZh : t.mrt, fmt(r.mins + r.tr * 2, s.lang))}</Text>
              <Text style={st.note}>{zh ? t.noteZh : t.note}</Text>
              <View style={st.row}>
                <Pressable style={st.btn} onPress={() => openNav(t)}><Text style={st.btnTxt}>{l.nav}</Text></Pressable>
                <Pressable style={[st.btn, st.ghost]} onPress={() => openInfo(t)}><Text style={[st.btnTxt, { color: c.accent }]}>{l.info}</Text></Pressable>
              </View>
            </View>
          );
        })}

        <Text style={st.footer}>{l.footer}</Text>
      </ScrollView>

      <Modal visible={pickerOpen} animationType="slide" transparent onRequestClose={() => setPickerOpen(false)}>
        <View style={st.modalBg}>
          <View style={st.sheet}>
            <View style={st.sheetHead}>
              <Text style={st.h2}>{l.pickStation}</Text>
              <Pressable onPress={() => setPickerOpen(false)}><Text style={{ color: c.accent, fontWeight: '600' }}>{l.close}</Text></Pressable>
            </View>
            <FlatList
              data={STATIONS}
              keyExtractor={(x) => x[0]}
              renderItem={({ item, index }) => (
                <Pressable style={st.stItem} onPress={() => { set({ origin: { st: index, lat: item[2], lng: item[3] } }); setMsg(''); setPickerOpen(false); }}>
                  <Text style={st.stName}>{item[zh ? 1 : 0]}</Text>
                  <Text style={st.stAlt}>{item[zh ? 0 : 1]}</Text>
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Chips({ st, label, value, onChange, options }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={st.lbl}>{label}</Text>
      <View style={st.chips}>
        {options.map(([v, text]) => {
          const on = v === value;
          return (
            <Pressable key={v} onPress={() => onChange(v)} style={[st.chip, on && st.chipOn]} accessibilityRole="button" accessibilityState={{ selected: on }}>
              <Text style={[st.chipTxt, on && st.chipTxtOn]}>{text}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function Stat({ st, label, value, travel }) {
  return (
    <View style={st.stat}>
      <Text style={st.statLbl}>{label}</Text>
      <Text style={[st.statVal, travel && st.statTravel]}>{value}</Text>
    </View>
  );
}

function makeStyles(c) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    wrap: { padding: 16, paddingBottom: 48, gap: 14 },
    hrow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
    h1: { flex: 1, fontSize: 30, fontWeight: '800', color: c.ink, letterSpacing: -0.3 },
    intro: { color: c.muted, fontSize: 15, lineHeight: 21 },
    lang: { flexDirection: 'row', borderWidth: 1, borderColor: c.line, borderRadius: 999, padding: 2, backgroundColor: c.surface },
    langBtn: { paddingVertical: 6, paddingHorizontal: 11, borderRadius: 999 },
    langOn: { backgroundColor: c.accent },
    langTxt: { fontSize: 13, fontWeight: '600', color: c.muted },
    langTxtOn: { color: c.accentInk },
    panel: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: 14, padding: 16, gap: 14 },
    lbl: { fontSize: 12, fontWeight: '600', letterSpacing: 0.7, textTransform: 'uppercase', color: c.muted },
    here: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 10, backgroundColor: c.travelSoft },
    dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: c.travel },
    hereTxt: { flex: 1, color: c.ink, fontSize: 14 },
    row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    input: { flex: 1, minWidth: 0, fontSize: 15, paddingVertical: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: c.line, borderRadius: 10, backgroundColor: c.bg, color: c.ink },
    btn: { backgroundColor: c.accent, borderWidth: 1, borderColor: c.accent, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
    ghost: { backgroundColor: 'transparent' },
    btnTxt: { color: c.accentInk, fontWeight: '600', fontSize: 14 },
    msg: { color: c.warn, fontSize: 13 },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    chip: { borderWidth: 1, borderColor: c.line, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 12 },
    chipOn: { backgroundColor: c.accent, borderColor: c.accent },
    chipTxt: { color: c.ink, fontSize: 14, fontWeight: '500' },
    chipTxtOn: { color: c.accentInk },
    summary: { gap: 2, marginTop: 4 },
    h2: { fontSize: 20, fontWeight: '700', color: c.ink },
    sub: { color: c.muted, fontSize: 13 },
    empty: { padding: 20, borderWidth: 1, borderStyle: 'dashed', borderColor: c.line, borderRadius: 14, backgroundColor: c.surface },
    emptyTxt: { color: c.muted, textAlign: 'center' },
    card: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: 14, padding: 14, gap: 10 },
    cardTop: { borderColor: c.accent, borderWidth: 2 },
    ctop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
    h3: { flex: 1, fontSize: 18, fontWeight: '700', color: c.ink },
    alt: { fontSize: 14, fontWeight: '400', color: c.muted },
    badge: { backgroundColor: c.accentSoft, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 9 },
    badgeTxt: { color: c.accent, fontSize: 12, fontWeight: '600' },
    stats: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 8 },
    stat: { width: '50%', gap: 1 },
    statLbl: { fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: c.muted },
    statVal: { fontSize: 17, fontWeight: '600', color: c.ink, fontVariant: ['tabular-nums'] },
    statTravel: { color: c.travel },
    plan: { color: c.ink, fontSize: 14, lineHeight: 20 },
    note: { color: c.muted, fontSize: 14, lineHeight: 20 },
    footer: { color: c.muted, fontSize: 12, lineHeight: 17, marginTop: 6 },
    modalBg: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' },
    sheet: { maxHeight: '75%', backgroundColor: c.surface, borderTopLeftRadius: 18, borderTopRightRadius: 18, paddingTop: 16, paddingBottom: 32 },
    sheetHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 10 },
    stItem: { paddingVertical: 13, paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: c.line, flexDirection: 'row', justifyContent: 'space-between' },
    stName: { color: c.ink, fontSize: 16 },
    stAlt: { color: c.muted, fontSize: 14 },
  });
}
