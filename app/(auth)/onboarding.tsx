import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Typography, Shadows } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '@/components/ui/GlassCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Slide {
  id: string;
  icon: string;
  iconColor: string;
  title: string;
  subtitle: string;
  quote: string;
  description: string;
}

const SLIDES: Slide[] = [
  {
    id: '1',
    icon: 'barbell-outline',
    iconColor: Colors.lime,
    title: 'Forge Your Path',
    subtitle: 'PRECISION TRACKING',
    quote: '“The body achieves what the mind believes.”',
    description: 'Log and monitor daily weight logs across morning, afternoon, and night slots to build consistent, dynamic metric trends.',
  },
  {
    id: '2',
    icon: 'restaurant-outline',
    iconColor: Colors.amber,
    title: 'Master Nutrition',
    subtitle: 'MACROS & SCORES',
    quote: '“Let food be thy medicine and medicine thy food.”',
    description: 'Track custom breakfast, lunch, and snack logs with automatic, high-fidelity macro scaling down to the single gram.',
  },
  {
    id: '3',
    icon: 'notifications-outline',
    iconColor: Colors.chart.fibre,
    title: 'Never Miss a Beat',
    subtitle: 'SMART DISPATCHERS',
    quote: '“Consistency beats intensity every single time.”',
    description: 'Receive custom contextual reminders, track hydration targets, and log physical steps with live active minutes trackers.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: any) => {
    const xOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(xOffset / SCREEN_WIDTH);
    if (index !== activeIndex && index >= 0 && index < SLIDES.length) {
      setActiveIndex(index);
    }
  };

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: (activeIndex + 1) * SCREEN_WIDTH,
        animated: true,
      });
      setActiveIndex(activeIndex + 1);
    } else {
      router.push('/(auth)/signup');
    }
  };

  const handleSkip = () => {
    router.push('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Upper Branding Bar */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoBadge}>
            <Ionicons name="flash" size={18} color={Colors.white} />
          </View>
          <Text style={styles.logoText}>FitForge</Text>
        </View>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Swipeable Carousel Container */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.carousel}
      >
        {SLIDES.map((slide) => (
          <View key={slide.id} style={styles.slideContainer}>
            <GlassCard style={styles.slideCard} accentColor={slide.iconColor}>
              {/* Dynamic Icon Ring */}
              <View style={[styles.iconWrapper, { backgroundColor: slide.iconColor + '15' }]}>
                <Ionicons name={slide.icon as any} size={48} color={slide.iconColor} />
              </View>

              {/* Slide Meta Headers */}
              <Text style={[styles.slideSubtitle, { color: slide.iconColor }]}>
                {slide.subtitle}
              </Text>
              <Text style={styles.slideTitle}>{slide.title}</Text>

              {/* Motivational Quote Block */}
              <View style={styles.quoteContainer}>
                <Text style={styles.quoteText}>{slide.quote}</Text>
              </View>

              {/* Descriptive details */}
              <Text style={styles.descriptionText}>{slide.description}</Text>
            </GlassCard>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Interactive Area */}
      <View style={styles.footer}>
        {/* Carousel Pagination Dots */}
        <View style={styles.paginationDots}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                activeIndex === index
                  ? [styles.activeDot, { backgroundColor: SLIDES[index].iconColor }]
                  : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        {/* Buttons Controls */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              Shadows.lime,
              { backgroundColor: SLIDES[activeIndex].iconColor },
            ]}
            activeOpacity={0.85}
            onPress={handleNext}
          >
            <Text style={styles.primaryButtonText}>
              {activeIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <Ionicons
              name={activeIndex === SLIDES.length - 1 ? 'checkmark-circle' : 'arrow-forward'}
              size={18}
              color={Colors.white}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.7}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.secondaryButtonLabel}>Already have an account? </Text>
            <Text style={styles.secondaryButtonAction}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoBadge: {
    backgroundColor: Colors.lime,
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    ...Typography.h3,
    color: Colors.text.primary,
  },
  skipButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  skipText: {
    ...Typography.captionBold,
    color: Colors.text.secondary,
  },
  carousel: {
    flex: 1,
  },
  slideContainer: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  slideCard: {
    width: '100%',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
  },
  iconWrapper: {
    width: 96,
    height: 96,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  slideSubtitle: {
    ...Typography.micro,
    fontWeight: '800',
    marginBottom: Spacing.xs,
  },
  slideTitle: {
    ...Typography.h1,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  quoteContainer: {
    backgroundColor: Colors.ivory,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
    width: '100%',
  },
  quoteText: {
    ...Typography.body,
    fontStyle: 'italic',
    color: Colors.text.accent,
    textAlign: 'center',
  },
  descriptionText: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.sm,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.lg,
  },
  paginationDots: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    width: 24,
  },
  inactiveDot: {
    width: 8,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  buttonGroup: {
    width: '100%',
    gap: Spacing.md,
  },
  primaryButton: {
    flexDirection: 'row',
    height: 52,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    width: '100%',
  },
  primaryButtonText: {
    ...Typography.bodyBold,
    color: Colors.white,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
  },
  secondaryButtonLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  secondaryButtonAction: {
    ...Typography.captionBold,
    color: Colors.text.accent,
  },
});
