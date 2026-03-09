import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  ScrollView, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';

// ─────────────────────────────────────────────────────────────────────
// 🔑 REPLACE with your RapidAPI key
// Search "Health Tips" on rapidapi.com and subscribe (free tier)
// API used: "Health Tips" by Cosmos Skylark on RapidAPI
// ─────────────────────────────────────────────────────────────────────
const RAPIDAPI_KEY = 'YOUR_RAPIDAPI_KEY_HERE';

// Nigerian-curated health tips shown when API is unavailable or as default
const NAIJA_TIPS = [
  { id: '1', category: 'Malaria Prevention', emoji: '🦟', tip: 'Sleep under a treated mosquito net every night. During rainy season, mosquitoes breed faster — check gutters and empty standing water around your home.', source: 'NaijaWell' },
  { id: '2', category: 'Hydration', emoji: '💧', tip: 'In Nigeria\'s hot climate, drink at least 8–10 glasses of water daily. If you are in the north during harmattan, increase this to 10–12 glasses. Always check your sachet water for a valid NAFDAC number.', source: 'NaijaWell' },
  { id: '3', category: 'Blood Pressure', emoji: '❤️', tip: 'Hypertension is very common in Nigeria and often has no symptoms. Reduce salt, smoked fish, Maggi seasoning and processed foods. Check your BP regularly — even young Nigerians can have high BP.', source: 'NaijaWell' },
  { id: '4', category: 'Nutrition', emoji: '🥗', tip: 'Nigerian traditional foods like ugwu (pumpkin leaves), garden eggs, ofe akwu (palm nut soup) and moringa are rich in essential vitamins and iron. Eat local — it\'s cheaper and healthier!', source: 'NaijaWell' },
  { id: '5', category: 'Exercise', emoji: '🏃', tip: 'You don\'t need a gym. Walking briskly for 30 minutes daily — to the bus stop, market or around your estate — is enough to maintain a healthy heart.', source: 'NaijaWell' },
  { id: '6', category: 'Self-Medication', emoji: '⚠️', tip: 'Avoid buying and taking Artemether (malaria drugs), antibiotics and other prescription drugs from roadside chemists without seeing a doctor. Fake and counterfeit drugs are a serious issue in Nigeria.', source: 'NaijaWell' },
  { id: '7', category: 'Mental Health', emoji: '🧠', tip: 'Stress from Lagos traffic, financial pressure and work is real. Talk to someone you trust, pray, rest, and know that seeking mental health support is not a sign of weakness.', source: 'NaijaWell' },
  { id: '8', category: 'Typhoid Prevention', emoji: '🦠', tip: 'Typhoid is common in Nigeria due to contaminated water and food. Wash your hands before eating, avoid roadside food with questionable hygiene, and always boil or filter tap water.', source: 'NaijaWell' },
  { id: '9', category: 'Diabetes', emoji: '🍬', tip: 'Type 2 diabetes is rising in Nigeria due to increased consumption of white rice, fried foods and sugary drinks. Switch to ofada rice, reduce your Fanta and Malt intake, and walk more.', source: 'NaijaWell' },
  { id: '10', category: 'Eye Health', emoji: '👁️', tip: 'Reduce eye strain from staring at your phone in the dark. Nigeria\'s "bedtime scrolling" culture is causing early-onset eye problems. Take 20-second breaks every 20 minutes when using screens.', source: 'NaijaWell' },
  { id: '11', category: 'Skin Health', emoji: '✨', tip: 'Avoid bleaching creams. Many contain mercury and hydroquinone which can cause kidney damage, skin cancer and hormonal disruption. Embrace your natural melanin — it protects against UV radiation.', source: 'NaijaWell' },
  { id: '12', category: 'Dental Health', emoji: '🦷', tip: 'Chewing on traditional chewing sticks (Orin in Yoruba) is actually backed by science — they contain natural antibacterial compounds. Brush twice daily and visit a dentist at least once a year.', source: 'NaijaWell' },
];

const CATEGORIES = ['All', 'Malaria Prevention', 'Hydration', 'Blood Pressure', 'Nutrition', 'Exercise', 'Mental Health'];

