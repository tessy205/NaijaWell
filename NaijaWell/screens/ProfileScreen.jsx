import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform, Modal, FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT - Abuja','Gombe',
  'Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos',
  'Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto',
  'Taraba','Yobe','Zamfara',
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];
const GENOTYPES = ['AA', 'AS', 'SS', 'AC', 'SC', 'Unknown'];

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [state, setState] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [genotype, setGenotype] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [allergies, setAllergies] = useState('');
  const [conditions, setConditions] = useState('');
  const [stateModal, setStateModal] = useState(false);
  const [focused, setFocused] = useState('');
  const [stats, setStats] = useState({});

  useEffect(() => { loadProfile(); loadStats(); }, []);

  const loadProfile = async () => {
    try {
      const data = await AsyncStorage.getItem('naijawell_currentUser');
      if (data) {
        const p = JSON.parse(data);
        setUser(p);
        setFullName(p.fullName || '');
        setAge(p.age?.toString() || '');
        setState(p.state || '');
      }
      const extra = await AsyncStorage.getItem('naijawell_profile_extra');
      if (extra) {
        const e = JSON.parse(extra);
        setBloodGroup(e.bloodGroup || '');
        setGenotype(e.genotype || '');
        setWeight(e.weight || '');
        setHeight(e.height || '');
        setAllergies(e.allergies || '');
        setConditions(e.conditions || '');
      }
    } catch {}
  };

  const loadStats = async () => {
    try {
      const keys = [
        'naijawell_bmi_history', 'naijawell_bp_logs',
        'naijawell_malaria_logs', 'naijawell_medicine_reminders',
      ];
      const [bmi, bp, malaria, med] = await Promise.all(keys.map((k) => AsyncStorage.getItem(k)));
      setStats({
        bmiCount: bmi ? JSON.parse(bmi).length : 0,
        bpCount: bp ? JSON.parse(bp).length : 0,
        malariaCount: malaria ? JSON.parse(malaria).length : 0,
        medCount: med ? JSON.parse(med).length : 0,
      });
    } catch {}
  };

  const saveProfile = async () => {
    if (!fullName.trim()) { Alert.alert('Missing Name', 'Please enter your full name.'); return; }
    const updatedUser = { ...user, fullName: fullName.trim(), age: parseInt(age) || user?.age, state };
    await AsyncStorage.setItem('naijawell_currentUser', JSON.stringify(updatedUser));
    await AsyncStorage.setItem('naijawell_profile_extra', JSON.stringify({ bloodGroup, genotype, weight, height, allergies, conditions }));
    setUser(updatedUser);
    setEditing(false);
    Alert.alert('✅ Profile Updated', 'Your health profile has been saved.');
  };

  const getInitials = (name) => name ? name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : '?';
  const joinedDate = user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString('en-NG', { month: 'long', year: 'numeric' }) : '';

  const Field = ({ label, fieldKey, value, onChange, placeholder, keyboard }) => (
    <View>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputBox, focused === fieldKey && styles.inputFocused, !editing && styles.inputDisabled]}>
        <TextInput
          style={styles.inputText}
          value={value}
          onChangeText={onChange}
          editable={editing}
          keyboardType={keyboard || 'default'}
          onFocus={() => setFocused(fieldKey)}
          onBlur={() => setFocused('')}
          placeholder={placeholder}
          placeholderTextColor="rgba(180,230,228,0.3)"
        />
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor="#0D2B2B" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>👤 My Profile</Text>
            <TouchableOpacity
              style={[styles.editBtn, editing && styles.editBtnSave]}
              onPress={() => editing ? saveProfile() : setEditing(true)}
            >
              <Text style={styles.editBtnText}>{editing ? '💾 Save' : '✏️ Edit'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Avatar block */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(user?.fullName || '')}</Text>
          </View>
          <Text style={styles.profileName}>{user?.fullName || 'NaijaWell User'}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
          {joinedDate ? (
            <View style={styles.tag}><Text style={styles.tagText}>🌿 Member since {joinedDate}</Text></View>
          ) : null}
          {user?.state ? (
            <View style={[styles.tag, { marginTop: 6 }]}><Text style={styles.tagText}>📍 {user.state}</Text></View>
          ) : null}
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {[
            { label: 'BP Readings', value: stats.bpCount, emoji: '❤️' },
            { label: 'BMI Checks', value: stats.bmiCount, emoji: '⚖️' },
            { label: 'Malaria Checks', value: stats.malariaCount, emoji: '🦟' },
            { label: 'Medicines', value: stats.medCount, emoji: '💊' },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statEmoji}>{s.emoji}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Basic Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Basic Information</Text>
          <Field label="Full Name" fieldKey="name" value={fullName} onChange={setFullName} placeholder="Your full name" />
          <Field label="Age" fieldKey="age" value={age} onChange={setAge} placeholder="Your age" keyboard="number-pad" />

          <Text style={styles.fieldLabel}>State of Residence</Text>
          <TouchableOpacity
            style={[styles.inputBox, !editing && styles.inputDisabled]}
            onPress={() => editing && setStateModal(true)} activeOpacity={editing ? 0.8 : 1}
          >
            <Text style={[styles.inputText, { color: state ? '#FFFFFF' : 'rgba(180,230,228,0.3)' }]}>
              {state || 'Select state'}
            </Text>
            {editing && <Text style={{ color: '#1ABFB8' }}>▾</Text>}
          </TouchableOpacity>
        </View>

        {/* Medical Profile */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Medical Profile</Text>

          <Text style={styles.fieldLabel}>Blood Group</Text>
          <View style={styles.chipsRow}>
            {BLOOD_GROUPS.map((bg) => (
              <TouchableOpacity key={bg} style={[styles.chip, bloodGroup === bg && styles.chipActive]}
                onPress={() => editing && setBloodGroup(bg)}>
                <Text style={[styles.chipText, bloodGroup === bg && styles.chipTextActive]}>{bg}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Genotype</Text>
          <View style={styles.chipsRow}>
            {GENOTYPES.map((g) => (
              <TouchableOpacity key={g} style={[styles.chip, genotype === g && styles.chipActive]}
                onPress={() => editing && setGenotype(g)}>
                <Text style={[styles.chipText, genotype === g && styles.chipTextActive]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <Field label="Weight (kg)" fieldKey="weight" value={weight} onChange={setWeight} placeholder="70" keyboard="decimal-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Height (cm)" fieldKey="height" value={height} onChange={setHeight} placeholder="170" keyboard="decimal-pad" />
            </View>
          </View>

          <Field label="Known Allergies" fieldKey="allergies" value={allergies} onChange={setAllergies} placeholder="e.g. Penicillin, Peanuts" />
          <Field label="Medical Conditions" fieldKey="conditions" value={conditions} onChange={setConditions} placeholder="e.g. Hypertension, Sickle Cell" />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={stateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Select State</Text>
            <FlatList
              data={NIGERIAN_STATES}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.stateItem, state === item && styles.stateItemActive]}
                  onPress={() => { setState(item); setStateModal(false); }}
                >
                  <Text style={[styles.stateText, state === item && styles.stateTextActive]}>{item}</Text>
                  {state === item && <Text>✅</Text>}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setStateModal(false)}>
              <Text style={styles.modalCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  editBtn: {
    backgroundColor: 'rgba(14,124,123,0.2)', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: 'rgba(26,191,184,0.3)',
  },
  editBtnSave: { backgroundColor: '#0E7C7B', borderColor: '#1ABFB8' },
  editBtnText: { color: '#1ABFB8', fontWeight: '700', fontSize: 13 },
  avatarSection: { alignItems: 'center', paddingVertical: 24 },
  avatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#0E7C7B',
    alignItems: 'center', justifyContent: 'center', borderWidth: 3,
    borderColor: '#1ABFB8', marginBottom: 12,
    shadowColor: '#1ABFB8', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 14, elevation: 10,
  },
  avatarText: { color: '#FFFFFF', fontSize: 28, fontWeight: '800' },
  profileName: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  profileEmail: { color: 'rgba(180,230,228,0.55)', fontSize: 13, marginBottom: 8 },
  tag: {
    backgroundColor: 'rgba(14,124,123,0.2)', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(26,191,184,0.25)',
  },
  tagText: { color: '#1ABFB8', fontSize: 12, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 22, gap: 12, marginVertical: 8 },
  statCard: {
    width: '47%', backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16, padding: 14, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(26,191,184,0.15)',
  },
  statEmoji: { fontSize: 22, marginBottom: 5 },
  statValue: { color: '#1ABFB8', fontSize: 20, fontWeight: '800', marginBottom: 2 },
  statLabel: { color: 'rgba(180,230,228,0.6)', fontSize: 11, fontWeight: '600', textAlign: 'center' },
  card: {
    marginHorizontal: 22, marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: 'rgba(26,191,184,0.18)',
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginBottom: 14 },
  fieldLabel: { color: 'rgba(180,230,228,0.75)', fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(14,124,123,0.15)', borderRadius: 14,
    borderWidth: 1.5, borderColor: 'rgba(26,191,184,0.2)',
    paddingHorizontal: 14, height: 50,
  },
  inputFocused: { borderColor: '#1ABFB8' },
  inputDisabled: { opacity: 0.6 },
  inputText: { flex: 1, color: '#FFFFFF', fontSize: 14 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 13, paddingVertical: 7, borderRadius: 20,
    backgroundColor: 'rgba(14,124,123,0.12)',
    borderWidth: 1, borderColor: 'rgba(26,191,184,0.2)',
  },
  chipActive: { backgroundColor: '#0E7C7B', borderColor: '#1ABFB8' },
  chipText: { color: 'rgba(180,230,228,0.7)', fontSize: 13 },
  chipTextActive: { color: '#FFFFFF', fontWeight: '700' },
  twoCol: { flexDirection: 'row', gap: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: '#0D2B2B', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, maxHeight: '75%',
    borderTopWidth: 1, borderColor: 'rgba(26,191,184,0.25)',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 14, textAlign: 'center' },
  stateItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 13, paddingHorizontal: 12, borderRadius: 12, marginBottom: 4,
    backgroundColor: 'rgba(14,124,123,0.08)',
  },
  stateItemActive: { backgroundColor: 'rgba(14,124,123,0.28)', borderWidth: 1, borderColor: '#1ABFB8' },
  stateText: { color: 'rgba(180,230,228,0.8)', fontSize: 14 },
  stateTextActive: { color: '#FFFFFF', fontWeight: '700' },
  modalCloseBtn: {
    marginTop: 14, backgroundColor: '#0E7C7B', borderRadius: 14,
    height: 50, alignItems: 'center', justifyContent: 'center',
  },
  modalCloseBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});