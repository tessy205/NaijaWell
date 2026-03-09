import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  ScrollView, ActivityIndicator, Alert, Linking, Platform,
} from 'react-native';

// Expo location — install with: npx expo install expo-location
let Location;
try { Location = require('expo-location'); } catch {}

const FACILITY_TYPES = ['All', 'Hospital', 'Clinic', 'Pharmacy', 'Lab', 'Health Centre'];

// Fallback list of well-known Nigerian hospitals per major city
const KNOWN_HOSPITALS = {
  Lagos: [
    { name: 'Lagos University Teaching Hospital (LUTH)', address: 'Idi-Araba, Surulere, Lagos', type: 'Hospital', phone: '01-7748991', emergency: true },
    { name: 'Lagos Island General Hospital', address: 'Lagos Island, Lagos', type: 'Hospital', phone: '01-2630408', emergency: true },
    { name: 'Reddington Hospital', address: 'Victoria Island, Lagos', type: 'Hospital', phone: '01-2710647', emergency: false },
    { name: 'St. Nicholas Hospital', address: 'Campbell Street, Lagos Island', type: 'Hospital', phone: '01-2630650', emergency: false },
  ],
  Abuja: [
    { name: 'National Hospital Abuja', address: 'Central Business District, Abuja', type: 'Hospital', phone: '09-5238920', emergency: true },
    { name: 'Garki Hospital', address: 'Garki, Abuja', type: 'Hospital', phone: '09-2340601', emergency: true },
    { name: 'Cedarcrest Hospital', address: 'Cadastral Zone, Abuja', type: 'Hospital', phone: '08184449414', emergency: false },
  ],
  Kano: [
    { name: 'Aminu Kano Teaching Hospital', address: 'Zaria Road, Kano', type: 'Hospital', phone: '064-666472', emergency: true },
    { name: 'Murtala Muhammad Specialist Hospital', address: 'Kano', type: 'Hospital', phone: '064-644100', emergency: true },
  ],
  'Port Harcourt': [
    { name: 'University of Port Harcourt Teaching Hospital', address: 'East-West Road, Port Harcourt', type: 'Hospital', phone: '084-230431', emergency: true },
    { name: 'Braithwaite Memorial Specialist Hospital', address: 'Moscow Road, Port Harcourt', type: 'Hospital', phone: '084-238765', emergency: true },
  ],
  Ibadan: [
    { name: 'University College Hospital (UCH)', address: 'Queen Elizabeth II Road, Ibadan', type: 'Hospital', phone: '022-2410088', emergency: true },
    { name: 'Ring Road State Hospital', address: 'Ring Road, Ibadan', type: 'Hospital', phone: '022-2315061', emergency: true },
  ],
};

const CITIES = Object.keys(KNOWN_HOSPITALS);

