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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Short Password', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1400));
      const stored = await AsyncStorage.getItem('naijawell_user');
      if (stored) {
        const user = JSON.parse(stored);
        if (user.email === email.trim().toLowerCase() && user.password === password) {
          await AsyncStorage.setItem('naijawell_loggedIn', 'true');
          await AsyncStorage.setItem('naijawell_currentUser', JSON.stringify(user));
          navigation.replace('Home');
        } else {
          Alert.alert('Login Failed', 'Incorrect email or password. Please try again.');
        }
      } else {
        Alert.alert(
          'No Account Found',
          'No account exists with this email. Create one?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Register', onPress: () => navigation.navigate('Register') },
          ]
        );
      }
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0D2B2B" />
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🌿</Text>
          <Text style={styles.appName}>NaijaWell</Text>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue your health journey</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={[styles.inputRow, focused === 'email' && styles.inputFocused]}>
              <Text style={styles.icon}>📧</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="rgba(180,230,228,0.35)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused('')}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={[styles.inputRow, focused === 'pass' && styles.inputFocused]}>
              <Text style={styles.icon}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="rgba(180,230,228,0.35)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                onFocus={() => setFocused('pass')}
                onBlur={() => setFocused('')}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Text style={styles.icon}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          {/* Login button */}
          <TouchableOpacity
            style={[styles.loginBtn, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.loginBtnText}>Sign In</Text>
            }
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.divLine} />
            <Text style={styles.divText}>or</Text>
            <View style={styles.divLine} />
          </View>

          <TouchableOpacity
            style={styles.registerBtn}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerBtnText}>Create New Account</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.terms}>
          🇳🇬 Built for Nigerians, by Nigerians
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D2B2B' },
  bgCircle1: {
    position: 'absolute', width: 280, height: 280, borderRadius: 140,
    backgroundColor: 'rgba(14,124,123,0.12)', top: -70, right: -50,
  },
  bgCircle2: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(26,191,184,0.07)', bottom: 80, left: -50,
  },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 68, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 32 },
  logo: { fontSize: 42, marginBottom: 6 },
  appName: {
    fontSize: 22, fontWeight: '800', color: '#1ABFB8',
    letterSpacing: 1.5, marginBottom: 18,
  },
  title: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', marginBottom: 6 },
  subtitle: { fontSize: 14, color: 'rgba(180,230,228,0.6)', textAlign: 'center' },
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: 'rgba(26,191,184,0.2)',
  },
  fieldGroup: { marginBottom: 18 },
  label: { color: 'rgba(180,230,228,0.85)', fontSize: 13, fontWeight: '600', marginBottom: 8 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(14,124,123,0.12)',
    borderRadius: 14, borderWidth: 1.5,
    borderColor: 'rgba(26,191,184,0.2)',
    paddingHorizontal: 14, height: 52,
  },
  inputFocused: { borderColor: '#1ABFB8', backgroundColor: 'rgba(14,124,123,0.2)' },
  icon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, color: '#FFFFFF', fontSize: 15 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 22, marginTop: -4 },
  forgotText: { color: '#1ABFB8', fontSize: 13, fontWeight: '500' },
  loginBtn: {
    backgroundColor: '#0E7C7B', borderRadius: 14, height: 54,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#1ABFB8',
    shadowColor: '#1ABFB8', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 14, elevation: 10,
  },
  loginBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  divLine: { flex: 1, height: 1, backgroundColor: 'rgba(26,191,184,0.2)' },
  divText: { color: 'rgba(180,230,228,0.45)', paddingHorizontal: 12, fontSize: 13 },
  registerBtn: {
    borderWidth: 1.5, borderColor: '#0E7C7B',
    borderRadius: 14, height: 54,
    alignItems: 'center', justifyContent: 'center',
  },
  registerBtnText: { color: '#1ABFB8', fontSize: 16, fontWeight: '600' },
  terms: { textAlign: 'center', color: 'rgba(180,230,228,0.4)', fontSize: 13, marginTop: 24 },
});