import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';


const RAPIDAPI_KEY = '028a2578e7mshbf8afd3af968307p171247jsn2fd83d1f5a57';
const RAPIDAPI_HOST = 'calories-burned-by-api-ninjas.p.rapidapi.com'; 

const NIGERIAN_SUGGESTIONS = [
  'Jollof rice', 'Egusi soup', 'Suya', 'Puff puff',
  'Eba', 'Ofada rice', 'Moi moi', 'Akara', 'Pepper soup',
  'Ofe onugbu', 'Banga soup', 'Tuwo shinkafa', 'Masa',
  'Zobo drink', 'Kunu', 'Chin chin', 'Fried plantain',
];

export default function NigerianFoodScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const searchFood = async (foodName) => {
    const searchTerm = foodName || query.trim();
    if (!searchTerm) {
      Alert.alert('Empty Search', 'Please enter a food name to search.');
      return;
    }

    setLoading(true);
    setSearched(true);
    setResults([]);

    try {
      const response = await fetch(
        `https://calorieninjas.p.rapidapi.com/v1/nutrition?query=${encodeURIComponent(searchTerm)}`,
        {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': RAPIDAPI_HOST,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.items && data.items.length > 0) {
        setResults(data.items);
      } else {
        setResults([]);
      }
    } catch (error) {
      if (RAPIDAPI_KEY === 'YOUR_RAPIDAPI_KEY_HERE') {
        Alert.alert(
          '🔑 API Key Needed',
          'Please replace YOUR_RAPIDAPI_KEY_HERE with your actual RapidAPI key in NigerianFoodScreen.jsx line 15.\n\nSign up free at rapidapi.com and search "Calorie Ninjas".'
        );
      } else {
        Alert.alert('Search Failed', 'Could not fetch nutrition data. Check your internet connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const NutrientBadge = ({ label, value, unit, color }) => (
    <View style={[styles.badge, { borderColor: color + '55', backgroundColor: color + '18' }]}>
      <Text style={[styles.badgeValue, { color }]}>{typeof value === 'number' ? value.toFixed(1) : value}{unit}</Text>
      <Text style={styles.badgeLabel}>{label}</Text>
    </View>
  );

  const FoodCard = ({ item }) => (
    <View style={styles.foodCard}>
      <View style={styles.foodCardHeader}>
        <Text style={styles.foodName}>🍽️ {item.name}</Text>
        <View style={styles.servingTag}>
          <Text style={styles.servingText}>{item.serving_size_g}g serving</Text>
        </View>
      </View>

      {/* Calories highlight */}
      <View style={styles.calorieRow}>
        <Text style={styles.calorieLabel}>Total Calories</Text>
        <Text style={styles.calorieValue}>{item.calories.toFixed(0)} kcal</Text>
      </View>

      {/* Nutrient grid */}
      <View style={styles.badgeRow}>
        <NutrientBadge label="Protein" value={item.protein_g} unit="g" color="#4FC3F7" />
        <NutrientBadge label="Carbs" value={item.carbohydrates_total_g} unit="g" color="#FFB74D" />
        <NutrientBadge label="Fat" value={item.fat_total_g} unit="g" color="#EF5350" />
        <NutrientBadge label="Fibre" value={item.fiber_g} unit="g" color="#81C784" />
      </View>

      <View style={styles.badgeRow}>
        <NutrientBadge label="Sugar" value={item.sugar_g} unit="g" color="#CE93D8" />
        <NutrientBadge label="Sodium" value={item.sodium_mg} unit="mg" color="#4DB6AC" />
        <NutrientBadge label="Sat Fat" value={item.fat_saturated_g} unit="g" color="#FF8A65" />
        <NutrientBadge label="Potassium" value={item.potassium_mg} unit="mg" color="#AED581" />
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0D2B2B" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🍛 Nigerian Food Nutrition</Text>
        <Text style={styles.headerSub}>Search nutrition info for any Nigerian dish</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search e.g. Jollof rice, Suya..."
            placeholderTextColor="rgba(180,230,228,0.35)"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => searchFood()}
            returnKeyType="search"
          />
          <TouchableOpacity
            style={styles.searchBtn}
            onPress={() => searchFood()}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.searchBtnText}>Search</Text>
            }
          </TouchableOpacity>
        </View>
      </View>

      {/* Suggestions */}
      {!searched && (
        <View style={styles.suggestionsSection}>
          <Text style={styles.suggestionsTitle}>🇳🇬 Popular Nigerian Foods</Text>
          <View style={styles.suggestionsGrid}>
            {NIGERIAN_SUGGESTIONS.map((s, i) => (
              <TouchableOpacity
                key={i}
                style={styles.suggestionChip}
                onPress={() => { setQuery(s); searchFood(s); }}
                activeOpacity={0.75}
              >
                <Text style={styles.suggestionText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Results */}
      {searched && !loading && (
        <FlatList
          data={results}
          keyExtractor={(_, i) => i.toString()}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyTitle}>No results found</Text>
              <Text style={styles.emptyText}>
                Try searching with different keywords e.g. "rice" instead of "Jollof rice"
              </Text>
            </View>
          }
          renderItem={({ item }) => <FoodCard item={item} />}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D2B2B' },
  header: {
    paddingTop: 58, paddingHorizontal: 22, paddingBottom: 20,
    borderBottomWidth: 1, borderBottomColor: 'rgba(26,191,184,0.1)',
  },
  backBtn: { marginBottom: 14 },
  backText: { color: '#1ABFB8', fontSize: 15, fontWeight: '600' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  headerSub: { fontSize: 13, color: 'rgba(180,230,228,0.6)' },
  searchContainer: { paddingHorizontal: 22, paddingVertical: 16 },
  searchRow: { flexDirection: 'row', gap: 10 },
  searchInput: {
    flex: 1,
    backgroundColor: 'rgba(14,124,123,0.15)',
    borderRadius: 14, borderWidth: 1.5,
    borderColor: 'rgba(26,191,184,0.25)',
    paddingHorizontal: 16, height: 50,
    color: '#FFFFFF', fontSize: 14,
  },
  searchBtn: {
    backgroundColor: '#0E7C7B', borderRadius: 14,
    paddingHorizontal: 20, height: 50,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#1ABFB8',
  },
  searchBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  suggestionsSection: { paddingHorizontal: 22 },
  suggestionsTitle: { fontSize: 15, fontWeight: '700', color: '#FFFFFF', marginBottom: 14 },
  suggestionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  suggestionChip: {
    backgroundColor: 'rgba(14,124,123,0.2)',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: 'rgba(26,191,184,0.25)',
  },
  suggestionText: { color: 'rgba(180,230,228,0.85)', fontSize: 13, fontWeight: '500' },
  resultsList: { paddingHorizontal: 22, paddingBottom: 40, paddingTop: 8 },
  foodCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20, padding: 18, marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(26,191,184,0.18)',
  },
  foodCardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 14,
  },
  foodName: {
    fontSize: 16, fontWeight: '700', color: '#FFFFFF',
    flex: 1, marginRight: 8, textTransform: 'capitalize',
  },
  servingTag: {
    backgroundColor: 'rgba(26,191,184,0.15)',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(26,191,184,0.3)',
  },
  servingText: { color: '#1ABFB8', fontSize: 11, fontWeight: '600' },
  calorieRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: 'rgba(14,124,123,0.2)', borderRadius: 12, padding: 12, marginBottom: 12,
  },
  calorieLabel: { color: 'rgba(180,230,228,0.7)', fontSize: 13, fontWeight: '600' },
  calorieValue: { color: '#1ABFB8', fontSize: 20, fontWeight: '800' },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  badge: {
    flex: 1, borderRadius: 12, borderWidth: 1,
    paddingVertical: 8, alignItems: 'center',
  },
  badgeValue: { fontSize: 13, fontWeight: '800', marginBottom: 2 },
  badgeLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 30 },
  emptyEmoji: { fontSize: 52, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
  emptyText: { color: 'rgba(180,230,228,0.55)', fontSize: 14, textAlign: 'center', lineHeight: 22 },
});