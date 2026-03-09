import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, ScrollView, TextInput,
  Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const classifyTemp = (temp) => {
  if (temp < 35.0) return { label: 'Hypothermia', color: '#4FC3F7', emoji: '🧊', tip: 'Temperature is dangerously low. Warm the person and go to a hospital immediately.' };
  if (temp < 36.1) return { label: 'Below Normal', color: '#81C784', emoji: '⬇️', tip: 'Slightly below normal. Rest and keep warm. Monitor closely.' };
  if (temp <= 37.2) return { label: 'Normal', color: '#1ABFB8', emoji: '✅', tip: 'Your temperature is normal. Stay hydrated and healthy!' };
  if (temp <= 37.9) return { label: 'Low-Grade Fever', color: '#AED581', emoji: '🌡️', tip: 'Slight fever. Rest, drink fluids (water, zobo, ORS). Monitor every few hours.' };
  if (temp <= 38.9) return { label: 'Moderate Fever', color: '#FFB74D', emoji: '⚠️', tip: 'Moderate fever. Take paracetamol, rest, and hydrate. Consider malaria test if in Nigeria.' };
  if (temp <= 39.9) return { label: 'High Fever', color: '#FF7043', emoji: '🚨', tip: 'High fever. Take paracetamol, apply cold compress. See a doctor if no improvement in 24hrs.' };
  return { label: 'Very High — Emergency', color: '#EF5350', emoji: '🆘', tip: 'Very dangerous fever. Go to a hospital immediately. This could be severe malaria or infection.' };
};

const NOTES_OPTIONS = ['Headache', 'Chills', 'Sweating', 'Body pain', 'Vomiting', 'Took paracetamol', 'Tested for malaria', 'Saw a doctor'];

