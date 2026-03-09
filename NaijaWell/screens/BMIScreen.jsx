import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const classifyBMI = (bmi) => {
  if (bmi < 16) return { label: 'Severely Underweight', color: '#EF5350', emoji: '⚠️', tip: 'Your BMI is dangerously low. Please see a doctor and increase your caloric intake with nutritious local foods like beans, eggs, and palm oil soup.' };
  if (bmi < 18.5) return { label: 'Underweight', color: '#FF7043', emoji: '📉', tip: 'You are underweight. Eat more protein-rich Nigerian foods — beans, groundnut, fish, eggs — and add healthy fats like avocado and palm kernel oil.' };
  if (bmi < 25) return { label: 'Normal Weight', color: '#1ABFB8', emoji: '✅', tip: 'Your BMI is healthy! Keep eating balanced Nigerian meals, stay active, and drink enough water daily.' };
  if (bmi < 30) return { label: 'Overweight', color: '#FFB74D', emoji: '⚠️', tip: 'You are slightly overweight. Reduce white rice, fried foods and sugary drinks. Switch to ofada rice, more vegetables and daily walking for 30 minutes.' };
  if (bmi < 35) return { label: 'Obese (Class I)', color: '#FF7043', emoji: '🚨', tip: 'Obesity increases risk of hypertension, diabetes and stroke — all common in Nigeria. Reduce portions, cut soft drinks, walk daily and see a doctor for a health check.' };
  if (bmi < 40) return { label: 'Obese (Class II)', color: '#EF5350', emoji: '🚨', tip: 'Class II Obesity. This significantly increases your health risks. Please consult a doctor. A nutritionist can help you with a Nigerian diet plan.' };
  return { label: 'Severely Obese', color: '#B71C1C', emoji: '🆘', tip: 'Severe obesity is a medical emergency risk. Please see a doctor urgently. Medical intervention may be needed alongside lifestyle changes.' };
};

const ACTIVITY_LEVELS = [
  { label: 'Sedentary', desc: 'No exercise', multiplier: 1.2, emoji: '🛋️' },
  { label: 'Light', desc: '1–3 days/week', multiplier: 1.375, emoji: '🚶' },
  { label: 'Moderate', desc: '3–5 days/week', multiplier: 1.55, emoji: '🏃' },
  { label: 'Active', desc: '6–7 days/week', multiplier: 1.725, emoji: '💪' },
  { label: 'Very Active', desc: 'Physical job', multiplier: 1.9, emoji: '⚡' },
];

