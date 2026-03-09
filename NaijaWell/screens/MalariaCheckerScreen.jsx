import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SYMPTOMS = [
  { id: 'fever', label: 'High Fever', emoji: '🌡️', weight: 3 },
  { id: 'chills', label: 'Chills & Shivering', emoji: '🥶', weight: 3 },
  { id: 'headache', label: 'Severe Headache', emoji: '🤕', weight: 2 },
  { id: 'sweating', label: 'Heavy Sweating', emoji: '💦', weight: 2 },
  { id: 'fatigue', label: 'Extreme Fatigue', emoji: '😩', weight: 2 },
  { id: 'nausea', label: 'Nausea / Vomiting', emoji: '🤢', weight: 2 },
  { id: 'muscle', label: 'Muscle/Joint Pain', emoji: '💪', weight: 1 },
  { id: 'appetite', label: 'Loss of Appetite', emoji: '🍽️', weight: 1 },
  { id: 'diarrhea', label: 'Diarrhoea', emoji: '🚽', weight: 1 },
  { id: 'confusion', label: 'Confusion / Dizziness', emoji: '😵', weight: 3 },
  { id: 'jaundice', label: 'Yellowing of Eyes', emoji: '👁️', weight: 3 },
  { id: 'darkurine', label: 'Dark / Brown Urine', emoji: '🟤', weight: 3 },
];

const getRiskLevel = (score) => {
  if (score === 0) return { level: 'No Risk', color: '#81C784', emoji: '✅', advice: 'You have not selected any symptoms. Stay healthy and keep using your mosquito net every night!' };
  if (score <= 3) return { level: 'Low Risk', color: '#AED581', emoji: '🟡', advice: 'You have mild symptoms. Rest, stay hydrated, and monitor closely. If symptoms worsen in 24 hours, visit a clinic.' };
  if (score <= 8) return { level: 'Moderate Risk', color: '#FFB74D', emoji: '🟠', advice: 'You have several malaria symptoms. Please visit a clinic or pharmacy for a Rapid Diagnostic Test (RDT). Do not self-medicate with Artemether.' };
  return { level: 'High Risk', color: '#EF5350', emoji: '🔴', advice: 'You have strong malaria indicators including severe symptoms. Please go to a hospital IMMEDIATELY. This could be severe/cerebral malaria — it is a medical emergency.' };
};