export default function HealthTipsScreen({ navigation }) {
  const [tips, setTips] = useState(NAIJA_TIPS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [savedTips, setSavedTips] = useState([]);
  const [apiLoaded, setApiLoaded] = useState(false);

  useEffect(() => {
    loadSavedTips();
    fetchApiTips();
  }, []);

  const loadSavedTips = async () => {
    try {
      const { AsyncStorage } = require('@react-native-async-storage/async-storage');
      const data = await AsyncStorage.getItem('naijawell_saved_tips');
      if (data) setSavedTips(JSON.parse(data));
    } catch {}
  };

  const fetchApiTips = async (isRefresh = false) => {
    if (RAPIDAPI_KEY === 'YOUR_RAPIDAPI_KEY_HERE') return;
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const response = await fetch('https://health-tips-api.p.rapidapi.com/tips?limit=20', {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'health-tips-api.p.rapidapi.com',
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((t, i) => ({
            id: `api_${i}`,
            category: t.category || 'General Health',
            emoji: '💡',
            tip: t.tip || t.description || t.content || '',
            source: 'Health API',
          })).filter((t) => t.tip.length > 10);
          setTips([...NAIJA_TIPS, ...mapped]);
          setApiLoaded(true);
        }
      }
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };

  const toggleSave = async (id) => {
    try {
      const { AsyncStorage } = require('@react-native-async-storage/async-storage');
      const updated = savedTips.includes(id)
        ? savedTips.filter((s) => s !== id)
        : [...savedTips, id];
      setSavedTips(updated);
      await AsyncStorage.setItem('naijawell_saved_tips', JSON.stringify(updated));
    } catch {}
  };

  const filtered = activeCategory === 'All'
    ? tips
    : tips.filter((t) => t.category === activeCategory);

  const getCategoryColor = (cat) => {
    const map = {
      'Malaria Prevention': '#EF5350',
      'Hydration': '#4FC3F7',
      'Blood Pressure': '#FF8A65',
      'Nutrition': '#81C784',
      'Exercise': '#FFB74D',
      'Mental Health': '#CE93D8',
    };
    return map[cat] || '#1ABFB8';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D2B2B" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>💡 Health Tips</Text>
            <Text style={styles.headerSub}>Nigerian health knowledge, daily</Text>
          </View>
          {loading && <ActivityIndicator color="#1ABFB8" size="small" />}
        </View>
        {apiLoaded && (
          <View style={styles.apiTag}>
            <Text style={styles.apiTagText}>✅ Live tips loaded</Text>
          </View>
        )}
      </View>

      {/* Category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.catScroll}
        contentContainerStyle={styles.catContent}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.catChip, activeCategory === cat && styles.catChipActive]}
            onPress={() => setActiveCategory(cat)}
          >
            <Text style={[styles.catText, activeCategory === cat && styles.catTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tips list */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchApiTips(true)}
            tintColor="#1ABFB8"
            colors={['#1ABFB8']}
          />
        }
      >
        <Text style={styles.countText}>{filtered.length} tip{filtered.length !== 1 ? 's' : ''}</Text>

        {filtered.map((tip) => {
          const color = getCategoryColor(tip.category);
          const isSaved = savedTips.includes(tip.id);
          return (
            <View key={tip.id} style={[styles.tipCard, { borderLeftColor: color }]}>
              <View style={styles.tipTop}>
                <Text style={styles.tipEmoji}>{tip.emoji}</Text>
                <View style={[styles.catBadge, { backgroundColor: color + '22', borderColor: color + '55' }]}>
                  <Text style={[styles.catBadgeText, { color }]}>{tip.category}</Text>
                </View>
                <TouchableOpacity onPress={() => toggleSave(tip.id)} style={styles.saveBtn}>
                  <Text style={styles.saveBtnText}>{isSaved ? '🔖' : '🏷️'}</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.tipText}>{tip.tip}</Text>
              <Text style={styles.tipSource}>— {tip.source}</Text>
            </View>
          );
        })}

        {RAPIDAPI_KEY === 'YOUR_RAPIDAPI_KEY_HERE' && (
          <View style={styles.apiNotice}>
            <Text style={styles.apiNoticeTitle}>🔑 Want live health tips?</Text>
            <Text style={styles.apiNoticeText}>
              Add your RapidAPI key to HealthTipsScreen.jsx line 13 to load fresh tips from the Health Tips API.
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D2B2B' },
  header: {
    paddingTop: 58, paddingHorizontal: 22, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: 'rgba(26,191,184,0.1)',
  },
  backText: { color: '#1ABFB8', fontSize: 15, fontWeight: '600', marginBottom: 14 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  headerSub: { fontSize: 13, color: 'rgba(180,230,228,0.6)' },
  apiTag: {
    alignSelf: 'flex-start', marginTop: 8,
    backgroundColor: 'rgba(129,199,132,0.15)',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(129,199,132,0.3)',
  },
  apiTagText: { color: '#81C784', fontSize: 12, fontWeight: '600' },
  catScroll: { maxHeight: 52 },
  catContent: { paddingHorizontal: 22, paddingVertical: 10, gap: 8 },
  catChip: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20,
    backgroundColor: 'rgba(14,124,123,0.15)',
    borderWidth: 1, borderColor: 'rgba(26,191,184,0.2)',
  },
  catChipActive: { backgroundColor: '#0E7C7B', borderColor: '#1ABFB8' },
  catText: { color: 'rgba(180,230,228,0.7)', fontSize: 13, fontWeight: '500' },
  catTextActive: { color: '#FFFFFF', fontWeight: '700' },
  scroll: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 40 },
  countText: { color: 'rgba(180,230,228,0.45)', fontSize: 12, marginBottom: 14 },
  tipCard: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 18, padding: 18,
    marginBottom: 14, borderWidth: 1, borderColor: 'rgba(26,191,184,0.12)',
    borderLeftWidth: 4,
  },
  tipTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  tipEmoji: { fontSize: 22 },
  catBadge: {
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3,
    borderWidth: 1, flex: 1,
  },
  catBadgeText: { fontSize: 11, fontWeight: '700' },
  saveBtn: { padding: 4 },
  saveBtnText: { fontSize: 18 },
  tipText: { color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: 22 },
  tipSource: { color: 'rgba(180,230,228,0.4)', fontSize: 11, marginTop: 8, fontStyle: 'italic' },
  apiNotice: {
    backgroundColor: 'rgba(255,183,77,0.1)', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: 'rgba(255,183,77,0.25)', marginTop: 8,
  },
  apiNoticeTitle: { color: '#FFB74D', fontWeight: '700', fontSize: 13, marginBottom: 5 },
  apiNoticeText: { color: 'rgba(255,255,255,0.7)', fontSize: 12, lineHeight: 18 },
});