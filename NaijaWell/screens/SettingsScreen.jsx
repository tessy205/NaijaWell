import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  ScrollView, Switch, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const APP_VERSION = '1.0.0';

export default function SettingsScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState(true);
  const [medicineAlerts, setMedicineAlerts] = useState(true);
  const [healthTipsDaily, setHealthTipsDaily] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);

  useEffect(() => { loadUser(); loadSettings(); }, []);

  const loadUser = async () => {
    try {
      const data = await AsyncStorage.getItem('naijawell_currentUser');
      if (data) setUser(JSON.parse(data));
    } catch {}
  };

  const loadSettings = async () => {
    try {
      const s = await AsyncStorage.getItem('naijawell_settings');
      if (s) {
        const p = JSON.parse(s);
        setNotifications(p.notifications ?? true);
        setMedicineAlerts(p.medicineAlerts ?? true);
        setHealthTipsDaily(p.healthTipsDaily ?? true);
        setDataSharing(p.dataSharing ?? false);
      }
    } catch {}
  };

  const saveSetting = async (key, value) => {
    try {
      const s = await AsyncStorage.getItem('naijawell_settings');
      const current = s ? JSON.parse(s) : {};
      await AsyncStorage.setItem('naijawell_settings', JSON.stringify({ ...current, [key]: value }));
    } catch {}
  };

  // ── WORKING LOGOUT ────────────────────────────────────────────────
  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of NaijaWell?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out', style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem('naijawell_loggedIn');
            await AsyncStorage.removeItem('naijawell_currentUser');
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          } catch {
            Alert.alert('Error', 'Could not log out. Please try again.');
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '⚠️ Delete Account',
      'This permanently deletes your account AND all health data on this device. Cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything', style: 'destructive',
          onPress: async () => {
            try {
              const allKeys = await AsyncStorage.getAllKeys();
              await AsyncStorage.multiRemove(allKeys.filter((k) => k.startsWith('naijawell_')));
              navigation.reset({ index: 0, routes: [{ name: 'Splash' }] });
            } catch { Alert.alert('Error', 'Could not delete. Try again.'); }
          },
        },
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert('Clear Health Data', 'Delete all logs but keep your account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear Data', style: 'destructive',
        onPress: async () => {
          const keys = [
            'naijawell_bp_logs', 'naijawell_fever_logs', 'naijawell_bmi_history',
            'naijawell_malaria_logs', 'naijawell_stress_logs', 'naijawell_sleep_logs',
            'naijawell_medicine_reminders', 'naijawell_profile_extra', 'naijawell_saved_tips',
          ];
          try {
            await AsyncStorage.multiRemove(keys);
            Alert.alert('✅ Cleared', 'All health data removed. Your account is still active.');
          } catch {}
        },
      },
    ]);
  };

  const Toggle = ({ label, sub, icon, value, onToggle }) => (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowIcon}>{icon}</Text>
        <View>
          <Text style={styles.rowLabel}>{label}</Text>
          {sub && <Text style={styles.rowSub}>{sub}</Text>}
        </View>
      </View>
      <Switch
        value={value} onValueChange={onToggle}
        trackColor={{ false: 'rgba(26,191,184,0.2)', true: '#0E7C7B' }}
        thumbColor={value ? '#1ABFB8' : 'rgba(180,230,228,0.4)'}
      />
    </View>
  );

  const Action = ({ label, sub, icon, onPress, danger }) => (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.75}>
      <Text style={styles.rowIcon}>{icon}</Text>
      <View style={styles.rowBody}>
        <Text style={[styles.rowLabel, danger && { color: '#EF5350' }]}>{label}</Text>
        {sub && <Text style={styles.rowSub}>{sub}</Text>}
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );

  const Info = ({ label, value }) => (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.infoVal}>{value}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D2B2B" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>⚙️ Settings</Text>
          <Text style={styles.headerSub}>Manage your NaijaWell preferences</Text>
        </View>

        {/* User card */}
        {user && (
          <View style={styles.userCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.fullName?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{user.fullName}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              {user.state && <Text style={styles.userState}>📍 {user.state}</Text>}
            </View>
            <TouchableOpacity style={styles.editProfileBtn} onPress={() => navigation.navigate('Profile')}>
              <Text style={styles.editProfileText}>Edit</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Notifications section */}
        <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
        <View style={styles.card}>
          <Toggle label="Push Notifications" sub="Enable all app alerts" icon="🔔"
            value={notifications} onToggle={(v) => { setNotifications(v); saveSetting('notifications', v); }} />
          <View style={styles.div} />
          <Toggle label="Medicine Reminders" sub="Alerts to take your medications" icon="💊"
            value={medicineAlerts} onToggle={(v) => { setMedicineAlerts(v); saveSetting('medicineAlerts', v); }} />
          <View style={styles.div} />
          <Toggle label="Daily Health Tips" sub="Morning health tip for Nigerians" icon="💡"
            value={healthTipsDaily} onToggle={(v) => { setHealthTipsDaily(v); saveSetting('healthTipsDaily', v); }} />
        </View>

        {/* Privacy */}
        <Text style={styles.sectionTitle}>PRIVACY</Text>
        <View style={styles.card}>
          <Toggle label="Anonymous Data Sharing" sub="Help improve NaijaWell (no personal info)" icon="🔒"
            value={dataSharing} onToggle={(v) => { setDataSharing(v); saveSetting('dataSharing', v); }} />
        </View>

        {/* Quick links */}
        <Text style={styles.sectionTitle}>QUICK LINKS</Text>
        <View style={styles.card}>
          <Action label="Health History" sub="View all your logged records" icon="📋"
            onPress={() => navigation.navigate('HealthHistory')} />
          <View style={styles.div} />
          <Action label="Progress Charts" sub="See your health trends" icon="📊"
            onPress={() => navigation.navigate('Progress')} />
          <View style={styles.div} />
          <Action label="Find Nearby Clinic" sub="Hospitals & pharmacies near you" icon="🏥"
            onPress={() => navigation.navigate('FindClinic')} />
          <View style={styles.div} />
          <Action label="My Profile" sub="Edit personal and medical info" icon="👤"
            onPress={() => navigation.navigate('Profile')} />
        </View>

        {/* About */}
        <Text style={styles.sectionTitle}>ABOUT</Text>
        <View style={styles.card}>
          <Info label="Version" value={APP_VERSION} />
          <View style={styles.div} />
          <Info label="Made for" value="🇳🇬 Nigerians" />
          <View style={styles.div} />
          <Info label="Data stored" value="On your device" />
          <View style={styles.div} />
          <Info label="NAFDAC Hotline" value="0800-162-3322" />
        </View>

        {/* Danger zone */}
        <Text style={styles.sectionTitle}>DATA MANAGEMENT</Text>
        <View style={styles.card}>
          <Action label="Clear Health Data" sub="Delete logs, keep account" icon="🗑️"
            onPress={handleClearData} danger />
          <View style={styles.div} />
          <Action label="Delete Account" sub="Remove all data permanently" icon="❌"
            onPress={handleDeleteAccount} danger />
        </View>

        {/* Logout button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>NaijaWell v{APP_VERSION} · Built with 💚 for Nigeria 🇳🇬</Text>

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
  userCard: {
    flexDirection: 'row', alignItems: 'center', margin: 22,
    backgroundColor: 'rgba(14,124,123,0.2)', borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: 'rgba(26,191,184,0.25)', gap: 14,
  },
  avatar: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: '#0E7C7B', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#1ABFB8',
  },
  avatarText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  userName: { color: '#FFFFFF', fontWeight: '700', fontSize: 15, marginBottom: 2 },
  userEmail: { color: 'rgba(180,230,228,0.55)', fontSize: 12, marginBottom: 2 },
  userState: { color: 'rgba(180,230,228,0.45)', fontSize: 11 },
  editProfileBtn: {
    backgroundColor: 'rgba(26,191,184,0.15)', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(26,191,184,0.3)',
  },
  editProfileText: { color: '#1ABFB8', fontWeight: '700', fontSize: 12 },
  sectionTitle: {
    paddingHorizontal: 22, paddingTop: 14, paddingBottom: 8,
    color: 'rgba(180,230,228,0.45)', fontSize: 11, fontWeight: '700', letterSpacing: 1,
  },
  card: {
    marginHorizontal: 22,
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 18,
    borderWidth: 1, borderColor: 'rgba(26,191,184,0.15)', overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  rowBody: { flex: 1 },
  rowIcon: { fontSize: 20 },
  rowLabel: { color: '#FFFFFF', fontWeight: '600', fontSize: 14, marginBottom: 1 },
  rowSub: { color: 'rgba(180,230,228,0.5)', fontSize: 11 },
  chevron: { color: 'rgba(180,230,228,0.35)', fontSize: 22 },
  infoVal: { color: 'rgba(180,230,228,0.75)', fontWeight: '600', fontSize: 13 },
  div: { height: 1, backgroundColor: 'rgba(26,191,184,0.08)', marginHorizontal: 16 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 22, marginTop: 20,
    backgroundColor: 'rgba(239,83,80,0.1)', borderRadius: 16, height: 56,
    borderWidth: 1.5, borderColor: 'rgba(239,83,80,0.35)', gap: 10,
  },
  logoutIcon: { fontSize: 20 },
  logoutText: { color: '#EF5350', fontSize: 17, fontWeight: '800' },
  footer: { textAlign: 'center', color: 'rgba(180,230,228,0.3)', fontSize: 12, marginTop: 20 },
});