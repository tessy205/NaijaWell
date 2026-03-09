import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';

// ── Batch 1: Screens 1–5 ──────────────────────────────────────────
import SplashScreen from './screens/SplashScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';

// ── Batch 2: Screens 6–10 ─────────────────────────────────────────
import NigerianFoodScreen from './screens/NigerianFoodScreen';
import MalariaCheckerScreen from './screens/MalariaCheckerScreen';
import BloodPressureScreen from './screens/BloodPressureScreen';
import FeverLogScreen from './screens/FeverLogScreen';
import WaterTrackerScreen from './screens/WaterTrackerScreen';

// ── Batch 3: Screens 11–15 ────────────────────────────────────────
import MedicineReminderScreen from './screens/MedicineReminderScreen';
import StressJournalScreen from './screens/StressJournalScreen';
import SleepTrackerScreen from './screens/SleepTrackerScreen';
import HealthTipsScreen from './screens/HealthTipsScreen';
import FindClinicScreen from './screens/FindClinicScreen';

// ── Batch 4: Screens 16–20 ────────────────────────────────────────
import BMIScreen from './screens/BMIScreen';
import ProgressScreen from './screens/ProgressScreen';
import HealthHistoryScreen from './screens/HealthHistoryScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const loggedIn = await AsyncStorage.getItem('naijawell_loggedIn');
        setInitialRoute(loggedIn === 'true' ? 'Home' : 'Splash');
      } catch {
        setInitialRoute('Splash');
      }
    })();
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0D2B2B', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#1ABFB8" size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false, animation: 'fade' }}
      >
        {/* ── Batch 1 ── */}
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />

        {/* ── Batch 2 ── */}
        <Stack.Screen name="NigerianFood" component={NigerianFoodScreen} />
        <Stack.Screen name="MalariaChecker" component={MalariaCheckerScreen} />
        <Stack.Screen name="BloodPressure" component={BloodPressureScreen} />
        <Stack.Screen name="FeverLog" component={FeverLogScreen} />
        <Stack.Screen name="Water" component={WaterTrackerScreen} />

        {/* ── Batch 3 ── */}
        <Stack.Screen name="Medicine" component={MedicineReminderScreen} />
        <Stack.Screen name="Stress" component={StressJournalScreen} />
        <Stack.Screen name="Sleep" component={SleepTrackerScreen} />
        <Stack.Screen name="HealthTips" component={HealthTipsScreen} />
        <Stack.Screen name="FindClinic" component={FindClinicScreen} />

        {/* ── Batch 4 ── */}
        <Stack.Screen name="BMI" component={BMIScreen} />
        <Stack.Screen name="Progress" component={ProgressScreen} />
        <Stack.Screen name="HealthHistory" component={HealthHistoryScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}