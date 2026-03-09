import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  ScrollView, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CATEGORIES = [
  { key: 'bp', label: 'Blood Pressure', emoji: '❤️', storageKey: 'naijawell_bp_logs' },
  { key: 'fever', label: 'Fever Log', emoji: '🌡️', storageKey: 'naijawell_fever_logs' },
  { key: 'bmi', label: 'BMI History', emoji: '⚖️', storageKey: 'naijawell_bmi_history' },
  { key: 'malaria', label: 'Malaria Checks', emoji: '🦟', storageKey: 'naijawell_malaria_logs' },
  { key: 'stress', label: 'Stress Journal', emoji: '😓', storageKey: 'naijawell_stress_logs' },
  { key: 'sleep', label: 'Sleep Log', emoji: '😴', storageKey: 'naijawell_sleep_logs' },
  { key: 'medicine', label: 'Medicines', emoji: '💊', storageKey: 'naijawell_medicine_reminders' },
];

const formatDate = (iso) => new Date(iso).toLocaleDateString('en-NG', {
  weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
}) + ' · ' + new Date(iso).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });

export default function HealthHistoryScreen({ navigation }) {
  const [activeCategory, setActiveCategory] = useState('bp');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadData(activeCategory); }, [activeCategory]);

  const loadData = async (key) => {
    setLoading(true);
    setData([]);
    try {
      const cat = CATEGORIES.find((c) => c.key === key);
      const raw = await AsyncStorage.getItem(cat.storageKey);
      if (raw) setData(JSON.parse(raw));
    } catch {}
    setLoading(false);
  };

  const clearCategoryData = () => {
    const cat = CATEGORIES.find((c) => c.key === activeCategory);
    Alert.alert(`Clear ${cat.label}`, `Permanently delete all ${cat.label} records?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All', style: 'destructive',
        onPress: async () => {
          try { await AsyncStorage.removeItem(cat.storageKey); setData([]); } catch {}
        },
      },
    ]);
  };

  const renderEntry = (item, index) => {
    switch (activeCategory) {
      case 'bp':
        return (
          <View key={item.id || index} style={styles.entryCard}>
            <View style={styles.entryLeft}>
              <Text style={[styles.entryMain, { color: item.color }]}>{item.systolic}/{item.diastolic} mmHg</Text>
              {item.pulse && <Text style={styles.entrySub}>💓 {item.pulse} bpm</Text>}
              <Text style={styles.entryDate}>{formatDate(item.date)}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: item.color + '22', borderColor: item.color + '55' }]}>
              <Text style={[styles.badgeText, { color: item.color }]}>{item.classification}</Text>
            </View>
          </View>
        );
      case 'fever':
        return (
          <View key={item.id || index} style={styles.entryCard}>
            <View style={styles.entryLeft}>
              <Text style={[styles.entryMain, { color: item.color }]}>{item.tempDisplay}</Text>
              {item.notes?.length > 0 && <Text style={styles.entrySub} numberOfLines={1}>{item.notes.join(', ')}</Text>}
              <Text style={styles.entryDate}>{formatDate(item.date)}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: item.color + '22', borderColor: item.color + '55' }]}>
              <Text style={[styles.badgeText, { color: item.color }]}>{item.classification}</Text>
            </View>
          </View>
        );
      case 'bmi':
        return (
          <View key={item.id || index} style={styles.entryCard}>
            <View style={styles.entryLeft}>
              <Text style={[styles.entryMain, { color: item.color }]}>BMI {item.bmi}</Text>
              <Text style={styles.entrySub}>{item.weightKg}kg · {item.heightCm}cm</Text>
              <Text style={styles.entryDate}>{formatDate(item.date)}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: item.color + '22', borderColor: item.color + '55' }]}>
              <Text style={[styles.badgeText, { color: item.color }]}>{item.label}</Text>
            </View>
          </View>
        );
      case 'malaria':
        return (
          <View key={item.date + index} style={styles.entryCard}>
            <View style={styles.entryLeft}>
              <Text style={styles.entryMain}>{item.symptoms?.length || 0} symptoms</Text>
              {item.duration && <Text style={styles.entrySub}>Duration: {item.duration}</Text>}
              <Text style={styles.entryDate}>{formatDate(item.date)}</Text>
            </View>
            <View style={[styles.badge, {
              backgroundColor: item.riskLevel?.includes('High') ? 'rgba(239,83,80,0.2)' : 'rgba(255,183,77,0.2)',
              borderColor: item.riskLevel?.includes('High') ? '#EF5350' : '#FFB74D',
            }]}>
              <Text style={[styles.badgeText, { color: item.riskLevel?.includes('High') ? '#EF5350' : '#FFB74D' }]}>
                {item.riskLevel}
              </Text>
            </View>
          </View>
        );
      case 'stress':
        return (
          <View key={item.id || index} style={styles.entryCard}>
            <Text style={styles.entryEmoji}>{item.emoji}</Text>
            <View style={styles.entryLeft}>
              <Text style={[styles.entryMain, { color: item.color }]}>{item.label} ({item.stressLevel}/5)</Text>
              {item.triggers?.length > 0 && <Text style={styles.entrySub} numberOfLines={1}>{item.triggers.join(', ')}</Text>}
              <Text style={styles.entryDate}>{formatDate(item.date)}</Text>
            </View>
          </View>
        );
      case 'sleep':
        return (
          <View key={item.id || index} style={styles.entryCard}>
            <Text style={styles.entryEmoji}>{item.qualityEmoji}</Text>
            <View style={styles.entryLeft}>
              <Text style={[styles.entryMain, { color: item.qualityColor }]}>{item.hoursDisplay}h — {item.qualityLabel}</Text>
              {(item.bedTime || item.wakeTime) && <Text style={styles.entrySub}>{item.bedTime} → {item.wakeTime}</Text>}
              <Text style={styles.entryDate}>{formatDate(item.date)}</Text>
            </View>
          </View>
        );
      case 'medicine':
        return (
          <View key={item.id || index} style={styles.entryCard}>
            <Text style={styles.entryEmoji}>💊</Text>
            <View style={styles.entryLeft}>
              <Text style={styles.entryMain}>{item.name}</Text>
              <Text style={styles.entrySub}>{item.frequency} · {item.times?.join(', ')}</Text>
              {item.nafdacNum ? <Text style={styles.nafdacText}>NAFDAC: {item.nafdacNum}</Text> : null}
              <Text style={styles.entryDate}>Added: {formatDate(item.createdAt)}</Text>
            </View>
            <View style={[styles.badge, {
              backgroundColor: item.active ? 'rgba(26,191,184,0.15)' : 'rgba(239,83,80,0.15)',
              borderColor: item.active ? '#1ABFB8' : '#EF5350',
            }]}>
              <Text style={[styles.badgeText, { color: item.active ? '#1ABFB8' : '#EF5350' }]}>
                {item.active ? 'Active' : 'Off'}
              </Text>
            </View>
          </View>
        );
      default: return null;
    }
  };

  const activeCat = CATEGORIES.find((c) => c.key === activeCategory);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D2B2B" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📋 Health History</Text>
        <Text style={styles.headerSub}>Full log of all your health records</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={styles.catContent}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[styles.catChip, activeCategory === cat.key && styles.catChipActive]}
            onPress={() => setActiveCategory(cat.key)}
          >
            <Text style={styles.catEmoji}>{cat.emoji}</Text>
            <Text style={[styles.catText, activeCategory === cat.key && styles.catTextActive]}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{activeCat.emoji} {activeCat.label} ({data.length})</Text>
          {data.length > 0 && (
            <TouchableOpacity onPress={clearCategoryData}>
              <Text style={styles.clearText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.centered}><Text style={styles.loadingText}>Loading...</Text></View>
        ) : data.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyEmoji}>{activeCat.emoji}</Text>
            <Text style={styles.emptyTitle}>No {activeCat.label} records yet</Text>
            <Text style={styles.emptyText}>Start using this feature to build your history</Text>
          </View>
        ) : (
          data.map((item, i) => renderEntry(item, i))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D2B2B' },
  header: {
    paddingTop: 58, paddingHorizontal: 22, paddingBottom: 20,
    borderBottomWidth: 1, borderBottomColor: 'rgba(26,191,184,0.1)',
  },
  backText: { color: '#1ABFB8', fontSize: 15, fontWeight: '600', marginBottom: 14 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  headerSub: { fontSize: 13, color: 'rgba(180,230,228,0.6)' },
  catScroll: { maxHeight: 58 },
  catContent: { paddingHorizontal: 22, paddingVertical: 10, gap: 8 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: 'rgba(14,124,123,0.15)',
    borderWidth: 1, borderColor: 'rgba(26,191,184,0.2)',
  },
  catChipActive: { backgroundColor: '#0E7C7B', borderColor: '#1ABFB8' },
  catEmoji: { fontSize: 13 },
  catText: { color: 'rgba(180,230,228,0.7)', fontSize: 12, fontWeight: '600' },
  catTextActive: { color: '#FFFFFF' },
  scroll: { paddingHorizontal: 22, paddingTop: 8 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 14, marginTop: 8,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  clearText: { color: '#EF5350', fontSize: 13, fontWeight: '700' },
  entryCard: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 14,
    marginBottom: 10, flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(26,191,184,0.12)',
  },
  entryEmoji: { fontSize: 24, marginRight: 12 },
  entryLeft: { flex: 1 },
  entryMain: { color: '#FFFFFF', fontWeight: '700', fontSize: 15, marginBottom: 3 },
  entrySub: { color: 'rgba(180,230,228,0.6)', fontSize: 12, marginBottom: 3 },
  entryDate: { color: 'rgba(180,230,228,0.4)', fontSize: 11 },
  nafdacText: { color: '#1ABFB8', fontSize: 11, fontWeight: '600', marginBottom: 2 },
  badge: {
    borderRadius: 10, paddingHorizontal: 8, paddingVertical: 5,
    borderWidth: 1, marginLeft: 8, maxWidth: 110,
  },
  badgeText: { fontSize: 10, fontWeight: '700', textAlign: 'center' },
  centered: { paddingTop: 60, alignItems: 'center' },
  loadingText: { color: 'rgba(180,230,228,0.5)', fontSize: 14 },
  emptyEmoji: { fontSize: 52, marginBottom: 14 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
  emptyText: { color: 'rgba(180,230,228,0.5)', fontSize: 13, textAlign: 'center' },
});