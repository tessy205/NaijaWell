import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const ring1Scale = useRef(new Animated.Value(0)).current;
  const ring2Scale = useRef(new Animated.Value(0)).current;
  const loaderWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(ring1Scale, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(ring2Scale, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.spring(logoScale, { toValue: 1, friction: 5, tension: 40, useNativeDriver: true }),
      ]),
      Animated.timing(taglineOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(loaderWidth, { toValue: 1, duration: 1200, useNativeDriver: false }),
    ]).start();

    const timer = setTimeout(() => navigation.replace('Onboarding'), 3400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D2B2B" />

      <Animated.View style={[styles.ring, styles.ringLarge, { transform: [{ scale: ring1Scale }] }]} />
      <Animated.View style={[styles.ring, styles.ringSmall, { transform: [{ scale: ring2Scale }] }]} />

      <Animated.View style={[styles.logoBox, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <View style={styles.iconWrapper}>
          <Text style={styles.iconEmoji}>🌿</Text>
        </View>
        <Text style={styles.appName}>NaijaWell</Text>
        <View style={styles.flagStripe}>
          <View style={styles.flagGreen} />
          <View style={styles.flagWhite} />
          <View style={styles.flagGreen} />
        </View>
      </Animated.View>

      <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
        Your health. Our culture. One app.
      </Animated.Text>

      <View style={styles.loaderContainer}>
        <Animated.View
          style={[
            styles.loaderFill,
            {
              width: loaderWidth.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D2B2B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(26, 191, 184, 0.15)',
  },
  ringLarge: { width: 360, height: 360 },
  ringSmall: { width: 220, height: 220, borderColor: 'rgba(26, 191, 184, 0.1)' },
  logoBox: { alignItems: 'center', marginBottom: 18 },
  iconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: 'rgba(14, 124, 123, 0.3)',
    borderWidth: 1.5,
    borderColor: 'rgba(26, 191, 184, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#1ABFB8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 15,
  },
  iconEmoji: { fontSize: 50 },
  appName: {
    fontSize: 38,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(26, 191, 184, 0.7)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
    marginBottom: 12,
  },
  flagStripe: {
    flexDirection: 'row',
    width: 48,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  flagGreen: { flex: 1, backgroundColor: '#008751' },
  flagWhite: { flex: 1, backgroundColor: '#FFFFFF' },
  tagline: {
    fontSize: 14,
    color: 'rgba(180, 230, 228, 0.7)',
    letterSpacing: 0.5,
    fontStyle: 'italic',
    marginTop: 6,
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 70,
    width: 180,
    height: 3,
    backgroundColor: 'rgba(14, 124, 123, 0.25)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  loaderFill: {
    height: '100%',
    backgroundColor: '#1ABFB8',
    borderRadius: 10,
  },
});