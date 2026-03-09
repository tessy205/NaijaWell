import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Animated,
  StatusBar,
} from 'react-native';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    emoji: '🍛',
    title: 'Track Nigerian Foods',
    subtitle:
      'Search nutrition info for Jollof rice, Egusi soup, Suya, Puff-puff and hundreds of local Nigerian dishes.',
    accent: '#1ABFB8',
  },
  {
    id: '2',
    emoji: '🦟',
    title: 'Monitor Local Health Risks',
    subtitle:
      'Check malaria symptoms, log fever, track blood pressure — built for the health challenges Nigerians face daily.',
    accent: '#2DD4BF',
  },
  {
    id: '3',
    emoji: '🏥',
    title: 'Stay Healthy, Stay Strong',
    subtitle:
      'Set medicine reminders, find nearby clinics, and get daily health tips tailored to Nigerian lifestyles.',
    accent: '#0E7C7B',
  },
];

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.replace('Login');
    }
  };

  const renderSlide = ({ item }) => (
    <View style={styles.slide}>
      <View style={[styles.emojiRing, { borderColor: item.accent + '55' }]}>
        <View style={[styles.emojiInner, { backgroundColor: item.accent + '22' }]}>
          <Text style={styles.emojiText}>{item.emoji}</Text>
        </View>
      </View>
      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
    </View>
  );

  const Dot = ({ index }) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    const dotWidth = scrollX.interpolate({ inputRange, outputRange: [8, 28, 8], extrapolate: 'clamp' });
    const opacity = scrollX.interpolate({ inputRange, outputRange: [0.35, 1, 0.35], extrapolate: 'clamp' });
    return <Animated.View style={[styles.dot, { width: dotWidth, opacity }]} />;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D2B2B" />

      <TouchableOpacity style={styles.skipBtn} onPress={() => navigation.replace('Login')}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(e) => {
          setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
      />

      <View style={styles.bottom}>
        <View style={styles.dots}>
          {slides.map((_, i) => <Dot key={i} index={i} />)}
        </View>
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.85}>
          <Text style={styles.nextText}>
            {currentIndex === slides.length - 1 ? "Let's Go 🇳🇬" : 'Next →'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D2B2B' },
  skipBtn: { position: 'absolute', top: 56, right: 26, zIndex: 10 },
  skipText: { color: 'rgba(180,230,228,0.6)', fontSize: 15, fontWeight: '500' },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    paddingTop: 110,
  },
  emojiRing: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  emojiInner: {
    width: 130,
    height: 130,
    borderRadius: 65,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: { fontSize: 72 },
  slideTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  slideSubtitle: {
    fontSize: 15,
    color: 'rgba(180,230,228,0.7)',
    textAlign: 'center',
    lineHeight: 25,
  },
  bottom: { paddingBottom: 52, alignItems: 'center', gap: 26 },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { height: 8, borderRadius: 4, backgroundColor: '#1ABFB8' },
  nextBtn: {
    backgroundColor: '#0E7C7B',
    paddingVertical: 16,
    paddingHorizontal: 64,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#1ABFB8',
    shadowColor: '#1ABFB8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 10,
  },
  nextText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },
});