import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const classifyBP = (sys, dia) => {
  if (sys < 90 || dia < 60) return { label: 'Low (Hypotension)', color: '#4FC3F7', emoji: '⬇️', tip: 'Your BP is low. Drink water, eat salt and see a doctor if you feel dizzy or faint.' };
  if (sys < 120 && dia < 80) return { label: 'Normal', color: '#81C784', emoji: '✅', tip: 'Your blood pressure is healthy. Keep it up with good diet, exercise and low stress.' };
  if (sys < 130 && dia < 80) return { label: 'Elevated', color: '#AED581', emoji: '🔼', tip: 'Slightly elevated. Reduce salt, processed foods and alcohol. Exercise more.' };
  if (sys < 140 || dia < 90) return { label: 'High Stage 1', color: '#FFB74D', emoji: '⚠️', tip: 'Stage 1 Hypertension. See a doctor. Reduce salty foods like smoked fish and crayfish.' };
  if (sys < 180 || dia < 120) return { label: 'High Stage 2', color: '#FF7043', emoji: '🚨', tip: 'Stage 2 Hypertension. See a doctor urgently. You may need medication.' };
  return { label: 'Crisis — Emergency!', color: '#EF5350', emoji: '🆘', tip: 'Hypertensive Crisis! Go to a hospital immediately. This is a medical emergency.' };
};