export default function MalariaCheckerScreen({ navigation }) {
  const [selected, setSelected] = useState([]);
  const [result, setResult] = useState(null);
  const [duration, setDuration] = useState('');

  const DURATIONS = ['Today', '2–3 days', '4–7 days', 'Over a week'];

  const toggleSymptom = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
    setResult(null);
  };

  const checkRisk = async () => {
    if (selected.length === 0) {
      Alert.alert('No Symptoms Selected', 'Please select at least one symptom you are experiencing.');
      return;
    }

    const score = selected.reduce((acc, id) => {
      const sym = SYMPTOMS.find((s) => s.id === id);
      return acc + (sym ? sym.weight : 0);
    }, 0);

    const risk = getRiskLevel(score);
    setResult(risk);

    // Save to history
    try {
      const entry = {
        date: new Date().toISOString(),
        symptoms: selected,
        duration,
        riskLevel: risk.level,
        score,
      };
      const existing = await AsyncStorage.getItem('naijawell_malaria_logs');
      const logs = existing ? JSON.parse(existing) : [];
      logs.unshift(entry);
      await AsyncStorage.setItem('naijawell_malaria_logs', JSON.stringify(logs.slice(0, 20)));
    } catch {}
  };

  const reset = () => {
    setSelected([]);
    setResult(null);
    setDuration('');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D2B2B" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🦟 Malaria Symptom Checker</Text>
          <Text style={styles.headerSub}>
            Select all symptoms you are currently experiencing
          </Text>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            ⚠️ This is NOT a medical diagnosis. Always visit a certified health facility for proper testing and treatment.
          </Text>
        </View>

        {/* Duration picker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How long have you felt this way?</Text>
          <View style={styles.durationRow}>
            {DURATIONS.map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.durationChip, duration === d && styles.durationChipActive]}
                onPress={() => setDuration(d)}
              >
                <Text style={[styles.durationText, duration === d && styles.durationTextActive]}>
                  {d}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Symptoms grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Your Symptoms</Text>
          <View style={styles.symptomsGrid}>
            {SYMPTOMS.map((sym) => {
              const active = selected.includes(sym.id);
              return (
                <TouchableOpacity
                  key={sym.id}
                  style={[styles.symptomCard, active && styles.symptomCardActive]}
                  onPress={() => toggleSymptom(sym.id)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.symptomEmoji}>{sym.emoji}</Text>
                  <Text style={[styles.symptomLabel, active && styles.symptomLabelActive]}>
                    {sym.label}
                  </Text>
                  {active && <View style={styles.checkDot}><Text style={styles.checkMark}>✓</Text></View>}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Selected count */}
        {selected.length > 0 && (
          <View style={styles.selectedCount}>
            <Text style={styles.selectedCountText}>
              {selected.length} symptom{selected.length > 1 ? 's' : ''} selected
            </Text>
          </View>
        )}

        {/* Check button */}
        <TouchableOpacity style={styles.checkBtn} onPress={checkRisk} activeOpacity={0.85}>
          <Text style={styles.checkBtnText}>Check My Risk Level</Text>
        </TouchableOpacity>

        {/* Result card */}
        {result && (
          <View style={[styles.resultCard, { borderColor: result.color + '55' }]}>
            <Text style={styles.resultEmoji}>{result.emoji}</Text>
            <Text style={[styles.resultLevel, { color: result.color }]}>{result.level}</Text>
            <Text style={styles.resultAdvice}>{result.advice}</Text>

            {result.level !== 'No Risk' && (
              <View style={styles.hotlineBox}>
                <Text style={styles.hotlineTitle}>🏥 Nigeria Health Hotlines</Text>
                <Text style={styles.hotlineLine}>NCDC: 0800-9700-0010 (toll free)</Text>
                <Text style={styles.hotlineLine}>Emergency: 112</Text>
              </View>
            )}

            <TouchableOpacity style={styles.resetBtn} onPress={reset}>
              <Text style={styles.resetBtnText}>Start Over</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
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
  headerSub: { fontSize: 13, color: 'rgba(180,230,228,0.6)', lineHeight: 20 },
  disclaimer: {
    margin: 22, backgroundColor: 'rgba(255,183,77,0.1)',
    borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: 'rgba(255,183,77,0.25)',
  },
  disclaimerText: { color: '#FFB74D', fontSize: 12, lineHeight: 18 },
  section: { paddingHorizontal: 22, marginBottom: 22 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#FFFFFF', marginBottom: 12 },
  durationRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  durationChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: 'rgba(14,124,123,0.15)',
    borderWidth: 1, borderColor: 'rgba(26,191,184,0.2)',
  },
  durationChipActive: { backgroundColor: 'rgba(14,124,123,0.4)', borderColor: '#1ABFB8' },
  durationText: { color: 'rgba(180,230,228,0.7)', fontSize: 13, fontWeight: '500' },
  durationTextActive: { color: '#FFFFFF', fontWeight: '700' },
  symptomsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  symptomCard: {
    width: '47%', backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16, padding: 14, alignItems: 'center',
    borderWidth: 1.5, borderColor: 'rgba(26,191,184,0.15)',
    position: 'relative',
  },
  symptomCardActive: {
    backgroundColor: 'rgba(239,83,80,0.12)',
    borderColor: '#EF5350',
  },
  symptomEmoji: { fontSize: 28, marginBottom: 8 },
  symptomLabel: {
    color: 'rgba(180,230,228,0.75)', fontSize: 12,
    fontWeight: '600', textAlign: 'center', lineHeight: 17,
  },
  symptomLabelActive: { color: '#FFFFFF' },
  checkDot: {
    position: 'absolute', top: 8, right: 8,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#EF5350', alignItems: 'center', justifyContent: 'center',
  },
  checkMark: { color: '#fff', fontSize: 11, fontWeight: '800' },
  selectedCount: {
    marginHorizontal: 22, marginBottom: 14,
    backgroundColor: 'rgba(14,124,123,0.2)', borderRadius: 12,
    padding: 10, alignItems: 'center',
  },
  selectedCountText: { color: '#1ABFB8', fontWeight: '700', fontSize: 13 },
  checkBtn: {
    marginHorizontal: 22, backgroundColor: '#0E7C7B',
    borderRadius: 16, height: 54, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#1ABFB8', marginBottom: 20,
    shadowColor: '#1ABFB8', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 14, elevation: 10,
  },
  checkBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  resultCard: {
    marginHorizontal: 22, backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20, padding: 22, borderWidth: 1.5, alignItems: 'center',
  },
  resultEmoji: { fontSize: 50, marginBottom: 10 },
  resultLevel: { fontSize: 24, fontWeight: '800', marginBottom: 12 },
  resultAdvice: {
    color: 'rgba(255,255,255,0.8)', fontSize: 14,
    textAlign: 'center', lineHeight: 22, marginBottom: 18,
  },
  hotlineBox: {
    width: '100%', backgroundColor: 'rgba(14,124,123,0.2)',
    borderRadius: 14, padding: 14, marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(26,191,184,0.25)',
  },
  hotlineTitle: { color: '#1ABFB8', fontWeight: '700', fontSize: 13, marginBottom: 6 },
  hotlineLine: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 3 },
  resetBtn: {
    borderWidth: 1.5, borderColor: '#1ABFB8',
    borderRadius: 14, paddingVertical: 12, paddingHorizontal: 32,
  },
  resetBtnText: { color: '#1ABFB8', fontWeight: '700', fontSize: 14 },
});