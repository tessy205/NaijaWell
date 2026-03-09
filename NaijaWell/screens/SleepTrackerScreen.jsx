import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SLEEP_QUALITY = [
  { value: 1, emoji: '😫', label: 'Terrible', color: '#EF5350' },
  { value: 2, emoji: '😕', label: 'Poor', color: '#FF7043' },
  { value: 3, emoji: '😐', label: 'Fair', color: '#FFB74D' },
  { value: 4, emoji: '😊', label: 'Good', color: '#81C784' },
  { value: 5, emoji: '😴', label: 'Excellent', color: '#1ABFB8' },
];

const SLEEP_ISSUES = [
  'Mosquitoes', 'Heat / No fan', 'Noise outside', 'NEPA took light',
  'Worry & anxiety', 'Phone use', 'Ate late', 'Snoring partner',
  'Back pain', 'Nightmares', 'Woke too early', 'Neighbours',
];

const HOURS_OPTIONS = ['4', '5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '10+'];
const BED_TIMES = ['8pm', '9pm', '10pm', '11pm', '12am', '1am', '2am', 'Later'];
const WAKE_TIMES = ['4am', '5am', '6am', '7am', '8am', '9am', '10am', 'Later'];

export default function SleepTrackerScreen({ navigation }) {
  const [sleepHours, setSleepHours] = useState('');
  const [quality, setQuality] = useState(null);
  const [bedTime, setBedTime] = useState('');
  const [wakeTime, setWakeTime] = useState('');
  const [issues, setIssues] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => { loadLogs(); }, []);

  const loadLogs = async () => {
    try {
      const data = await AsyncStorage.getItem('naijawell_sleep_logs');
      if (data) setLogs(JSON.parse(data));
    } catch {}
  };

  const toggleIssue = (issue) =>
    setIssues((prev) => prev.includes(issue) ? prev.filter((x) => x !== issue) : [...prev, issue]);

  const saveEntry = async () => {
    if (!sleepHours) { Alert.alert('Missing Info', 'Please select how many hours you slept.'); return; }
    if (!quality) { Alert.alert('Missing Info', 'Please rate your sleep quality.'); return; }

    const q = SLEEP_QUALITY.find((s) => s.value === quality);
    const hours = sleepHours === '10+' ? 10 : parseFloat(sleepHours);
    const entry = {
      id: Date.now().toString(),
      hours,
      hoursDisplay: sleepHours,
      quality,
      qualityEmoji: q.emoji,
      qualityLabel: q.label,
      qualityColor: q.color,
      bedTime,
      wakeTime,
      issues,
      date: new Date().toISOString(),
    };

    const updated = [entry, ...logs].slice(0, 30);
    setLogs(updated);
    try { await AsyncStorage.setItem('naijawell_sleep_logs', JSON.stringify(updated)); } catch {}

    setSleepHours('');
    setQuality(null);
    setBedTime('');
    setWakeTime('');
    setIssues([]);

    const tip = hours < 6
      ? 'You slept less than 6 hours. Your body needs 7–9 hours to heal and function well. Try to sleep earlier tonight.'
      : hours >= 7
      ? 'Good sleep duration! Quality sleep boosts your immune system and reduces stress. 💚'
      : 'You are close to the recommended 7–9 hours. Try to get a bit more sleep if you can.';
    Alert.alert('Sleep Logged ✅', tip);
  };

  const deleteLog = async (id) => {
    Alert.alert('Delete Entry', 'Remove this sleep log?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          const updated = logs.filter((l) => l.id !== id);
          setLogs(updated);
          try { await AsyncStorage.setItem('naijawell_sleep_logs', JSON.stringify(updated)); } catch {}
        },
      },
    ]);
  };

  const avgHours = logs.length > 0
    ? (logs.slice(0, 7).reduce((a, l) => a + l.hours, 0) / Math.min(logs.length, 7)).toFixed(1)
    : null;

  const avgQuality = logs.length > 0
    ? (logs.slice(0, 7).reduce((a, l) => a + l.quality, 0) / Math.min(logs.length, 7)).toFixed(1)
    : null;

  const formatDate = (iso) => new Date(iso).toLocaleDateString('en-NG', {
    weekday: 'short', day: 'numeric', month: 'short',
  });

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor="#0D2B2B" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>😴 Sleep Tracker</Text>
          <Text style={styles.headerSub}>Log your sleep and spot patterns over time</Text>
        </View>

        {/* Stats */}
        {logs.length > 0 && (
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{avgHours}h</Text>
              <Text style={styles.statLabel}>Avg Sleep</Text>
            </View>
            <View style={styles.statDiv} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{avgQuality}/5</Text>
              <Text style={styles.statLabel}>Avg Quality</Text>
            </View>
            <View style={styles.statDiv} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{logs.length}</Text>
              <Text style={styles.statLabel}>Total Logs</Text>
            </View>
          </View>
        )}

        {/* Naija tip */}
        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>🇳🇬 Sleep in Nigeria</Text>
          <Text style={styles.tipText}>
            Mosquitoes, generator noise, heat and late-night social media are common sleep disruptors in Nigeria. 7–9 hours of quality sleep strengthens your immune system and fights malaria symptoms.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Log Last Night's Sleep</Text>

          {/* Hours slept */}
          <Text style={styles.fieldLabel}>Hours Slept</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hoursScroll}>
            {HOURS_OPTIONS.map((h) => (
              <TouchableOpacity
                key={h}
                style={[styles.hourChip, sleepHours === h && styles.hourChipActive]}
                onPress={() => setSleepHours(h)}
              >
                <Text style={[styles.hourText, sleepHours === h && styles.hourTextActive]}>{h}h</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Bed time */}
          <Text style={styles.fieldLabel}>Bed Time</Text>
          <View style={styles.timeRow}>
            {BED_TIMES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.timeChip, bedTime === t && styles.timeChipActive]}
                onPress={() => setBedTime(t)}
              >
                <Text style={[styles.timeText, bedTime === t && styles.timeTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Wake time */}
          <Text style={styles.fieldLabel}>Wake Time</Text>
          <View style={styles.timeRow}>
            {WAKE_TIMES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.timeChip, wakeTime === t && styles.timeChipActive]}
                onPress={() => setWakeTime(t)}
              >
                <Text style={[styles.timeText, wakeTime === t && styles.timeTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Quality */}
          <Text style={styles.fieldLabel}>Sleep Quality *</Text>
          <View style={styles.qualityRow}>
            {SLEEP_QUALITY.map((q) => (
              <TouchableOpacity
                key={q.value}
                style={[styles.qualityCard, quality === q.value && { borderColor: q.color, backgroundColor: q.color + '22' }]}
                onPress={() => setQuality(q.value)}
              >
                <Text style={styles.qualityEmoji}>{q.emoji}</Text>
                <Text style={[styles.qualityLabel, quality === q.value && { color: q.color }]}>{q.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Issues */}
          <Text style={styles.fieldLabel}>What Disrupted Your Sleep? (optional)</Text>
          <View style={styles.issuesGrid}>
            {SLEEP_ISSUES.map((issue) => (
              <TouchableOpacity
                key={issue}
                style={[styles.issueChip, issues.includes(issue) && styles.issueChipActive]}
                onPress={() => toggleIssue(issue)}
              >
                <Text style={[styles.issueText, issues.includes(issue) && styles.issueTextActive]}>{issue}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={saveEntry} activeOpacity={0.85}>
            <Text style={styles.saveBtnText}>Save Sleep Log 😴</Text>
          </TouchableOpacity>
        </View>

        {/* Recommended guide */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sleep Recommendations</Text>
          {[
            { label: 'Adults', hours: '7–9 hours', emoji: '🧑' },
            { label: 'Teenagers', hours: '8–10 hours', emoji: '🧒' },
            { label: 'Elderly (65+)', hours: '7–8 hours', emoji: '👴' },
          ].map((r) => (
            <View key={r.label} style={styles.recRow}>
              <Text style={styles.recEmoji}>{r.emoji}</Text>
              <Text style={styles.recLabel}>{r.label}</Text>
              <Text style={styles.recHours}>{r.hours}</Text>
            </View>
          ))}
        </View>

        {/* History */}
        {logs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sleep History</Text>
            {logs.map((log) => (
              <TouchableOpacity
                key={log.id} style={styles.logCard}
                onLongPress={() => deleteLog(log.id)} activeOpacity={0.8}
              >
                <Text style={styles.logEmoji}>{log.qualityEmoji}</Text>
                <View style={styles.logInfo}>
                  <View style={styles.logTop}>
                    <Text style={[styles.logHours, { color: log.qualityColor }]}>{log.hoursDisplay}h sleep</Text>
                    <Text style={[styles.logQuality, { color: log.qualityColor }]}>{log.qualityLabel}</Text>
                  </View>
                  {(log.bedTime || log.wakeTime) && (
                    <Text style={styles.logTimes}>
                      {log.bedTime ? `🌙 ${log.bedTime}` : ''}{log.bedTime && log.wakeTime ? '  →  ' : ''}{log.wakeTime ? `☀️ ${log.wakeTime}` : ''}
                    </Text>
                  )}
                  {log.issues.length > 0 && (
                    <Text style={styles.logIssues} numberOfLines={1}>⚠️ {log.issues.join(', ')}</Text>
                  )}
                  <Text style={styles.logDate}>{formatDate(log.date)}</Text>
                </View>
              </TouchableOpacity>
            ))}
            <Text style={styles.hint}>Long press to delete</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D2B2B' },
  scroll: { paddingBottom: 40 },
  header: {
    paddingTop: 58, paddingHorizontal: 22, paddingBottom: 20,
    borderBottomWidth: 1, borderBottomColor: 'rgba(26,191,184,0.1)',
  },
  backText: { color: '#1ABFB8', fontSize: 15, fontWeight: '600', marginBottom: 14 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  headerSub: { fontSize: 13, color: 'rgba(180,230,228,0.6)' },
  statsRow: {
    flexDirection: 'row', margin: 22,
    backgroundColor: 'rgba(14,124,123,0.18)', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: 'rgba(26,191,184,0.18)',
  },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { color: '#1ABFB8', fontSize: 18, fontWeight: '800', marginBottom: 3 },
  statLabel: { color: 'rgba(180,230,228,0.55)', fontSize: 11 },
  statDiv: { width: 1, backgroundColor: 'rgba(26,191,184,0.2)' },
  tipBox: {
    marginHorizontal: 22, backgroundColor: 'rgba(14,124,123,0.12)',
    borderRadius: 14, padding: 14, marginBottom: 4,
    borderWidth: 1, borderColor: 'rgba(26,191,184,0.18)',
  },
  tipTitle: { color: '#1ABFB8', fontWeight: '700', fontSize: 13, marginBottom: 5 },
  tipText: { color: 'rgba(255,255,255,0.7)', fontSize: 12, lineHeight: 19 },
  card: {
    marginHorizontal: 22, marginTop: 18,
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: 'rgba(26,191,184,0.18)',
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginBottom: 16 },
  fieldLabel: { color: 'rgba(180,230,228,0.75)', fontSize: 13, fontWeight: '600', marginBottom: 10, marginTop: 14 },
  hoursScroll: { marginBottom: 4 },
  hourChip: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, marginRight: 8,
    backgroundColor: 'rgba(14,124,123,0.15)',
    borderWidth: 1.5, borderColor: 'rgba(26,191,184,0.2)',
  },
  hourChipActive: { backgroundColor: '#0E7C7B', borderColor: '#1ABFB8' },
  hourText: { color: 'rgba(180,230,228,0.7)', fontWeight: '700', fontSize: 15 },
  hourTextActive: { color: '#FFFFFF' },
  timeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeChip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    backgroundColor: 'rgba(14,124,123,0.12)',
    borderWidth: 1, borderColor: 'rgba(26,191,184,0.18)',
  },
  timeChipActive: { backgroundColor: 'rgba(14,124,123,0.35)', borderColor: '#1ABFB8' },
  timeText: { color: 'rgba(180,230,228,0.65)', fontSize: 12 },
  timeTextActive: { color: '#FFFFFF', fontWeight: '700' },
  qualityRow: { flexDirection: 'row', gap: 8 },
  qualityCard: {
    flex: 1, borderRadius: 14, padding: 10, alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1.5, borderColor: 'rgba(26,191,184,0.15)',
  },
  qualityEmoji: { fontSize: 24, marginBottom: 4 },
  qualityLabel: { color: 'rgba(180,230,228,0.65)', fontSize: 10, fontWeight: '600', textAlign: 'center' },
  issuesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  issueChip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    backgroundColor: 'rgba(14,124,123,0.12)',
    borderWidth: 1, borderColor: 'rgba(26,191,184,0.18)',
  },
  issueChipActive: { backgroundColor: 'rgba(239,83,80,0.15)', borderColor: '#EF5350' },
  issueText: { color: 'rgba(180,230,228,0.65)', fontSize: 12 },
  issueTextActive: { color: '#FFFFFF', fontWeight: '600' },
  saveBtn: {
    backgroundColor: '#0E7C7B', borderRadius: 14, height: 52,
    alignItems: 'center', justifyContent: 'center', marginTop: 20,
    borderWidth: 1, borderColor: '#1ABFB8',
    shadowColor: '#1ABFB8', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 8,
  },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  recRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  recEmoji: { fontSize: 22, marginRight: 12 },
  recLabel: { color: 'rgba(180,230,228,0.8)', fontSize: 14, flex: 1 },
  recHours: { color: '#1ABFB8', fontSize: 14, fontWeight: '700' },
  section: { paddingHorizontal: 22, marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginBottom: 12 },
  logCard: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 14,
    marginBottom: 10, flexDirection: 'row', alignItems: 'flex-start',
    borderWidth: 1, borderColor: 'rgba(26,191,184,0.12)',
  },
  logEmoji: { fontSize: 28, marginRight: 12, marginTop: 2 },
  logInfo: { flex: 1 },
  logTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  logHours: { fontSize: 16, fontWeight: '800' },
  logQuality: { fontSize: 13, fontWeight: '600' },
  logTimes: { color: 'rgba(180,230,228,0.6)', fontSize: 12, marginBottom: 3 },
  logIssues: { color: 'rgba(255,183,77,0.7)', fontSize: 11, marginBottom: 3 },
  logDate: { color: 'rgba(180,230,228,0.4)', fontSize: 11 },
  hint: { color: 'rgba(180,230,228,0.35)', fontSize: 11, textAlign: 'center', marginTop: 6 },
});