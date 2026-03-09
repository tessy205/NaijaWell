import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  ScrollView, Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 44;
const BAR_MAX_HEIGHT = 100;

const TABS = ['Water', 'Sleep', 'BP', 'Stress', 'BMI', 'Fever'];

export default function ProgressScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('Water');
  const [waterData, setWaterData] = useState([]);
  const [sleepData, setSleepData] = useState([]);
  const [bpData, setBpData] = useState([]);
  const [stressData, setStressData] = useState([]);
  const [bmiData, setBmiData] = useState([]);
  const [feverData, setFeverData] = useState([]);

  useEffect(() => { loadAllData(); }, []);

  const loadAllData = async () => {
    try {
      // Load last 7 days water
      const waterEntries = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        const raw = await AsyncStorage.getItem(`naijawell_water_${key}`);
        const parsed = raw ? JSON.parse(raw) : null;
        waterEntries.push({
          label: d.toLocaleDateString('en-NG', { weekday: 'short' }),
          value: parsed?.glasses || 0,
          max: 8,
        });
      }
      setWaterData(waterEntries);

      // Sleep
      const sleepRaw = await AsyncStorage.getItem('naijawell_sleep_logs');
      const sleepLogs = sleepRaw ? JSON.parse(sleepRaw).slice(0, 7).reverse() : [];
      setSleepData(sleepLogs.map((l, i) => ({
        label: new Date(l.date).toLocaleDateString('en-NG', { weekday: 'short' }),
        value: l.hours,
        max: 10,
        color: l.qualityColor,
      })));

      // BP
      const bpRaw = await AsyncStorage.getItem('naijawell_bp_logs');
      const bpLogs = bpRaw ? JSON.parse(bpRaw).slice(0, 7).reverse() : [];
      setBpData(bpLogs.map((l) => ({
        label: new Date(l.date).toLocaleDateString('en-NG', { weekday: 'short' }),
        systolic: l.systolic,
        diastolic: l.diastolic,
        color: l.color,
      })));

      // Stress
      const stressRaw = await AsyncStorage.getItem('naijawell_stress_logs');
      const stressLogs = stressRaw ? JSON.parse(stressRaw).slice(0, 7).reverse() : [];
      setStressData(stressLogs.map((l) => ({
        label: new Date(l.date).toLocaleDateString('en-NG', { weekday: 'short' }),
        value: l.stressLevel,
        max: 5,
        color: l.color,
        emoji: l.emoji,
      })));

      // BMI
      const bmiRaw = await AsyncStorage.getItem('naijawell_bmi_history');
      const bmiLogs = bmiRaw ? JSON.parse(bmiRaw).slice(0, 6).reverse() : [];
      setBmiData(bmiLogs.map((l) => ({
        label: new Date(l.date).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' }),
        value: l.bmi,
        max: 40,
        color: l.color,
      })));

      // Fever
      const feverRaw = await AsyncStorage.getItem('naijawell_fever_logs');
      const feverLogs = feverRaw ? JSON.parse(feverRaw).slice(0, 7).reverse() : [];
      setFeverData(feverLogs.map((l) => ({
        label: new Date(l.date).toLocaleDateString('en-NG', { weekday: 'short' }),
        value: l.tempC,
        max: 42,
        color: l.color,
      })));

    } catch (e) {}
  };

  const BarChart = ({ data, unit, goal, goalLabel }) => {
    if (!data || data.length === 0) return <EmptyChart />;
    const maxVal = Math.max(...data.map((d) => d.value), goal || 1);
    return (
      <View style={styles.chartContainer}>
        {goal && (
          <View style={[styles.goalLine, { bottom: (goal / maxVal) * BAR_MAX_HEIGHT + 28 }]}>
            <Text style={styles.goalLineText}>Goal: {goalLabel || goal}{unit}</Text>
          </View>
        )}
        <View style={styles.barsRow}>
          {data.map((d, i) => {
            const barH = Math.max((d.value / maxVal) * BAR_MAX_HEIGHT, 4);
            const color = d.color || '#1ABFB8';
            return (
              <View key={i} style={styles.barWrapper}>
                <Text style={styles.barTopValue}>{d.value}{unit}</Text>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { height: barH, backgroundColor: color }]} />
                </View>
                <Text style={styles.barLabel}>{d.label}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const BPChart = ({ data }) => {
    if (!data || data.length === 0) return <EmptyChart />;
    return (
      <View style={styles.chartContainer}>
        <View style={styles.barsRow}>
          {data.map((d, i) => {
            const sysH = Math.max((d.systolic / 200) * BAR_MAX_HEIGHT, 4);
            const diaH = Math.max((d.diastolic / 200) * BAR_MAX_HEIGHT, 4);
            return (
              <View key={i} style={styles.barWrapper}>
                <Text style={[styles.barTopValue, { color: d.color, fontSize: 9 }]}>
                  {d.systolic}/{d.diastolic}
                </Text>
                <View style={[styles.barBg, { flexDirection: 'row', gap: 2 }]}>
                  <View style={[styles.barFill, { height: sysH, flex: 1, backgroundColor: '#EF5350' }]} />
                  <View style={[styles.barFill, { height: diaH, flex: 1, backgroundColor: '#FF8A65' }]} />
                </View>
                <Text style={styles.barLabel}>{d.label}</Text>
              </View>
            );
          })}
        </View>
        <View style={styles.bpLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#EF5350' }]} />
            <Text style={styles.legendText}>Systolic</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FF8A65' }]} />
            <Text style={styles.legendText}>Diastolic</Text>
          </View>
        </View>
      </View>
    );
  };

  const EmptyChart = () => (
    <View style={styles.emptyChart}>
      <Text style={styles.emptyChartEmoji}>📊</Text>
      <Text style={styles.emptyChartText}>No data yet. Start logging to see your progress!</Text>
    </View>
  );

  const getSummaryStats = () => {
    switch (activeTab) {
      case 'Water': {
        if (!waterData.length) return null;
        const avg = (waterData.reduce((a, d) => a + d.value, 0) / waterData.length).toFixed(1);
        const best = Math.max(...waterData.map((d) => d.value));
        const daysHit = waterData.filter((d) => d.value >= 8).length;
        return [
          { label: '7-Day Avg', value: `${avg}`, unit: 'glasses' },
          { label: 'Best Day', value: `${best}`, unit: 'glasses' },
          { label: 'Goal Hit', value: `${daysHit}/7`, unit: 'days' },
        ];
      }
      case 'Sleep': {
        if (!sleepData.length) return null;
        const avg = (sleepData.reduce((a, d) => a + d.value, 0) / sleepData.length).toFixed(1);
        const best = Math.max(...sleepData.map((d) => d.value));
        return [
          { label: 'Avg Sleep', value: avg, unit: 'hrs' },
          { label: 'Best Night', value: best, unit: 'hrs' },
          { label: 'Logs', value: sleepData.length, unit: 'entries' },
        ];
      }
      case 'Stress': {
        if (!stressData.length) return null;
        const avg = (stressData.reduce((a, d) => a + d.value, 0) / stressData.length).toFixed(1);
        const best = Math.min(...stressData.map((d) => d.value));
        return [
          { label: 'Avg Stress', value: `${avg}/5`, unit: '' },
          { label: 'Best Day', value: `${best}/5`, unit: '' },
          { label: 'Logs', value: stressData.length, unit: 'entries' },
        ];
      }
      default: return null;
    }
  };

  const renderChart = () => {
    switch (activeTab) {
      case 'Water': return <BarChart data={waterData} unit="" goal={8} goalLabel="8 glasses" />;
      case 'Sleep': return <BarChart data={sleepData} unit="h" goal={7} goalLabel="7h" />;
      case 'BP': return <BPChart data={bpData} />;
      case 'Stress': return <BarChart data={stressData} unit="" />;
      case 'BMI': return <BarChart data={bmiData} unit="" />;
      case 'Fever': return <BarChart data={feverData} unit="°" goal={37.2} goalLabel="37.2°" />;
      default: return <EmptyChart />;
    }
  };

  const summaryStats = getSummaryStats();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D2B2B" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>📊 Progress Charts</Text>
          <Text style={styles.headerSub}>Visualise your health trends over time</Text>
        </View>

        {/* Tab selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll} contentContainerStyle={styles.tabContent}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Summary stats */}
        {summaryStats && (
          <View style={styles.statsRow}>
            {summaryStats.map((s, i) => (
              <View key={i} style={styles.statBox}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statUnit}>{s.unit}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Chart card */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>{activeTab} — Last 7 Entries</Text>
          {renderChart()}
        </View>

        {/* Naija health insight */}
        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>🇳🇬 Health Insight</Text>
          <Text style={styles.insightText}>
            {activeTab === 'Water' && 'In Nigeria\'s hot climate, consistent hydration lowers your risk of kidney stones, UTIs and heat exhaustion. Keep your 8-glass streak going!'}
            {activeTab === 'Sleep' && 'Poor sleep worsens malaria symptoms, raises blood pressure and weakens immunity. Nigerians who sleep well live longer — protect your rest time.'}
            {activeTab === 'BP' && 'Hypertension kills silently. One in three Nigerian adults has high BP. Consistent logging helps you spot trends before they become emergencies.'}
            {activeTab === 'Stress' && 'Chronic stress in Nigerian urban centres increases cortisol, raises BP and affects digestion. Tracking your stress is the first step to managing it.'}
            {activeTab === 'BMI' && 'As Nigeria urbanises, obesity rates are rising — especially in Lagos and Abuja. Tracking BMI with diet changes gives you a clear health roadmap.'}
            {activeTab === 'Fever' && 'In malaria-endemic regions like Nigeria, fever above 38°C should always trigger a Rapid Diagnostic Test. Early treatment saves lives.'}
          </Text>
        </View>

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
  headerSub: { fontSize: 13, color: 'rgba(180,230,228,0.6)' },
  tabScroll: { maxHeight: 52 },
  tabContent: { paddingHorizontal: 22, paddingVertical: 10, gap: 8 },
  tab: {
    paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20,
    backgroundColor: 'rgba(14,124,123,0.15)',
    borderWidth: 1, borderColor: 'rgba(26,191,184,0.2)',
  },
  tabActive: { backgroundColor: '#0E7C7B', borderColor: '#1ABFB8' },
  tabText: { color: 'rgba(180,230,228,0.7)', fontWeight: '600', fontSize: 13 },
  tabTextActive: { color: '#FFFFFF' },
  statsRow: {
    flexDirection: 'row', marginHorizontal: 22, marginTop: 16,
    backgroundColor: 'rgba(14,124,123,0.18)', borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: 'rgba(26,191,184,0.18)',
  },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { color: '#1ABFB8', fontSize: 17, fontWeight: '800' },
  statUnit: { color: 'rgba(180,230,228,0.5)', fontSize: 10, marginBottom: 2 },
  statLabel: { color: 'rgba(180,230,228,0.6)', fontSize: 11 },
  chartCard: {
    marginHorizontal: 22, marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: 'rgba(26,191,184,0.18)',
  },
  chartTitle: { fontSize: 15, fontWeight: '700', color: '#FFFFFF', marginBottom: 20 },
  chartContainer: { position: 'relative' },
  barsRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    justifyContent: 'space-around', height: BAR_MAX_HEIGHT + 50,
    paddingTop: 20,
  },
  barWrapper: { alignItems: 'center', flex: 1 },
  barTopValue: { color: 'rgba(180,230,228,0.7)', fontSize: 10, fontWeight: '700', marginBottom: 4 },
  barBg: {
    width: '70%', height: BAR_MAX_HEIGHT,
    backgroundColor: 'rgba(14,124,123,0.15)',
    borderRadius: 6, overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: { width: '100%', borderRadius: 6 },
  barLabel: { color: 'rgba(180,230,228,0.55)', fontSize: 10, marginTop: 6, fontWeight: '600' },
  goalLine: {
    position: 'absolute', left: 0, right: 0,
    borderTopWidth: 1, borderColor: 'rgba(26,191,184,0.4)',
    borderStyle: 'dashed', zIndex: 10,
  },
  goalLineText: {
    position: 'absolute', right: 0, top: -14,
    color: '#1ABFB8', fontSize: 9, fontWeight: '700',
    backgroundColor: '#0D2B2B', paddingHorizontal: 4,
  },
  bpLegend: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: 'rgba(180,230,228,0.6)', fontSize: 11 },
  emptyChart: {
    height: 140, alignItems: 'center', justifyContent: 'center',
  },
  emptyChartEmoji: { fontSize: 36, marginBottom: 10 },
  emptyChartText: { color: 'rgba(180,230,228,0.5)', fontSize: 13, textAlign: 'center' },
  insightCard: {
    marginHorizontal: 22, marginTop: 16,
    backgroundColor: 'rgba(14,124,123,0.15)', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: 'rgba(26,191,184,0.2)',
  },
  insightTitle: { color: '#1ABFB8', fontWeight: '700', fontSize: 14, marginBottom: 6 },
  insightText: { color: 'rgba(255,255,255,0.75)', fontSize: 13, lineHeight: 21 },
});