export default function FeverLogScreen({ navigation }) {
  const [temp, setTemp] = useState('');
  const [unit, setUnit] = useState('C');
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [logs, setLogs] = useState([]);
  const [classification, setClassification] = useState(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => { loadLogs(); }, []);

  const loadLogs = async () => {
    try {
      const data = await AsyncStorage.getItem('naijawell_fever_logs');
      if (data) setLogs(JSON.parse(data));
    } catch {}
  };

  const toC = (val) => unit === 'F' ? ((val - 32) * 5) / 9 : val;
  const fromC = (val) => unit === 'F' ? (val * 9) / 5 + 32 : val;

  const logTemperature = async () => {
    const raw = parseFloat(temp);
    if (isNaN(raw)) {
      Alert.alert('Invalid Input', 'Please enter a valid temperature.');
      return;
    }
    const inC = toC(raw);
    if (inC < 30 || inC > 45) {
      Alert.alert('Out of Range', 'Please enter a realistic temperature value.');
      return;
    }

    const result = classifyTemp(inC);
    setClassification(result);

    const entry = {
      id: Date.now().toString(),
      tempC: parseFloat(inC.toFixed(1)),
      tempDisplay: `${raw}°${unit}`,
      notes: selectedNotes,
      classification: result.label,
      color: result.color,
      date: new Date().toISOString(),
    };

    const updated = [entry, ...logs].slice(0, 30);
    setLogs(updated);
    try { await AsyncStorage.setItem('naijawell_fever_logs', JSON.stringify(updated)); } catch {}

    setTemp('');
    setSelectedNotes([]);
  };

  const toggleNote = (note) => {
    setSelectedNotes((prev) =>
      prev.includes(note) ? prev.filter((n) => n !== note) : [...prev, note]
    );
  };

  const deleteLog = async (id) => {
    Alert.alert('Delete Entry', 'Remove this temperature log?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          const updated = logs.filter((l) => l.id !== id);
          setLogs(updated);
          try { await AsyncStorage.setItem('naijawell_fever_logs', JSON.stringify(updated)); } catch {}
        },
      },
    ]);
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }) +
      ' · ' + d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
  };

  const avg = logs.length > 0
    ? (logs.slice(0, 7).reduce((a, l) => a + l.tempC, 0) / Math.min(logs.length, 7)).toFixed(1)
    : null;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor="#0D2B2B" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🌡️ Fever & Temperature Log</Text>
          <Text style={styles.headerSub}>Track your body temperature daily</Text>
        </View>

        {/* Stats row */}
        {logs.length > 0 && (
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{logs[0].tempC}°C</Text>
              <Text style={styles.statLabel}>Last Reading</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{avg}°C</Text>
              <Text style={styles.statLabel}>7-Day Avg</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{logs.length}</Text>
              <Text style={styles.statLabel}>Total Logs</Text>
            </View>
          </View>
        )}

        {/* Input card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Log Temperature</Text>

          {/* Unit toggle */}
          <View style={styles.unitRow}>
            <Text style={styles.unitLabel}>Unit:</Text>
            <View style={styles.unitToggle}>
              <TouchableOpacity
                style={[styles.unitBtn, unit === 'C' && styles.unitBtnActive]}
                onPress={() => setUnit('C')}
              >
                <Text style={[styles.unitBtnText, unit === 'C' && styles.unitBtnTextActive]}>°C</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.unitBtn, unit === 'F' && styles.unitBtnActive]}
                onPress={() => setUnit('F')}
              >
                <Text style={[styles.unitBtnText, unit === 'F' && styles.unitBtnTextActive]}>°F</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Temp input */}
          <View style={[styles.tempInputRow, focused && styles.tempInputFocused]}>
            <Text style={styles.thermEmoji}>🌡️</Text>
            <TextInput
              style={styles.tempInput}
              placeholder={unit === 'C' ? 'e.g. 37.5' : 'e.g. 99.5'}
              placeholderTextColor="rgba(180,230,228,0.3)"
              value={temp}
              onChangeText={setTemp}
              keyboardType="decimal-pad"
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
            <Text style={styles.unitSuffix}>°{unit}</Text>
          </View>

          {/* Normal range hint */}
          <Text style={styles.rangeHint}>
            Normal range: 36.1°C – 37.2°C (97.0°F – 99.0°F)
          </Text>

          {/* Notes chips */}
          <Text style={styles.notesLabel}>Accompanying Symptoms (optional)</Text>
          <View style={styles.notesGrid}>
            {NOTES_OPTIONS.map((note) => {
              const active = selectedNotes.includes(note);
              return (
                <TouchableOpacity
                  key={note}
                  style={[styles.noteChip, active && styles.noteChipActive]}
                  onPress={() => toggleNote(note)}
                >
                  <Text style={[styles.noteChipText, active && styles.noteChipTextActive]}>
                    {note}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={styles.logBtn} onPress={logTemperature} activeOpacity={0.85}>
            <Text style={styles.logBtnText}>Log Temperature</Text>
          </TouchableOpacity>
        </View>

        {/* Result */}
        {classification && (
          <View style={[styles.resultCard, { borderColor: classification.color + '55' }]}>
            <Text style={styles.resultEmoji}>{classification.emoji}</Text>
            <Text style={[styles.resultLabel, { color: classification.color }]}>{classification.label}</Text>
            <Text style={styles.resultTip}>{classification.tip}</Text>
          </View>
        )}

        {/* Reference */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Temperature Guide</Text>
          {[
            { label: 'Hypothermia', range: 'Below 35.0°C', color: '#4FC3F7' },
            { label: 'Below Normal', range: '35.0 – 36.0°C', color: '#81C784' },
            { label: 'Normal', range: '36.1 – 37.2°C', color: '#1ABFB8' },
            { label: 'Low-Grade', range: '37.3 – 37.9°C', color: '#AED581' },
            { label: 'Moderate', range: '38.0 – 38.9°C', color: '#FFB74D' },
            { label: 'High Fever', range: '39.0 – 39.9°C', color: '#FF7043' },
            { label: 'Very High', range: '40.0°C and above', color: '#EF5350' },
          ].map((r) => (
            <View key={r.label} style={styles.refRow}>
              <View style={[styles.refDot, { backgroundColor: r.color }]} />
              <Text style={[styles.refLabel, { color: r.color }]}>{r.label}</Text>
              <Text style={styles.refRange}>{r.range}</Text>
            </View>
          ))}
        </View>

        {/* History */}
        {logs.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>📋 Temperature History</Text>
            {logs.map((log) => (
              <TouchableOpacity
                key={log.id}
                style={styles.logCard}
                onLongPress={() => deleteLog(log.id)}
                activeOpacity={0.8}
              >
                <View>
                  <Text style={[styles.logTemp, { color: log.color }]}>{log.tempDisplay}</Text>
                  {log.notes.length > 0 && (
                    <Text style={styles.logNotes}>{log.notes.join(', ')}</Text>
                  )}
                  <Text style={styles.logDate}>{formatDate(log.date)}</Text>
                </View>
                <View style={[styles.logBadge, { backgroundColor: log.color + '22', borderColor: log.color + '55' }]}>
                  <Text style={[styles.logBadgeText, { color: log.color }]}>{log.classification}</Text>
                </View>
              </TouchableOpacity>
            ))}
            <Text style={styles.hint}>Long press to delete a log</Text>
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
    flexDirection: 'row', marginHorizontal: 22, marginTop: 18,
    backgroundColor: 'rgba(14,124,123,0.18)', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: 'rgba(26,191,184,0.18)',
  },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', marginBottom: 3 },
  statLabel: { color: 'rgba(180,230,228,0.55)', fontSize: 11 },
  statDivider: { width: 1, backgroundColor: 'rgba(26,191,184,0.2)', marginHorizontal: 6 },
  card: {
    marginHorizontal: 22, marginTop: 18,
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: 'rgba(26,191,184,0.18)',
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginBottom: 16 },
  unitRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 12 },
  unitLabel: { color: 'rgba(180,230,228,0.7)', fontSize: 14 },
  unitToggle: { flexDirection: 'row', backgroundColor: 'rgba(14,124,123,0.2)', borderRadius: 10, padding: 2 },
  unitBtn: { paddingHorizontal: 18, paddingVertical: 7, borderRadius: 8 },
  unitBtnActive: { backgroundColor: '#0E7C7B' },
  unitBtnText: { color: 'rgba(180,230,228,0.6)', fontWeight: '700', fontSize: 14 },
  unitBtnTextActive: { color: '#FFFFFF' },
  tempInputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(14,124,123,0.15)', borderRadius: 14,
    borderWidth: 1.5, borderColor: 'rgba(26,191,184,0.2)',
    paddingHorizontal: 16, height: 58, marginBottom: 8,
  },
  tempInputFocused: { borderColor: '#1ABFB8', backgroundColor: 'rgba(14,124,123,0.25)' },
  thermEmoji: { fontSize: 22, marginRight: 10 },
  tempInput: { flex: 1, color: '#FFFFFF', fontSize: 22, fontWeight: '700' },
  unitSuffix: { color: '#1ABFB8', fontSize: 22, fontWeight: '700' },
  rangeHint: { color: 'rgba(180,230,228,0.45)', fontSize: 11, marginBottom: 16 },
  notesLabel: { color: 'rgba(180,230,228,0.75)', fontSize: 13, fontWeight: '600', marginBottom: 10 },
  notesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  noteChip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    backgroundColor: 'rgba(14,124,123,0.15)',
    borderWidth: 1, borderColor: 'rgba(26,191,184,0.2)',
  },
  noteChipActive: { backgroundColor: 'rgba(26,191,184,0.2)', borderColor: '#1ABFB8' },
  noteChipText: { color: 'rgba(180,230,228,0.7)', fontSize: 12, fontWeight: '500' },
  noteChipTextActive: { color: '#FFFFFF', fontWeight: '700' },
  logBtn: {
    backgroundColor: '#0E7C7B', borderRadius: 14, height: 52,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#1ABFB8',
    shadowColor: '#1ABFB8', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 8,
  },
  logBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  resultCard: {
    marginHorizontal: 22, marginTop: 18,
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 20,
    padding: 20, borderWidth: 1.5, alignItems: 'center',
  },
  resultEmoji: { fontSize: 42, marginBottom: 8 },
  resultLabel: { fontSize: 20, fontWeight: '800', marginBottom: 10 },
  resultTip: { color: 'rgba(255,255,255,0.8)', fontSize: 13, textAlign: 'center', lineHeight: 20 },
  refRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  refDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  refLabel: { fontSize: 13, fontWeight: '700', width: 80 },
  refRange: { color: 'rgba(180,230,228,0.6)', fontSize: 12, flex: 1 },
  historySection: { paddingHorizontal: 22, marginTop: 18 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginBottom: 12 },
  logCard: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 14,
    marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(26,191,184,0.12)',
  },
  logTemp: { fontSize: 20, fontWeight: '800', marginBottom: 3 },
  logNotes: { color: 'rgba(180,230,228,0.6)', fontSize: 11, marginBottom: 3 },
  logDate: { color: 'rgba(180,230,228,0.4)', fontSize: 11 },
  logBadge: {
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, marginLeft: 8, maxWidth: 100,
  },
  logBadgeText: { fontSize: 10, fontWeight: '700', textAlign: 'center' },
  hint: { color: 'rgba(180,230,228,0.35)', fontSize: 11, textAlign: 'center', marginTop: 4 },
});