export default function BMIScreen({ navigation }) {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [activityLevel, setActivityLevel] = useState(null);
  const [unit, setUnit] = useState('metric');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [focused, setFocused] = useState('');

  useEffect(() => { loadHistory(); }, []);

  const loadHistory = async () => {
    try {
      const data = await AsyncStorage.getItem('naijawell_bmi_history');
      if (data) setHistory(JSON.parse(data));
    } catch {}
  };

  const calculateBMI = async () => {
    if (!weight || !height) { Alert.alert('Missing Fields', 'Please enter your weight and height.'); return; }

    let weightKg = parseFloat(weight);
    let heightM = parseFloat(height);

    if (unit === 'imperial') {
      weightKg = weightKg * 0.453592;
      heightM = heightM * 0.0254;
    } else {
      heightM = heightM / 100;
    }

    if (isNaN(weightKg) || weightKg < 20 || weightKg > 300) { Alert.alert('Invalid Weight', 'Please enter a valid weight.'); return; }
    if (isNaN(heightM) || heightM < 0.5 || heightM > 2.5) { Alert.alert('Invalid Height', 'Please enter a valid height.'); return; }

    const bmi = weightKg / (heightM * heightM);
    const classification = classifyBMI(bmi);

    let bmr = null;
    if (age && gender) {
      const ageNum = parseInt(age);
      if (gender === 'male') {
        bmr = 10 * weightKg + 6.25 * (heightM * 100) - 5 * ageNum + 5;
      } else {
        bmr = 10 * weightKg + 6.25 * (heightM * 100) - 5 * ageNum - 161;
      }
    }

    const tdee = bmr && activityLevel
      ? Math.round(bmr * activityLevel.multiplier)
      : null;

    const entry = {
      id: Date.now().toString(),
      bmi: parseFloat(bmi.toFixed(1)),
      weight: parseFloat(weight),
      height: parseFloat(height),
      unit,
      weightKg: parseFloat(weightKg.toFixed(1)),
      heightCm: parseFloat((heightM * 100).toFixed(1)),
      label: classification.label,
      color: classification.color,
      bmr: bmr ? Math.round(bmr) : null,
      tdee,
      date: new Date().toISOString(),
    };

    setResult({ ...entry, ...classification, bmr: entry.bmr, tdee });

    const updated = [entry, ...history].slice(0, 20);
    setHistory(updated);
    try { await AsyncStorage.setItem('naijawell_bmi_history', JSON.stringify(updated)); } catch {}
  };

  const formatDate = (iso) => new Date(iso).toLocaleDateString('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor="#0D2B2B" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>⚖️ BMI Calculator</Text>
          <Text style={styles.headerSub}>Calculate your Body Mass Index</Text>
        </View>

        {/* the Unit toggle */}
        <View style={styles.unitRow}>
          <TouchableOpacity
            style={[styles.unitBtn, unit === 'metric' && styles.unitBtnActive]}
            onPress={() => { setUnit('metric'); setWeight(''); setHeight(''); setResult(null); }}
          >
            <Text style={[styles.unitBtnText, unit === 'metric' && styles.unitBtnTextActive]}>Metric (kg/cm)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.unitBtn, unit === 'imperial' && styles.unitBtnActive]}
            onPress={() => { setUnit('imperial'); setWeight(''); setHeight(''); setResult(null); }}
          >
            <Text style={[styles.unitBtnText, unit === 'imperial' && styles.unitBtnTextActive]}>Imperial (lbs/in)</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Enter Your Details</Text>

          {/* the Weight & Height */}
          <View style={styles.inputRow}>
            <View style={styles.inputHalf}>
              <Text style={styles.fieldLabel}>Weight ({unit === 'metric' ? 'kg' : 'lbs'})</Text>
              <View style={[styles.inputBox, focused === 'weight' && styles.inputFocused]}>
                <TextInput
                  style={styles.inputText}
                  placeholder={unit === 'metric' ? '70' : '155'}
                  placeholderTextColor="rgba(180,230,228,0.3)"
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="decimal-pad"
                  onFocus={() => setFocused('weight')}
                  onBlur={() => setFocused('')}
                />
                <Text style={styles.inputUnit}>{unit === 'metric' ? 'kg' : 'lbs'}</Text>
              </View>
            </View>
            <View style={styles.inputHalf}>
              <Text style={styles.fieldLabel}>Height ({unit === 'metric' ? 'cm' : 'inches'})</Text>
              <View style={[styles.inputBox, focused === 'height' && styles.inputFocused]}>
                <TextInput
                  style={styles.inputText}
                  placeholder={unit === 'metric' ? '170' : '67'}
                  placeholderTextColor="rgba(180,230,228,0.3)"
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="decimal-pad"
                  onFocus={() => setFocused('height')}
                  onBlur={() => setFocused('')}
                />
                <Text style={styles.inputUnit}>{unit === 'metric' ? 'cm' : 'in'}</Text>
              </View>
            </View>
          </View>

          {/* Age & Gender (for BMR) */}
          <Text style={styles.fieldLabel}>Age (optional — for calorie calculation)</Text>
          <View style={[styles.inputBox, focused === 'age' && styles.inputFocused, { marginBottom: 14 }]}>
            <TextInput
              style={[styles.inputText, { flex: 1 }]}
              placeholder="Your age"
              placeholderTextColor="rgba(180,230,228,0.3)"
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
              onFocus={() => setFocused('age')}
              onBlur={() => setFocused('')}
            />
          </View>

          <Text style={styles.fieldLabel}>Gender (optional)</Text>
          <View style={styles.genderRow}>
            {['male', 'female'].map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
                onPress={() => setGender(g)}
              >
                <Text style={styles.genderEmoji}>{g === 'male' ? '👨' : '👩'}</Text>
                <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Activity level */}
          {age && gender ? (
            <>
              <Text style={styles.fieldLabel}>Activity Level (for daily calorie estimate)</Text>
              <View style={styles.activityGrid}>
                {ACTIVITY_LEVELS.map((a) => (
                  <TouchableOpacity
                    key={a.label}
                    style={[styles.activityCard, activityLevel?.label === a.label && styles.activityCardActive]}
                    onPress={() => setActivityLevel(a)}
                  >
                    <Text style={styles.activityEmoji}>{a.emoji}</Text>
                    <Text style={[styles.activityLabel, activityLevel?.label === a.label && styles.activityLabelActive]}>{a.label}</Text>
                    <Text style={styles.activityDesc}>{a.desc}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : null}

          <TouchableOpacity style={styles.calcBtn} onPress={calculateBMI} activeOpacity={0.85}>
            <Text style={styles.calcBtnText}>Calculate BMI ⚖️</Text>
          </TouchableOpacity>
        </View>

        {/* Result */}
        {result && (
          <View style={[styles.resultCard, { borderColor: result.color + '66' }]}>
            <Text style={styles.resultEmoji}>{result.emoji}</Text>
            <Text style={[styles.resultBMI, { color: result.color }]}>{result.bmi}</Text>
            <Text style={styles.resultBMILabel}>BMI Score</Text>
            <Text style={[styles.resultLabel, { color: result.color }]}>{result.label}</Text>
            <Text style={styles.resultTip}>{result.tip}</Text>

            {result.bmr && (
              <View style={styles.calorieSplit}>
                <View style={styles.calorieBox}>
                  <Text style={styles.calorieValue}>{result.bmr}</Text>
                  <Text style={styles.calorieLabel}>BMR (kcal/day)</Text>
                  <Text style={styles.calorieDesc}>Calories at rest</Text>
                </View>
                {result.tdee && (
                  <View style={styles.calorieBox}>
                    <Text style={[styles.calorieValue, { color: '#1ABFB8' }]}>{result.tdee}</Text>
                    <Text style={styles.calorieLabel}>TDEE (kcal/day)</Text>
                    <Text style={styles.calorieDesc}>Daily needs</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* BMI Scale */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>BMI Reference Scale</Text>
          {[
            { label: 'Severely Underweight', range: 'Below 16', color: '#EF5350' },
            { label: 'Underweight', range: '16 – 18.4', color: '#FF7043' },
            { label: 'Normal Weight', range: '18.5 – 24.9', color: '#1ABFB8' },
            { label: 'Overweight', range: '25 – 29.9', color: '#FFB74D' },
            { label: 'Obese Class I', range: '30 – 34.9', color: '#FF7043' },
            { label: 'Obese Class II', range: '35 – 39.9', color: '#EF5350' },
            { label: 'Severely Obese', range: '40 and above', color: '#B71C1C' },
          ].map((r) => (
            <View key={r.label} style={styles.scaleRow}>
              <View style={[styles.scaleDot, { backgroundColor: r.color }]} />
              <Text style={[styles.scaleLabel, { color: r.color }]}>{r.label}</Text>
              <Text style={styles.scaleRange}>{r.range}</Text>
            </View>
          ))}
        </View>

        {/* History */}
        {history.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📈 BMI History</Text>
            {history.map((h) => (
              <View key={h.id} style={styles.histCard}>
                <View>
                  <Text style={[styles.histBMI, { color: h.color }]}>{h.bmi}</Text>
                  <Text style={styles.histStats}>{h.weightKg}kg · {h.heightCm}cm</Text>
                  <Text style={styles.histDate}>{formatDate(h.date)}</Text>
                </View>
                <View style={[styles.histBadge, { backgroundColor: h.color + '22', borderColor: h.color + '55' }]}>
                  <Text style={[styles.histBadgeText, { color: h.color }]}>{h.label}</Text>
                </View>
              </View>
            ))}
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
  unitRow: {
    flexDirection: 'row', margin: 22, gap: 10,
    backgroundColor: 'rgba(14,124,123,0.15)', borderRadius: 14, padding: 4,
  },
  unitBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  unitBtnActive: { backgroundColor: '#0E7C7B' },
  unitBtnText: { color: 'rgba(180,230,228,0.6)', fontWeight: '600', fontSize: 13 },
  unitBtnTextActive: { color: '#FFFFFF' },
  card: {
    marginHorizontal: 22, marginBottom: 18,
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: 'rgba(26,191,184,0.18)',
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginBottom: 16 },
  inputRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  inputHalf: { flex: 1 },
  fieldLabel: { color: 'rgba(180,230,228,0.75)', fontSize: 13, fontWeight: '600', marginBottom: 8 },
  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(14,124,123,0.15)', borderRadius: 14,
    borderWidth: 1.5, borderColor: 'rgba(26,191,184,0.2)',
    paddingHorizontal: 14, height: 52,
  },
  inputFocused: { borderColor: '#1ABFB8', backgroundColor: 'rgba(14,124,123,0.25)' },
  inputText: { flex: 1, color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  inputUnit: { color: '#1ABFB8', fontSize: 13, fontWeight: '700' },
  genderRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  genderBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 12, borderRadius: 14,
    backgroundColor: 'rgba(14,124,123,0.12)',
    borderWidth: 1.5, borderColor: 'rgba(26,191,184,0.2)',
  },
  genderBtnActive: { backgroundColor: 'rgba(14,124,123,0.35)', borderColor: '#1ABFB8' },
  genderEmoji: { fontSize: 20 },
  genderText: { color: 'rgba(180,230,228,0.7)', fontWeight: '600', fontSize: 14 },
  genderTextActive: { color: '#FFFFFF' },
  activityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  activityCard: {
    width: '30%', borderRadius: 14, padding: 10, alignItems: 'center',
    backgroundColor: 'rgba(14,124,123,0.12)',
    borderWidth: 1.5, borderColor: 'rgba(26,191,184,0.18)',
  },
  activityCardActive: { backgroundColor: 'rgba(14,124,123,0.35)', borderColor: '#1ABFB8' },
  activityEmoji: { fontSize: 22, marginBottom: 4 },
  activityLabel: { color: 'rgba(180,230,228,0.75)', fontSize: 11, fontWeight: '700', textAlign: 'center' },
  activityLabelActive: { color: '#FFFFFF' },
  activityDesc: { color: 'rgba(180,230,228,0.4)', fontSize: 10, textAlign: 'center', marginTop: 2 },
  calcBtn: {
    backgroundColor: '#0E7C7B', borderRadius: 14, height: 54,
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
    borderWidth: 1, borderColor: '#1ABFB8',
    shadowColor: '#1ABFB8', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 8,
  },
  calcBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  resultCard: {
    marginHorizontal: 22, marginBottom: 18,
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 22,
    borderWidth: 1.5, alignItems: 'center',
  },
  resultEmoji: { fontSize: 44, marginBottom: 8 },
  resultBMI: { fontSize: 52, fontWeight: '900', lineHeight: 56 },
  resultBMILabel: { color: 'rgba(180,230,228,0.55)', fontSize: 13, marginBottom: 8 },
  resultLabel: { fontSize: 20, fontWeight: '800', marginBottom: 12 },
  resultTip: { color: 'rgba(255,255,255,0.8)', fontSize: 13, textAlign: 'center', lineHeight: 21, marginBottom: 16 },
  calorieSplit: { flexDirection: 'row', gap: 12, width: '100%' },
  calorieBox: {
    flex: 1, backgroundColor: 'rgba(14,124,123,0.2)', borderRadius: 14,
    padding: 14, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(26,191,184,0.2)',
  },
  calorieValue: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginBottom: 3 },
  calorieLabel: { color: 'rgba(180,230,228,0.7)', fontSize: 11, fontWeight: '700', marginBottom: 2 },
  calorieDesc: { color: 'rgba(180,230,228,0.45)', fontSize: 10 },
  scaleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  scaleDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  scaleLabel: { fontSize: 12, fontWeight: '700', flex: 1 },
  scaleRange: { color: 'rgba(180,230,228,0.55)', fontSize: 12 },
  section: { paddingHorizontal: 22, marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginBottom: 12 },
  histCard: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 14,
    marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(26,191,184,0.12)',
  },
  histBMI: { fontSize: 24, fontWeight: '900', marginBottom: 2 },
  histStats: { color: 'rgba(180,230,228,0.6)', fontSize: 12, marginBottom: 2 },
  histDate: { color: 'rgba(180,230,228,0.4)', fontSize: 11 },
  histBadge: {
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6,
    borderWidth: 1, maxWidth: 120,
  },
  histBadgeText: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
});