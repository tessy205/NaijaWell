import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STRESS_LEVELS = [
  { value: 1, emoji: '😊', label: 'Very Calm', color: '#1ABFB8' },
  { value: 2, emoji: '🙂', label: 'Calm', color: '#81C784' },
  { value: 3, emoji: '😐', label: 'Neutral', color: '#AED581' },
  { value: 4, emoji: '😟', label: 'Stressed', color: '#FFB74D' },
  { value: 5, emoji: '😩', label: 'Very Stressed', color: '#FF7043' },
];

const TRIGGERS = [
  'Work pressure', 'Money problems', 'Traffic (Lagos!)', 'Family issues',
  'Health worries', 'Relationship', 'NEPA / No light', 'Job hunting',
  'School stress', 'Political news', 'Noise', 'Heat',
];

const COPING = [
  'Prayer / Church', 'Called a friend', 'Listened to music', 'Took a walk',
  'Ate something', 'Rested', 'Talked to family', 'Watched TV',
  'Deep breathing', 'Read the Bible/Quran', 'Exercised', 'Did nothing',
];

export default function StressJournalScreen({ navigation }) {
  const [stressLevel, setStressLevel] = useState(null);
  const [selectedTriggers, setSelectedTriggers] = useState([]);
  const [selectedCoping, setSelectedCoping] = useState([]);
  const [note, setNote] = useState('');
  const [logs, setLogs] = useState([]);
  const [noteFocused, setNoteFocused] = useState(false);

  useEffect(() => { loadLogs(); }, []);

  const loadLogs = async () => {
    try {
      const data = await AsyncStorage.getItem('naijawell_stress_logs');
      if (data) setLogs(JSON.parse(data));
    } catch {}
  };

  const toggleItem = (list, setList, item) =>
    setList((prev) => prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]);

  const saveEntry = async () => {
    if (!stressLevel) { Alert.alert('Select Mood', 'Please select your stress level.'); return; }

    const level = STRESS_LEVELS.find((s) => s.value === stressLevel);
    const entry = {
      id: Date.now().toString(),
      stressLevel,
      emoji: level.emoji,
      label: level.label,
      color: level.color,
      triggers: selectedTriggers,
      coping: selectedCoping,
      note: note.trim(),
      date: new Date().toISOString(),
    };

    const updated = [entry, ...logs].slice(0, 50);
    setLogs(updated);
    try { await AsyncStorage.setItem('naijawell_stress_logs', JSON.stringify(updated)); } catch {}

    setStressLevel(null);
    setSelectedTriggers([]);
    setSelectedCoping([]);
    setNote('');

    const msg = stressLevel >= 4
      ? 'Your stress level is high. Remember: you are stronger than your problems. Consider talking to someone you trust. 🙏'
      : 'Great that you checked in! Keep taking care of yourself. 💚';
    Alert.alert('Journal Saved ✅', msg);
  };

  const deleteLog = async (id) => {
    Alert.alert('Delete Entry', 'Remove this journal entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          const updated = logs.filter((l) => l.id !== id);
          setLogs(updated);
          try { await AsyncStorage.setItem('naijawell_stress_logs', JSON.stringify(updated)); } catch {}
        },
      },
    ]);
  };

  const avgStress = logs.length > 0
    ? (logs.slice(0, 7).reduce((a, l) => a + l.stressLevel, 0) / Math.min(logs.length, 7)).toFixed(1)
    : null;

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' }) +
      ' · ' + d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor="#0D2B2B" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>😓 Stress Journal</Text>
          <Text style={styles.headerSub}>Check in with your mental health daily</Text>
        </View>

        {/* Avg stress */}
        {avgStress && (
          <View style={styles.avgCard}>
            <Text style={styles.avgLabel}>7-Day Stress Average</Text>
            <Text style={styles.avgValue}>{avgStress} / 5</Text>
            <Text style={styles.avgSub}>
              {avgStress <= 2 ? '😊 You are managing well!' : avgStress <= 3.5 ? '🙂 Moderate stress levels' : '😟 High stress — please rest and seek support'}
            </Text>
          </View>
        )}

        {/* Naija context */}
        <View style={styles.contextBox}>
          <Text style={styles.contextTitle}>🇳🇬 Mental Health Matters</Text>
          <Text style={styles.contextText}>
            In Nigeria, mental health is often overlooked. But stress from NEPA, traffic, financial pressure and family responsibilities is real. Tracking your stress is the first step to managing it.
          </Text>
        </View>

        {/* Stress level picker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How stressed are you right now?</Text>
          <View style={styles.stressRow}>
            {STRESS_LEVELS.map((s) => (
              <TouchableOpacity
                key={s.value}
                style={[styles.stressCard, stressLevel === s.value && { borderColor: s.color, backgroundColor: s.color + '22' }]}
                onPress={() => setStressLevel(s.value)}
                activeOpacity={0.75}
              >
                <Text style={styles.stressEmoji}>{s.emoji}</Text>
                <Text style={[styles.stressLabel, stressLevel === s.value && { color: s.color }]}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Triggers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What is stressing you? (optional)</Text>
          <View style={styles.chipGrid}>
            {TRIGGERS.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.chip, selectedTriggers.includes(t) && styles.chipActive]}
                onPress={() => toggleItem(selectedTriggers, setSelectedTriggers, t)}
              >
                <Text style={[styles.chipText, selectedTriggers.includes(t) && styles.chipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Coping */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How are you coping? (optional)</Text>
          <View style={styles.chipGrid}>
            {COPING.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.chip, selectedCoping.includes(c) && styles.chipGreen]}
                onPress={() => toggleItem(selectedCoping, setSelectedCoping, c)}
              >
                <Text style={[styles.chipText, selectedCoping.includes(c) && styles.chipTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Note */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Write a note (optional)</Text>
          <TextInput
            style={[styles.noteInput, noteFocused && styles.noteInputFocused]}
            placeholder="How are you feeling? Write freely..."
            placeholderTextColor="rgba(180,230,228,0.3)"
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            onFocus={() => setNoteFocused(true)}
            onBlur={() => setNoteFocused(false)}
          />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={saveEntry} activeOpacity={0.85}>
          <Text style={styles.saveBtnText}>Save Journal Entry</Text>
        </TouchableOpacity>

        {/* History */}
        {logs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Past Entries</Text>
            {logs.slice(0, 10).map((log) => (
              <TouchableOpacity
                key={log.id}
                style={styles.logCard}
                onLongPress={() => deleteLog(log.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.logEmoji}>{log.emoji}</Text>
                <View style={styles.logInfo}>
                  <Text style={[styles.logLabel, { color: log.color }]}>{log.label}</Text>
                  {log.triggers.length > 0 && (
                    <Text style={styles.logTriggers} numberOfLines={1}>{log.triggers.join(', ')}</Text>
                  )}
                  {log.note ? <Text style={styles.logNote} numberOfLines={1}>"{log.note}"</Text> : null}
                  <Text style={styles.logDate}>{formatDate(log.date)}</Text>
                </View>
                <View style={[styles.levelBubble, { backgroundColor: log.color + '33' }]}>
                  <Text style={[styles.levelNum, { color: log.color }]}>{log.stressLevel}/5</Text>
                </View>
              </TouchableOpacity>
            ))}
            <Text style={styles.hint}>Long press to delete an entry</Text>
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
  avgCard: {
    margin: 22, backgroundColor: 'rgba(14,124,123,0.2)', borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: 'rgba(26,191,184,0.2)', alignItems: 'center',
  },
  avgLabel: { color: 'rgba(180,230,228,0.65)', fontSize: 13, marginBottom: 4 },
  avgValue: { color: '#1ABFB8', fontSize: 28, fontWeight: '800', marginBottom: 4 },
  avgSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, textAlign: 'center' },
  contextBox: {
    marginHorizontal: 22, backgroundColor: 'rgba(129,199,132,0.08)',
    borderRadius: 14, padding: 14, marginBottom: 4,
    borderWidth: 1, borderColor: 'rgba(129,199,132,0.2)',
  },
  contextTitle: { color: '#81C784', fontWeight: '700', fontSize: 13, marginBottom: 5 },
  contextText: { color: 'rgba(255,255,255,0.7)', fontSize: 12, lineHeight: 19 },
  section: { paddingHorizontal: 22, marginTop: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#FFFFFF', marginBottom: 12 },
  stressRow: { flexDirection: 'row', gap: 8 },
  stressCard: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14, padding: 10, alignItems: 'center',
    borderWidth: 1.5, borderColor: 'rgba(26,191,184,0.15)',
  },
  stressEmoji: { fontSize: 26, marginBottom: 5 },
  stressLabel: { color: 'rgba(180,230,228,0.7)', fontSize: 10, fontWeight: '600', textAlign: 'center' },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
    backgroundColor: 'rgba(14,124,123,0.15)',
    borderWidth: 1, borderColor: 'rgba(26,191,184,0.2)',
  },
  chipActive: { backgroundColor: 'rgba(239,83,80,0.15)', borderColor: '#EF5350' },
  chipGreen: { backgroundColor: 'rgba(129,199,132,0.15)', borderColor: '#81C784' },
  chipText: { color: 'rgba(180,230,228,0.7)', fontSize: 12, fontWeight: '500' },
  chipTextActive: { color: '#FFFFFF', fontWeight: '700' },
  noteInput: {
    backgroundColor: 'rgba(14,124,123,0.12)', borderRadius: 14,
    borderWidth: 1.5, borderColor: 'rgba(26,191,184,0.2)',
    padding: 14, color: '#FFFFFF', fontSize: 14,
    minHeight: 100, lineHeight: 22,
  },
  noteInputFocused: { borderColor: '#1ABFB8' },
  saveBtn: {
    marginHorizontal: 22, marginTop: 22, backgroundColor: '#0E7C7B',
    borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#1ABFB8',
    shadowColor: '#1ABFB8', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 8,
  },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  logCard: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 14,
    marginBottom: 10, flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(26,191,184,0.12)',
  },
  logEmoji: { fontSize: 30, marginRight: 12 },
  logInfo: { flex: 1 },
  logLabel: { fontWeight: '700', fontSize: 14, marginBottom: 2 },
  logTriggers: { color: 'rgba(180,230,228,0.55)', fontSize: 11, marginBottom: 2 },
  logNote: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontStyle: 'italic', marginBottom: 2 },
  logDate: { color: 'rgba(180,230,228,0.4)', fontSize: 11 },
  levelBubble: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  levelNum: { fontSize: 12, fontWeight: '800' },
  hint: { color: 'rgba(180,230,228,0.35)', fontSize: 11, textAlign: 'center', marginTop: 6 },
});