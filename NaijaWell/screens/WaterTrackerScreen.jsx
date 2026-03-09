import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, ScrollView, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DAILY_GOAL = 8;
const WATER_SOURCES = ['Sachet Water', 'Bottled Water', 'Tap Water', 'Borehole', 'Well Water', 'Filtered Water'];
const AMOUNTS = [
  { label: '1 glass', value: 1, emoji: '🥛' },
  { label: '2 glasses', value: 2, emoji: '🥛🥛' },
  { label: '500ml bottle', value: 2, emoji: '🍶' },
  { label: '1L bottle', value: 4, emoji: '🍾' },
];

export default function WaterTrackerScreen({ navigation }) {
  const [glasses, setGlasses] = useState(0);
  const [logs, setLogs] = useState([]);
  const [selectedSource, setSelectedSource] = useState('');
  const [todayKey, setTodayKey] = useState('');

  useEffect(() => {
    const key = new Date().toISOString().split('T')[0];
    setTodayKey(key);
    loadData(key);
  }, []);

  const loadData = async (key) => {
    try {
      const saved = await AsyncStorage.getItem(`naijawell_water_${key}`);
      if (saved) {
        const data = JSON.parse(saved);
        setGlasses(data.glasses || 0);
        setLogs(data.logs || []);
      }
    } catch {}
  };

  const saveData = async (newGlasses, newLogs) => {
    try {
      await AsyncStorage.setItem(
        `naijawell_water_${todayKey}`,
        JSON.stringify({ glasses: newGlasses, logs: newLogs })
      );
    } catch {}
  };

  const addWater = async (amount, label, emoji) => {
    if (!selectedSource) {
      Alert.alert('Select Water Source', 'Please select your water source before logging.');
      return;
    }
    const newGlasses = Math.min(glasses + amount, 20);
    const entry = {
      id: Date.now().toString(),
      amount,
      label,
      emoji,
      source: selectedSource,
      time: new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }),
    };
    const newLogs = [entry, ...logs];
    setGlasses(newGlasses);
    setLogs(newLogs);
    await saveData(newGlasses, newLogs);

    if (newGlasses === DAILY_GOAL) {
      Alert.alert('🎉 Goal Reached!', 'You have hit your 8 glasses daily water target. Well done!');
    }
  };

  const removeLog = async (id, amount) => {
    Alert.alert('Remove Entry', 'Remove this water log?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          const newLogs = logs.filter((l) => l.id !== id);
          const newGlasses = Math.max(0, glasses - amount);
          setLogs(newLogs);
          setGlasses(newGlasses);
          await saveData(newGlasses, newLogs);
        },
      },
    ]);
  };

  const resetDay = async () => {
    Alert.alert('Reset Today', 'Clear all water logs for today?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset', style: 'destructive',
        onPress: async () => {
          setGlasses(0);
          setLogs([]);
          await saveData(0, []);
        },
      },
    ]);
  };

  const percent = Math.min((glasses / DAILY_GOAL) * 100, 100);
  const remaining = Math.max(DAILY_GOAL - glasses, 0);

  const getStatusColor = () => {
    if (percent >= 100) return '#1ABFB8';
    if (percent >= 60) return '#81C784';
    if (percent >= 30) return '#FFB74D';
    return '#EF5350';
  };

  const getStatusLabel = () => {
    if (percent >= 100) return '🎉 Daily goal reached!';
    if (percent >= 75) return '💪 Almost there!';
    if (percent >= 50) return '👍 Halfway done';
    if (percent >= 25) return '⚠️ Keep going';
    return '🚨 Drink more water!';
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
          <Text style={styles.headerTitle}>💧 Water Intake Tracker</Text>
          <Text style={styles.headerSub}>
            {new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
        </View>

        {/* Main progress circle */}
        <View style={styles.progressSection}>
          <View style={styles.circleOuter}>
            <View style={styles.circleInner}>
              <Text style={styles.circleEmoji}>💧</Text>
              <Text style={[styles.circleCount, { color: getStatusColor() }]}>{glasses}</Text>
              <Text style={styles.circleLabel}>of {DAILY_GOAL} glasses</Text>
            </View>
          </View>
          <Text style={[styles.statusLabel, { color: getStatusColor() }]}>{getStatusLabel()}</Text>
          {remaining > 0 && (
            <Text style={styles.remainingText}>{remaining} more glass{remaining > 1 ? 'es' : ''} to go</Text>
          )}

          {/* Progress bar */}
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${percent}%`, backgroundColor: getStatusColor() }]} />
          </View>
          <Text style={styles.percentText}>{Math.round(percent)}% of daily goal</Text>
        </View>

        {/* Nigerian water tip */}
        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>💡 Naija Health Tip</Text>
          <Text style={styles.tipText}>
            In Nigeria's hot climate, you may need more than 8 glasses daily — especially if you're in Lagos, Abuja, or doing physical work outside. Sachet water is common but always check the NAFDAC number on the bag.
          </Text>
        </View>

        {/* Water source selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Water Source</Text>
          <View style={styles.sourcesGrid}>
            {WATER_SOURCES.map((src) => (
              <TouchableOpacity
                key={src}
                style={[styles.sourceChip, selectedSource === src && styles.sourceChipActive]}
                onPress={() => setSelectedSource(src)}
              >
                <Text style={[styles.sourceText, selectedSource === src && styles.sourceTextActive]}>
                  {src === 'Sachet Water' ? '💦 ' : src === 'Bottled Water' ? '🍶 ' : '🚿 '}{src}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Add water buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Water</Text>
          <View style={styles.amountsGrid}>
            {AMOUNTS.map((a) => (
              <TouchableOpacity
                key={a.label}
                style={styles.amountCard}
                onPress={() => addWater(a.value, a.label, a.emoji)}
                activeOpacity={0.75}
              >
                <Text style={styles.amountEmoji}>{a.emoji}</Text>
                <Text style={styles.amountLabel}>{a.label}</Text>
                <Text style={styles.amountSub}>+{a.value} glass{a.value > 1 ? 'es' : ''}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Glass bubbles visualizer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Progress</Text>
          <View style={styles.bubblesGrid}>
            {Array.from({ length: DAILY_GOAL }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.bubble,
                  i < glasses ? styles.bubbleFilled : styles.bubbleEmpty,
                ]}
              >
                <Text style={styles.bubbleEmoji}>{i < glasses ? '💧' : '○'}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Today's logs */}
        {logs.length > 0 && (
          <View style={styles.section}>
            <View style={styles.logHeader}>
              <Text style={styles.sectionTitle}>Today's Log</Text>
              <TouchableOpacity onPress={resetDay}>
                <Text style={styles.resetText}>Reset</Text>
              </TouchableOpacity>
            </View>
            {logs.map((log) => (
              <TouchableOpacity
                key={log.id}
                style={styles.logCard}
                onLongPress={() => removeLog(log.id, log.amount)}
                activeOpacity={0.8}
              >
                <Text style={styles.logEmoji}>{log.emoji}</Text>
                <View style={styles.logInfo}>
                  <Text style={styles.logLabel}>{log.label}</Text>
                  <Text style={styles.logSource}>📍 {log.source}</Text>
                </View>
                <Text style={styles.logTime}>{log.time}</Text>
              </TouchableOpacity>
            ))}
            <Text style={styles.hint}>Long press to remove an entry</Text>
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
  headerSub: { fontSize: 13, color: 'rgba(180,230,228,0.6)' },
  progressSection: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 22 },
  circleOuter: {
    width: 160, height: 160, borderRadius: 80,
    borderWidth: 3, borderColor: 'rgba(26,191,184,0.3)',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(14,124,123,0.15)',
    shadowColor: '#1ABFB8', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, shadowRadius: 20, elevation: 10,
    marginBottom: 16,
  },
  circleInner: { alignItems: 'center' },
  circleEmoji: { fontSize: 28, marginBottom: 4 },
  circleCount: { fontSize: 38, fontWeight: '900', lineHeight: 42 },
  circleLabel: { color: 'rgba(180,230,228,0.6)', fontSize: 12 },
  statusLabel: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  remainingText: { color: 'rgba(180,230,228,0.55)', fontSize: 13, marginBottom: 14 },
  progressBarBg: {
    width: '80%', height: 8, backgroundColor: 'rgba(14,124,123,0.25)',
    borderRadius: 4, overflow: 'hidden', marginBottom: 6,
  },
  progressBarFill: { height: '100%', borderRadius: 4 },
  percentText: { color: 'rgba(180,230,228,0.5)', fontSize: 12 },
  tipBox: {
    marginHorizontal: 22, backgroundColor: 'rgba(14,124,123,0.18)',
    borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: 'rgba(26,191,184,0.2)',
    marginBottom: 6,
  },
  tipTitle: { color: '#1ABFB8', fontWeight: '700', fontSize: 13, marginBottom: 5 },
  tipText: { color: 'rgba(255,255,255,0.7)', fontSize: 12, lineHeight: 19 },
  section: { paddingHorizontal: 22, marginTop: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#FFFFFF', marginBottom: 12 },
  sourcesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sourceChip: {
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20,
    backgroundColor: 'rgba(14,124,123,0.15)',
    borderWidth: 1, borderColor: 'rgba(26,191,184,0.2)',
  },
  sourceChipActive: { backgroundColor: 'rgba(14,124,123,0.4)', borderColor: '#1ABFB8' },
  sourceText: { color: 'rgba(180,230,228,0.75)', fontSize: 13, fontWeight: '500' },
  sourceTextActive: { color: '#FFFFFF', fontWeight: '700' },
  amountsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  amountCard: {
    width: '47%', backgroundColor: 'rgba(14,124,123,0.15)',
    borderRadius: 18, padding: 16, alignItems: 'center',
    borderWidth: 1.5, borderColor: 'rgba(26,191,184,0.2)',
  },
  amountEmoji: { fontSize: 30, marginBottom: 8 },
  amountLabel: { color: '#FFFFFF', fontWeight: '700', fontSize: 14, marginBottom: 3 },
  amountSub: { color: '#1ABFB8', fontSize: 12, fontWeight: '600' },
  bubblesGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    justifyContent: 'center',
  },
  bubble: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  bubbleFilled: { backgroundColor: 'rgba(26,191,184,0.25)', borderWidth: 1.5, borderColor: '#1ABFB8' },
  bubbleEmpty: { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(26,191,184,0.15)' },
  bubbleEmoji: { fontSize: 20 },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  resetText: { color: '#EF5350', fontSize: 13, fontWeight: '700' },
  logCard: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16,
    padding: 14, marginBottom: 10, flexDirection: 'row',
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(26,191,184,0.12)',
  },
  logEmoji: { fontSize: 26, marginRight: 12 },
  logInfo: { flex: 1 },
  logLabel: { color: '#FFFFFF', fontWeight: '700', fontSize: 14, marginBottom: 3 },
  logSource: { color: 'rgba(180,230,228,0.55)', fontSize: 12 },
  logTime: { color: '#1ABFB8', fontSize: 12, fontWeight: '600' },
  hint: { color: 'rgba(180,230,228,0.35)', fontSize: 11, textAlign: 'center', marginTop: 6 },
});