export default function FindClinicScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState('idle'); // idle | loading | denied | found
  const [userCity, setUserCity] = useState('');
  const [selectedCity, setSelectedCity] = useState('Lagos');
  const [activeType, setActiveType] = useState('All');
  const [nearbyFacilities, setNearbyFacilities] = useState([]);

  useEffect(() => {
    setNearbyFacilities(KNOWN_HOSPITALS[selectedCity] || []);
  }, [selectedCity]);

  const requestLocation = async () => {
    if (!Location) {
      Alert.alert('Install Required', 'Run: npx expo install expo-location\n\nThen restart your app to use GPS location.');
      return;
    }
    setLoading(true);
    setLocationStatus('loading');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationStatus('denied');
        Alert.alert('Permission Denied', 'Please allow location access to find clinics near you.');
        setLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const geo = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      if (geo && geo[0]) {
        const city = geo[0].city || geo[0].subregion || 'Lagos';
        setUserCity(city);
        const matchedCity = CITIES.find((c) => city.toLowerCase().includes(c.toLowerCase())) || 'Lagos';
        setSelectedCity(matchedCity);
        setLocationStatus('found');
      }
    } catch (e) {
      Alert.alert('Location Error', 'Could not get your location. Please select your city manually.');
      setLocationStatus('idle');
    } finally {
      setLoading(false);
    }
  };

  const callFacility = (phone) => {
    Linking.openURL(`tel:${phone}`).catch(() =>
      Alert.alert('Cannot Call', 'Unable to open the phone dialler.')
    );
  };

  const openMaps = (name, address) => {
    const query = encodeURIComponent(`${name} ${address}`);
    const url = Platform.OS === 'ios'
      ? `maps:0,0?q=${query}`
      : `geo:0,0?q=${query}`;
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
    });
  };

  const filtered = activeType === 'All'
    ? nearbyFacilities
    : nearbyFacilities.filter((f) => f.type === activeType);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D2B2B" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🏥 Find Nearby Clinic</Text>
          <Text style={styles.headerSub}>Locate hospitals and health facilities near you</Text>
        </View>

        {/* Emergency banner */}
        <View style={styles.emergencyBanner}>
          <Text style={styles.emergencyTitle}>🚨 Medical Emergency?</Text>
          <View style={styles.emergencyBtns}>
            <TouchableOpacity style={styles.emergencyBtn} onPress={() => callFacility('112')}>
              <Text style={styles.emergencyBtnText}>📞 Call 112</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.emergencyBtn, styles.emergencyBtnSecondary]} onPress={() => callFacility('08009700010')}>
              <Text style={styles.emergencyBtnText}>NCDC Hotline</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* GPS button */}
        <View style={styles.gpsSection}>
          <TouchableOpacity
            style={[styles.gpsBtn, loading && { opacity: 0.7 }]}
            onPress={requestLocation}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.gpsBtnText}>📍 Use My Location</Text>
            }
          </TouchableOpacity>
          {locationStatus === 'found' && userCity ? (
            <Text style={styles.locationFound}>✅ Location found: {userCity}</Text>
          ) : locationStatus === 'denied' ? (
            <Text style={styles.locationDenied}>❌ Location access denied</Text>
          ) : null}
        </View>

        {/* City selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select City</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {CITIES.map((city) => (
              <TouchableOpacity
                key={city}
                style={[styles.cityChip, selectedCity === city && styles.cityChipActive]}
                onPress={() => setSelectedCity(city)}
              >
                <Text style={[styles.cityText, selectedCity === city && styles.cityTextActive]}>{city}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Type filter */}
        <View style={styles.section}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {FACILITY_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.typeChip, activeType === type && styles.typeChipActive]}
                onPress={() => setActiveType(type)}
              >
                <Text style={[styles.typeText, activeType === type && styles.typeTextActive]}>{type}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Facilities list */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Health Facilities in {selectedCity} ({filtered.length})
          </Text>
          {filtered.map((facility, i) => (
            <View key={i} style={styles.facilityCard}>
              <View style={styles.facilityTop}>
                <View style={styles.facilityInfo}>
                  <Text style={styles.facilityName}>{facility.name}</Text>
                  {facility.emergency && (
                    <View style={styles.emergencyTag}>
                      <Text style={styles.emergencyTagText}>🚨 24hr Emergency</Text>
                    </View>
                  )}
                </View>
                <View style={[styles.typeBadge, { backgroundColor: 'rgba(26,191,184,0.15)' }]}>
                  <Text style={styles.typeBadgeText}>{facility.type}</Text>
                </View>
              </View>

              <Text style={styles.facilityAddress}>📍 {facility.address}</Text>

              <View style={styles.facilityActions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => callFacility(facility.phone)}
                >
                  <Text style={styles.actionBtnText}>📞 Call</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionBtnSecondary]}
                  onPress={() => openMaps(facility.name, facility.address)}
                >
                  <Text style={styles.actionBtnText}>🗺️ Directions</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Useful numbers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🇳🇬 Important Health Numbers</Text>
          {[
            { label: 'Emergency Services', number: '112', desc: 'Police, Fire, Ambulance' },
            { label: 'NCDC Hotline', number: '0800-970-0010', desc: 'Disease Control (toll free)' },
            { label: 'NAFDAC', number: '0800-162-3322', desc: 'Fake drug reports' },
            { label: 'Federal Min. of Health', number: '09-5238920', desc: 'Health enquiries' },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.numberCard}
              onPress={() => callFacility(item.number.replace(/-/g, ''))}
              activeOpacity={0.8}
            >
              <View style={styles.numberInfo}>
                <Text style={styles.numberLabel}>{item.label}</Text>
                <Text style={styles.numberDesc}>{item.desc}</Text>
              </View>
              <Text style={styles.numberPhone}>{item.number}</Text>
            </TouchableOpacity>
          ))}
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
  emergencyBanner: {
    margin: 22, backgroundColor: 'rgba(239,83,80,0.12)',
    borderRadius: 16, padding: 16,
    borderWidth: 1.5, borderColor: 'rgba(239,83,80,0.35)',
  },
  emergencyTitle: { color: '#EF5350', fontWeight: '800', fontSize: 15, marginBottom: 12 },
  emergencyBtns: { flexDirection: 'row', gap: 10 },
  emergencyBtn: {
    flex: 1, backgroundColor: '#EF5350', borderRadius: 12,
    paddingVertical: 10, alignItems: 'center',
  },
  emergencyBtnSecondary: { backgroundColor: 'rgba(239,83,80,0.3)', borderWidth: 1, borderColor: '#EF5350' },
  emergencyBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  gpsSection: { paddingHorizontal: 22, marginBottom: 4, alignItems: 'center' },
  gpsBtn: {
    backgroundColor: '#0E7C7B', borderRadius: 14, height: 50,
    paddingHorizontal: 32, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#1ABFB8', width: '100%',
  },
  gpsBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  locationFound: { color: '#81C784', fontSize: 13, fontWeight: '600', marginTop: 8 },
  locationDenied: { color: '#EF5350', fontSize: 13, marginTop: 8 },
  section: { paddingHorizontal: 22, marginTop: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#FFFFFF', marginBottom: 12 },
  cityChip: {
    paddingHorizontal: 18, paddingVertical: 9, borderRadius: 20, marginRight: 8,
    backgroundColor: 'rgba(14,124,123,0.15)',
    borderWidth: 1.5, borderColor: 'rgba(26,191,184,0.2)',
  },
  cityChipActive: { backgroundColor: '#0E7C7B', borderColor: '#1ABFB8' },
  cityText: { color: 'rgba(180,230,228,0.7)', fontSize: 14, fontWeight: '500' },
  cityTextActive: { color: '#FFFFFF', fontWeight: '700' },
  typeChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, marginRight: 8,
    backgroundColor: 'rgba(14,124,123,0.12)',
    borderWidth: 1, borderColor: 'rgba(26,191,184,0.18)',
  },
  typeChipActive: { backgroundColor: 'rgba(14,124,123,0.35)', borderColor: '#1ABFB8' },
  typeText: { color: 'rgba(180,230,228,0.65)', fontSize: 12 },
  typeTextActive: { color: '#FFFFFF', fontWeight: '700' },
  facilityCard: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 18, padding: 16,
    marginBottom: 14, borderWidth: 1, borderColor: 'rgba(26,191,184,0.15)',
  },
  facilityTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'flex-start' },
  facilityInfo: { flex: 1, marginRight: 8 },
  facilityName: { color: '#FFFFFF', fontWeight: '700', fontSize: 15, marginBottom: 4 },
  emergencyTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(239,83,80,0.15)',
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: 'rgba(239,83,80,0.3)',
  },
  emergencyTagText: { color: '#EF5350', fontSize: 10, fontWeight: '700' },
  typeBadge: {
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(26,191,184,0.3)',
  },
  typeBadgeText: { color: '#1ABFB8', fontSize: 11, fontWeight: '600' },
  facilityAddress: { color: 'rgba(180,230,228,0.6)', fontSize: 13, marginBottom: 14 },
  facilityActions: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1, backgroundColor: '#0E7C7B', borderRadius: 10,
    paddingVertical: 10, alignItems: 'center',
    borderWidth: 1, borderColor: '#1ABFB8',
  },
  actionBtnSecondary: { backgroundColor: 'rgba(14,124,123,0.2)' },
  actionBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  numberCard: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 14,
    marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(26,191,184,0.12)',
  },
  numberInfo: { flex: 1 },
  numberLabel: { color: '#FFFFFF', fontWeight: '700', fontSize: 14, marginBottom: 2 },
  numberDesc: { color: 'rgba(180,230,228,0.55)', fontSize: 12 },
  numberPhone: { color: '#1ABFB8', fontWeight: '700', fontSize: 14 },
});