export default function BloodPressureScreen({ navigation }) {
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [pulse, setPulse] = useState('');
  const [logs, setLogs] = useState([]);
  const [classification, setClassification] = useState(null);
  const [sysFocused, setSysFocused] = useState(false);
  const [diaFocused, setDiaFocused] = useState(false);
  const [pulFocused, setPulFocused] = useState(false);

  useEffect(() => { loadLogs(); }, []);

  const loadLogs = async () => {
    try {
      const data = await AsyncStorage.getItem('naijawell_bp_logs');
      if (data) setLogs(JSON.parse(data));
    } catch {}
  };

  const saveReading = async () => {
    const sys = parseInt(systolic);
    const dia = parseInt(diastolic);
    const pul = parseInt(pulse);

    if (!systolic || !diastolic) {
      Alert.alert('Missing Fields', 'Please enter both systolic and diastolic values.');
      return;
    }
    if (isNaN(sys) || sys < 60 || sys > 250) {
      Alert.alert('Invalid Value', 'Systolic (top number) should be between 60 and 250.');
      return;
    }
    if (isNaN(dia) || dia < 40 || dia > 150) {
      Alert.alert('Invalid Value', 'Diastolic (bottom number) should be between 40 and 150.');
      return;
    }

    const result = classifyBP(sys, dia);
    setClassification(result);

    const entry = {
      id: Date.now().toString(),
      systolic: sys,
      diastolic: dia,
      pulse: isNaN(pul) ? null : pul,
      classification: result.label,
      color: result.color,
      date: new Date().toISOString(),
    };

    const updated = [entry, ...logs].slice(0, 30);
    setLogs(updated);
    try {
      await AsyncStorage.setItem('naijawell_bp_logs', JSON.stringify(updated));
    } catch {}

    setSystolic('');
    setDiastolic('');
    setPulse('');
  };

  const deleteLog = async (id) => {
    Alert.alert('Delete Reading', 'Remove this reading from your log?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          const updated = logs.filter((l) => l.id !== id);
          setLogs(updated);
          try { await AsyncStorage.setItem('naijawell_bp_logs', JSON.stringify(updated)); } catch {}
        },
      },
    ]);
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) +
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
          <Text style={styles.headerTitle}>❤️ Blood Pressure Tracker</Text>
          <Text style={styles.headerSub}>Log and monitor your BP readings over time</Text>
        </View>

        {/* BP info bar */}
        <View style={styles.infoBar}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Normal BP</Text>
            <Text style={styles.infoValue}>120/80</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Systolic</Text>
            <Text style={styles.infoValue}>Top number</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Diastolic</Text>
            <Text style={styles.infoValue}>Bottom number</Text>
          </View>
        </View>

        {/* Input card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Record New Reading</Text>

          <View style={styles.bpInputRow}>
            <View style={styles.bpField}>
              <Text style={styles.bpFieldLabel}>Systolic (mmHg)</Text>
              <TextInput
                style={[styles.bpInput, sysFocused && styles.bpInputFocused]}
                placeholder="e.g. 120"
                placeholderTextColor="rgba(180,230,228,0.3)"
                value={systolic}
                onChangeText={setSystolic}
                keyboardType="number-pad"
                maxLength={3}
                onFocus={() => setSysFocused(true)}
                onBlur={() => setSysFocused(false)}
              />
            </View>

            <Text style={styles.bpSlash}>/</Text>

            <View style={styles.bpField}>
              <Text style={styles.bpFieldLabel}>Diastolic (mmHg)</Text>
              <TextInput
                style={[styles.bpInput, diaFocused && styles.bpInputFocused]}
                placeholder="e.g. 80"
                placeholderTextColor="rgba(180,230,228,0.3)"
                value={diastolic}
                onChangeText={setDiastolic}
                keyboardType="number-pad"
                maxLength={3}
                onFocus={() => setDiaFocused(true)}
                onBlur={() => setDiaFocused(false)}
              />
            </View>
          </View>

          <View style={styles.pulseField}>
            <Text style={styles.bpFieldLabel}>Pulse / Heart Rate (optional)</Text>
            <View style={[styles.pulseInput, pulFocused && styles.bpInputFocused]}>
              <Text style={styles.pulseIcon}>💓</Text>
              <TextInput
                style={styles.pulseTextInput}
                placeholder="e.g. 72 bpm"
                placeholderTextColor="rgba(180,230,228,0.3)"
                value={pulse}
                onChangeText={setPulse}
                keyboardType="number-pad"
                maxLength={3}
                onFocus={() => setPulFocused(true)}
                onBlur={() => setPulFocused(false)}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={saveReading} activeOpacity={0.85}>
            <Text style={styles.saveBtnText}>Save Reading</Text>
          </TouchableOpacity>
        </View>

        {/* Classification result */}
        {classification && (
          <View style={[styles.resultCard, { borderColor: classification.color + '55' }]}>
            <Text style={styles.resultEmoji}>{classification.emoji}</Text>
            <Text style={[styles.resultLabel, { color: classification.color }]}>
              {classification.label}
            </Text>
            <Text style={styles.resultTip}>{classification.tip}</Text>
          </View>
        )}

        {/* BP Scale reference */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>BP Reference Guide</Text>
          {[
            { label: 'Low', range: 'Below 90/60', color: '#4FC3F7' },
            { label: 'Normal', range: '90–119 / 60–79', color: '#81C784' },
            { label: 'Elevated', range: '120–129 / < 80', color: '#AED581' },
            { label: 'Stage 1', range: '130–139 / 80–89', color: '#FFB74D' },
            { label: 'Stage 2', range: '140–179 / 90–119', color: '#FF7043' },
            { label: 'Crisis', range: '180+ / 120+', color: '#EF5350' },
          ].map((r) => (
            <View key={r.label} style={styles.scaleRow}>
              <View style={[styles.scaleDot, { backgroundColor: r.color }]} />
              <Text style={[styles.scaleLabel, { color: r.color }]}>{r.label}</Text>
              <Text style={styles.scaleRange}>{r.range}</Text>
            </View>
          ))}
        </View>

        {/* History */}
        {logs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Reading History</Text>
            {logs.map((log) => (
              <TouchableOpacity
                key={log.id}
                style={styles.logCard}
                onLongPress={() => deleteLog(log.id)}
                activeOpacity={0.8}
              >
                <View style={styles.logLeft}>
                  <Text style={[styles.logBP, { color: log.color }]}>
                    {log.systolic}/{log.diastolic}
                    <Text style={styles.logUnit}> mmHg</Text>
                  </Text>
                  {log.pulse && <Text style={styles.logPulse}>💓 {log.pulse} bpm</Text>}
                  <Text style={styles.logDate}>{formatDate(log.date)}</Text>
                </View>
                <View style={[styles.logBadge, { backgroundColor: log.color + '22', borderColor: log.color + '55' }]}>
                  <Text style={[styles.logBadgeText, { color: log.color }]}>{log.classification}</Text>
                </View>
              </TouchableOpacity>
            ))}
            <Text style={styles.swipeHint}>Long press a reading to delete it</Text>
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
  infoBar: {
    flexDirection: 'row', marginHorizontal: 22, marginTop: 18, marginBottom: 4,
    backgroundColor: 'rgba(14,124,123,0.18)', borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: 'rgba(26,191,184,0.2)',
  },
  infoItem: { flex: 1, alignItems: 'center' },
  infoLabel: { color: 'rgba(180,230,228,0.6)', fontSize: 11, marginBottom: 3 },
  infoValue: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  infoDivider: { width: 1, backgroundColor: 'rgba(26,191,184,0.2)', marginHorizontal: 8 },
  card: {
    marginHorizontal: 22, marginTop: 18,
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: 'rgba(26,191,184,0.18)',
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginBottom: 16 },
  bpInputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginBottom: 14 },
  bpField: { flex: 1 },
  bpFieldLabel: { color: 'rgba(180,230,228,0.7)', fontSize: 12, fontWeight: '600', marginBottom: 8 },
  bpInput: {
    backgroundColor: 'rgba(14,124,123,0.15)', borderRadius: 14,
    borderWidth: 1.5, borderColor: 'rgba(26,191,184,0.2)',
    height: 56, textAlign: 'center', color: '#FFFFFF',
    fontSize: 22, fontWeight: '800',
  },
  bpInputFocused: { borderColor: '#1ABFB8', backgroundColor: 'rgba(14,124,123,0.25)' },
  bpSlash: { color: 'rgba(180,230,228,0.5)', fontSize: 32, fontWeight: '300', paddingBottom: 8 },
  pulseField: { marginBottom: 18 },
  pulseInput: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(14,124,123,0.15)', borderRadius: 14,
    borderWidth: 1.5, borderColor: 'rgba(26,191,184,0.2)',
    paddingHorizontal: 14, height: 50,
  },
  pulseIcon: { fontSize: 18, marginRight: 10 },
  pulseTextInput: { flex: 1, color: '#FFFFFF', fontSize: 16 },
  saveBtn: {
    backgroundColor: '#0E7C7B', borderRadius: 14, height: 52,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#1ABFB8',
    shadowColor: '#1ABFB8', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 8,
  },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  resultCard: {
    marginHorizontal: 22, marginTop: 18,
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 20,
    padding: 20, borderWidth: 1.5, alignItems: 'center',
  },
  resultEmoji: { fontSize: 42, marginBottom: 8 },
  resultLabel: { fontSize: 20, fontWeight: '800', marginBottom: 10 },
  resultTip: { color: 'rgba(255,255,255,0.8)', fontSize: 13, textAlign: 'center', lineHeight: 20 },
  scaleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  scaleDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  scaleLabel: { fontSize: 13, fontWeight: '700', width: 70 },
  scaleRange: { color: 'rgba(180,230,228,0.65)', fontSize: 13, flex: 1 },
  section: { paddingHorizontal: 22, marginTop: 18 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginBottom: 12 },
  logCard: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 14,
    marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(26,191,184,0.12)',
  },
  logLeft: { flex: 1 },
  logBP: { fontSize: 20, fontWeight: '800', marginBottom: 3 },
  logUnit: { fontSize: 12, fontWeight: '400' },
  logPulse: { color: 'rgba(180,230,228,0.65)', fontSize: 12, marginBottom: 3 },
  logDate: { color: 'rgba(180,230,228,0.45)', fontSize: 11 },
  logBadge: {
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, marginLeft: 10, maxWidth: 110,
  },
  logBadgeText: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  swipeHint: { color: 'rgba(180,230,228,0.35)', fontSize: 11, textAlign: 'center', marginTop: 6 },
});