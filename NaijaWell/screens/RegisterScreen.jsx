import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT - Abuja','Gombe',
  'Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos',
  'Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto',
  'Taraba','Yobe','Zamfara',
];

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState('');
  const [state, setState] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const [stateModal, setStateModal] = useState(false);

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword || !age || !state) {
      Alert.alert('Missing Fields', 'Please fill in all fields including your state.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Your passwords do not match.');
      return;
    }
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
      Alert.alert('Invalid Age', 'Please enter a valid age (13–120).');
      return;
    }

    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      const userData = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        age: ageNum,
        state,
        joinedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem('naijawell_user', JSON.stringify(userData));
      await AsyncStorage.setItem('naijawell_loggedIn', 'true');
      await AsyncStorage.setItem('naijawell_currentUser', JSON.stringify(userData));

      Alert.alert(
        '🎉 Welcome to NaijaWell!',
        `E don set, ${fullName.split(' ')[0]}! Your health journey starts now.`,
        [{ text: 'Let\'s Go 🇳🇬', onPress: () => navigation.replace('Home') }]
      );
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, icon, value, onChange, placeholder, keyboard, secure, fieldKey, rightIcon, onRight }) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, focused === fieldKey && styles.inputFocused]}>
        <Text style={styles.icon}>{icon}</Text>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="rgba(180,230,228,0.35)"
          value={value}
          onChangeText={onChange}
          keyboardType={keyboard || 'default'}
          secureTextEntry={secure}
          autoCapitalize={fieldKey === 'email' ? 'none' : 'words'}
          autoCorrect={false}
          onFocus={() => setFocused(fieldKey)}
          onBlur={() => setFocused('')}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRight}>
            <Text style={styles.icon}>{rightIcon}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0D2B2B" />
      <View style={styles.bgCircle} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join NaijaWell — built for your health 🇳🇬</Text>

        <View style={styles.card}>
          <Field label="Full Name" icon="👤" value={fullName} onChange={setFullName}
            placeholder="Your full name" fieldKey="name" />
          <Field label="Email Address" icon="📧" value={email} onChange={setEmail}
            placeholder="you@example.com" keyboard="email-address" fieldKey="email" />
          <Field label="Age" icon="🎂" value={age} onChange={setAge}
            placeholder="Your age" keyboard="number-pad" fieldKey="age" />

          {/* State Picker */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>State of Residence</Text>
            <TouchableOpacity
              style={[styles.inputRow, focused === 'state' && styles.inputFocused]}
              onPress={() => setStateModal(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.icon}>📍</Text>
              <Text style={[styles.input, { color: state ? '#FFFFFF' : 'rgba(180,230,228,0.35)' }]}>
                {state || 'Select your state'}
              </Text>
              <Text style={styles.icon}>▾</Text>
            </TouchableOpacity>
          </View>

          <Field label="Password" icon="🔒" value={password} onChange={setPassword}
            placeholder="Min. 6 characters" secure={!showPassword} fieldKey="password"
            rightIcon={showPassword ? '🙈' : '👁️'} onRight={() => setShowPassword(!showPassword)} />
          <Field label="Confirm Password" icon="✅" value={confirmPassword}
            onChange={setConfirmPassword} placeholder="Re-enter password"
            secure={!showPassword} fieldKey="confirm" />

          <TouchableOpacity
            style={[styles.registerBtn, loading && { opacity: 0.7 }]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.registerBtnText}>Create My Account 🌿</Text>
            }
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLinkText}>
            Already have an account? <Text style={styles.loginLinkBold}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* State Modal */}
      <Modal visible={stateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Select Your State</Text>
            <FlatList
              data={NIGERIAN_STATES}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.stateItem, state === item && styles.stateItemActive]}
                  onPress={() => { setState(item); setStateModal(false); }}
                >
                  <Text style={[styles.stateText, state === item && styles.stateTextActive]}>
                    {item}
                  </Text>
                  {state === item && <Text>✅</Text>}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.modalClose} onPress={() => setStateModal(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D2B2B' },
  bgCircle: {
    position: 'absolute', width: 260, height: 260, borderRadius: 130,
    backgroundColor: 'rgba(14,124,123,0.1)', top: -60, left: -50,
  },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 50 },
  backBtn: { marginBottom: 20 },
  backText: { color: '#1ABFB8', fontSize: 16, fontWeight: '600' },
  title: { fontSize: 30, fontWeight: '800', color: '#FFFFFF', marginBottom: 6 },
  subtitle: { fontSize: 14, color: 'rgba(180,230,228,0.6)', marginBottom: 26, lineHeight: 20 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 24, padding: 22,
    borderWidth: 1, borderColor: 'rgba(26,191,184,0.2)', marginBottom: 22,
  },
  fieldGroup: { marginBottom: 16 },
  label: { color: 'rgba(180,230,228,0.85)', fontSize: 13, fontWeight: '600', marginBottom: 8 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(14,124,123,0.12)', borderRadius: 14,
    borderWidth: 1.5, borderColor: 'rgba(26,191,184,0.2)',
    paddingHorizontal: 14, height: 52,
  },
  inputFocused: { borderColor: '#1ABFB8', backgroundColor: 'rgba(14,124,123,0.22)' },
  icon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, color: '#FFFFFF', fontSize: 15 },
  registerBtn: {
    backgroundColor: '#0E7C7B', borderRadius: 14, height: 54,
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
    borderWidth: 1, borderColor: '#1ABFB8',
    shadowColor: '#1ABFB8', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 14, elevation: 10,
  },
  registerBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  loginLink: { alignItems: 'center' },
  loginLinkText: { color: 'rgba(180,230,228,0.6)', fontSize: 14 },
  loginLinkBold: { color: '#1ABFB8', fontWeight: '700' },
  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#0D2B2B', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, maxHeight: '75%',
    borderTopWidth: 1, borderColor: 'rgba(26,191,184,0.25)',
  },
  modalTitle: {
    fontSize: 18, fontWeight: '700', color: '#FFFFFF',
    marginBottom: 16, textAlign: 'center',
  },
  stateItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12, marginBottom: 4,
    backgroundColor: 'rgba(14,124,123,0.08)',
  },
  stateItemActive: { backgroundColor: 'rgba(14,124,123,0.28)', borderWidth: 1, borderColor: '#1ABFB8' },
  stateText: { color: 'rgba(180,230,228,0.8)', fontSize: 15 },
  stateTextActive: { color: '#FFFFFF', fontWeight: '700' },
  modalClose: {
    marginTop: 16, backgroundColor: '#0E7C7B', borderRadius: 14,
    height: 50, alignItems: 'center', justifyContent: 'center',
  },
  modalCloseText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});