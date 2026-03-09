import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  ScrollView, TextInput, Alert, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FREQUENCIES = ['Once daily', 'Twice daily', 'Three times daily', 'Every 8 hours', 'Weekly', 'As needed'];
const TIMES_OF_DAY = ['Morning', 'Afternoon', 'Evening', 'Night', 'Before meal', 'After meal'];
const MED_TYPES = [
  { label: 'Tablet', emoji: '💊' },
  { label: 'Syrup', emoji: '🧴' },
  { label: 'Injection', emoji: '💉' },
  { label: 'Capsule', emoji: '🔴' },
  { label: 'Drops', emoji: '💧' },
  { label: 'Cream', emoji: '🧪' },
];

export default function MedicineReminderScreen({ navigation }) {
  const [reminders, setReminders] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [medType, setMedType] = useState('');
  const [nafdacNum, setNafdacNum] = useState('');
  const [focused, setFocused] = useState('');

  useEffect(() => { loadReminders(); }, []);

  const loadReminders = async () => {
    try {
      const data = await AsyncStorage.getItem('naijawell_medicine_reminders');
      if (data) setReminders(JSON.parse(data));
    } catch {}
  };

  const saveReminders = async (updated) => {
    try { await AsyncStorage.setItem('naijawell_medicine_reminders', JSON.stringify(updated)); } catch {}
  };

  const toggleTime = (t) =>
    setSelectedTimes((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);

  const addReminder = async () => {
    if (!medName.trim()) { Alert.alert('Missing Name', 'Please enter the medicine name.'); return; }
    if (!frequency) { Alert.alert('Missing Frequency', 'Please select how often you take this medicine.'); return; }
    if (selectedTimes.length === 0) { Alert.alert('Missing Time', 'Please select at least one time of day.'); return; }

    const reminder = {
      id: Date.now().toString(),
      name: medName.trim(),
      dosage: dosage.trim(),
      frequency,
      times: selectedTimes,
      type: medType,
      nafdacNum: nafdacNum.trim(),
      active: true,
      createdAt: new Date().toISOString(),
    };

    const updated = [reminder, ...reminders];
    setReminders(updated);
    await saveReminders(updated);
    resetForm();
    setModalVisible(false);
    Alert.alert('✅ Reminder Added!', `You will be reminded to take ${medName} ${frequency.toLowerCase()}.`);
  };

  const toggleActive = async (id) => {
    const updated = reminders.map((r) => r.id === id ? { ...r, active: !r.active } : r);
    setReminders(updated);
    await saveReminders(updated);
  };

  const deleteReminder = (id) => {
    Alert.alert('Delete Reminder', 'Remove this medicine reminder?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          const updated = reminders.filter((r) => r.id !== id);
          setReminders(updated);
          await saveReminders(updated);
        },
      },
    ]);
  };

  const resetForm = () => {
    setMedName(''); setDosage(''); setFrequency('');
    setSelectedTimes([]); setMedType(''); setNafdacNum('');
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
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>💊 Medicine Reminders</Text>
              <Text style={styles.headerSub}>Track your medications & NAFDAC numbers</Text>
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
              <Text style={styles.addBtnText}>+ Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* NAFDAC tip */}
        <View style={styles.nafdacTip}>
          <Text style={styles.nafdacTipTitle}>🇳🇬 NAFDAC Reminder</Text>
          <Text style={styles.nafdacTipText}>
            Always check for a NAFDAC registration number on your medicine before buying. Fake drugs are a serious problem in Nigeria. Verify at nafdac.gov.ng or call 0800-162-3322.
          </Text>
        </View>

        {/* Reminders list */}
        {reminders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>💊</Text>
            <Text style={styles.emptyTitle}>No Reminders Yet</Text>
            <Text style={styles.emptyText}>Tap "+ Add" above to add your first medicine reminder</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => setModalVisible(true)}>
              <Text style={styles.emptyBtnText}>Add First Reminder</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Medications ({reminders.length})</Text>
            {reminders.map((r) => {
              const typeObj = MED_TYPES.find((m) => m.label === r.type);
              return (
                <View key={r.id} style={[styles.reminderCard, !r.active && styles.reminderCardInactive]}>
                  <View style={styles.reminderTop}>
                    <View style={styles.reminderLeft}>
                      <Text style={styles.reminderEmoji}>{typeObj?.emoji || '💊'}</Text>
                      <View>
                        <Text style={[styles.reminderName, !r.active && styles.textFaded]}>{r.name}</Text>
                        {r.dosage ? <Text style={styles.reminderDosage}>{r.dosage}</Text> : null}
                      </View>
                    </View>
                    <TouchableOpacity
                      style={[styles.activeToggle, r.active && styles.activeToggleOn]}
                      onPress={() => toggleActive(r.id)}
                    >
                      <Text style={styles.activeToggleText}>{r.active ? 'ON' : 'OFF'}</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.reminderMeta}>
                    <View style={styles.metaBadge}>
                      <Text style={styles.metaBadgeText}>🔁 {r.frequency}</Text>
                    </View>
                    {r.times.map((t) => (
                      <View key={t} style={styles.timeBadge}>
                        <Text style={styles.timeBadgeText}>{t}</Text>
                      </View>
                    ))}
                  </View>

                  {r.nafdacNum ? (
                    <Text style={styles.nafdacNum}>NAFDAC: {r.nafdacNum}</Text>
                  ) : (
                    <Text style={styles.nafdacMissing}>⚠️ NAFDAC number not recorded</Text>
                  )}

                  <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteReminder(r.id)}>
                    <Text style={styles.deleteBtnText}>🗑️ Delete</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add Reminder Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalBox}>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Medicine Reminder</Text>
                <TouchableOpacity onPress={() => { setModalVisible(false); resetForm(); }}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Med name */}
              <Text style={styles.fieldLabel}>Medicine Name *</Text>
              <View style={[styles.inputBox, focused === 'name' && styles.inputFocused]}>
                <Text style={styles.inputIcon}>💊</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Artemether, Paracetamol"
                  placeholderTextColor="rgba(180,230,228,0.3)"
                  value={medName}
                  onChangeText={setMedName}
                  onFocus={() => setFocused('name')}
                  onBlur={() => setFocused('')}
                />
              </View>

              {/* Dosage */}
              <Text style={styles.fieldLabel}>Dosage (optional)</Text>
              <View style={[styles.inputBox, focused === 'dose' && styles.inputFocused]}>
                <Text style={styles.inputIcon}>⚖️</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 500mg, 2 tablets"
                  placeholderTextColor="rgba(180,230,228,0.3)"
                  value={dosage}
                  onChangeText={setDosage}
                  onFocus={() => setFocused('dose')}
                  onBlur={() => setFocused('')}
                />
              </View>

              {/* NAFDAC number */}
              <Text style={styles.fieldLabel}>NAFDAC Number (recommended)</Text>
              <View style={[styles.inputBox, focused === 'nafdac' && styles.inputFocused]}>
                <Text style={styles.inputIcon}>🔢</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. A4-1234"
                  placeholderTextColor="rgba(180,230,228,0.3)"
                  value={nafdacNum}
                  onChangeText={setNafdacNum}
                  onFocus={() => setFocused('nafdac')}
                  onBlur={() => setFocused('')}
                />
              </View>

              {/* Medicine type */}
              <Text style={styles.fieldLabel}>Medicine Type</Text>
              <View style={styles.typeGrid}>
                {MED_TYPES.map((m) => (
                  <TouchableOpacity
                    key={m.label}
                    style={[styles.typeChip, medType === m.label && styles.typeChipActive]}
                    onPress={() => setMedType(m.label)}
                  >
                    <Text style={styles.typeEmoji}>{m.emoji}</Text>
                    <Text style={[styles.typeLabel, medType === m.label && styles.typeLabelActive]}>{m.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Frequency */}
              <Text style={styles.fieldLabel}>Frequency *</Text>
              <View style={styles.chipRow}>
                {FREQUENCIES.map((f) => (
                  <TouchableOpacity
                    key={f}
                    style={[styles.chip, frequency === f && styles.chipActive]}
                    onPress={() => setFrequency(f)}
                  >
                    <Text style={[styles.chipText, frequency === f && styles.chipTextActive]}>{f}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Times */}
              <Text style={styles.fieldLabel}>Time of Day *</Text>
              <View style={styles.chipRow}>
                {TIMES_OF_DAY.map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.chip, selectedTimes.includes(t) && styles.chipActive]}
                    onPress={() => toggleTime(t)}
                  >
                    <Text style={[styles.chipText, selectedTimes.includes(t) && styles.chipTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={addReminder} activeOpacity={0.85}>
                <Text style={styles.saveBtnText}>Save Reminder 💊</Text>
              </TouchableOpacity>

              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  headerSub: { fontSize: 13, color: 'rgba(180,230,228,0.6)' },
  addBtn: {
    backgroundColor: '#0E7C7B', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 9,
    borderWidth: 1, borderColor: '#1ABFB8',
  },
  addBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  nafdacTip: {
    margin: 22, backgroundColor: 'rgba(255,183,77,0.1)',
    borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: 'rgba(255,183,77,0.25)',
  },
  nafdacTipTitle: { color: '#FFB74D', fontWeight: '700', fontSize: 13, marginBottom: 5 },
  nafdacTipText: { color: 'rgba(255,255,255,0.75)', fontSize: 12, lineHeight: 18 },
  emptyState: { alignItems: 'center', paddingTop: 50, paddingHorizontal: 30 },
  emptyEmoji: { fontSize: 60, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
  emptyText: { color: 'rgba(180,230,228,0.55)', fontSize: 14, textAlign: 'center', marginBottom: 24 },
  emptyBtn: {
    backgroundColor: '#0E7C7B', borderRadius: 14,
    paddingHorizontal: 28, paddingVertical: 14,
    borderWidth: 1, borderColor: '#1ABFB8',
  },
  emptyBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  section: { paddingHorizontal: 22 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginBottom: 14 },
  reminderCard: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 18, padding: 16,
    marginBottom: 14, borderWidth: 1, borderColor: 'rgba(26,191,184,0.18)',
  },
  reminderCardInactive: { opacity: 0.5 },
  reminderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  reminderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  reminderEmoji: { fontSize: 28 },
  reminderName: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  reminderDosage: { color: 'rgba(180,230,228,0.6)', fontSize: 12, marginTop: 2 },
  textFaded: { color: 'rgba(255,255,255,0.4)' },
  activeToggle: {
    backgroundColor: 'rgba(239,83,80,0.2)', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(239,83,80,0.4)',
  },
  activeToggleOn: {
    backgroundColor: 'rgba(26,191,184,0.2)',
    borderColor: 'rgba(26,191,184,0.5)',
  },
  activeToggleText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  reminderMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  metaBadge: {
    backgroundColor: 'rgba(14,124,123,0.25)', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(26,191,184,0.25)',
  },
  metaBadgeText: { color: '#1ABFB8', fontSize: 11, fontWeight: '600' },
  timeBadge: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  timeBadgeText: { color: 'rgba(180,230,228,0.75)', fontSize: 11 },
  nafdacNum: { color: '#1ABFB8', fontSize: 12, fontWeight: '600', marginBottom: 10 },
  nafdacMissing: { color: 'rgba(255,183,77,0.7)', fontSize: 11, marginBottom: 10 },
  deleteBtn: { alignSelf: 'flex-end' },
  deleteBtnText: { color: 'rgba(239,83,80,0.7)', fontSize: 12, fontWeight: '600' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: '#0D2B2B', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, maxHeight: '90%',
    borderTopWidth: 1, borderColor: 'rgba(26,191,184,0.2)',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  modalClose: { color: 'rgba(180,230,228,0.6)', fontSize: 22 },
  fieldLabel: { color: 'rgba(180,230,228,0.8)', fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 14 },
  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(14,124,123,0.15)', borderRadius: 14,
    borderWidth: 1.5, borderColor: 'rgba(26,191,184,0.2)',
    paddingHorizontal: 14, height: 50,
  },
  inputFocused: { borderColor: '#1ABFB8' },
  inputIcon: { fontSize: 16, marginRight: 10 },
  textInput: { flex: 1, color: '#FFFFFF', fontSize: 14 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: 'rgba(14,124,123,0.15)',
    borderWidth: 1, borderColor: 'rgba(26,191,184,0.2)',
  },
  typeChipActive: { backgroundColor: 'rgba(14,124,123,0.4)', borderColor: '#1ABFB8' },
  typeEmoji: { fontSize: 16 },
  typeLabel: { color: 'rgba(180,230,228,0.7)', fontSize: 13 },
  typeLabelActive: { color: '#FFFFFF', fontWeight: '700' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: 'rgba(14,124,123,0.15)',
    borderWidth: 1, borderColor: 'rgba(26,191,184,0.2)',
  },
  chipActive: { backgroundColor: 'rgba(14,124,123,0.4)', borderColor: '#1ABFB8' },
  chipText: { color: 'rgba(180,230,228,0.7)', fontSize: 13 },
  chipTextActive: { color: '#FFFFFF', fontWeight: '700' },
  saveBtn: {
    backgroundColor: '#0E7C7B', borderRadius: 14, height: 52,
    alignItems: 'center', justifyContent: 'center', marginTop: 20,
    borderWidth: 1, borderColor: '#1ABFB8',
    shadowColor: '#1ABFB8', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 8,
  },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});