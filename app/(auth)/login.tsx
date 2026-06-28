import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Typography, Shadows } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '@/components/ui/GlassCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase, performOAuth } from '@/lib/supabase';
import { formatErrorMessage } from '@/utils/errorUtils';

export default function LoginScreen() {
  const router = useRouter();

  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // validation / focus states
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Email format verification helper
  const isEmailValid = (text: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(text);
  };

  const handleLogin = async () => {
    setErrorMessage('');
    setEmailTouched(true);

    if (!isEmailValid(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoggingIn(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(formatErrorMessage(error));
      }
    } catch (err: any) {
      setErrorMessage(formatErrorMessage(err));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSocialBypass = async (platform: 'Google' | 'Apple') => {
    setIsLoggingIn(true);
    setErrorMessage('');
    try {
      await performOAuth(platform.toLowerCase() as 'google' | 'apple');
      // On success, state will update automatically via AppContext listener
    } catch (error: any) {
      setErrorMessage(formatErrorMessage(error));
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Determine Email Field border color dynamically
  const getEmailBorderColor = () => {
    if (emailFocus) return Colors.lime;
    if (emailTouched) {
      return isEmailValid(email) ? Colors.lime : Colors.danger;
    }
    return Colors.cardBorder;
  };

  // Determine Password Field border color dynamically
  const getPasswordBorderColor = () => {
    if (passwordFocus) return Colors.lime;
    if (password && password.length >= 6) return Colors.lime;
    if (password && password.length < 6) return Colors.danger;
    return Colors.cardBorder;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back Navigation Nav */}
          <View style={styles.navBar}>
            <TouchableOpacity
              style={styles.backButton}
              activeOpacity={0.7}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Typography Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to resume tracking and logging your daily fitness metrics.</Text>
          </View>

          {/* Form Container GlassCard */}
          <GlassCard style={styles.formCard} accentColor={Colors.lime}>
            {errorMessage ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle-outline" size={18} color={Colors.danger} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Email Field Block */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View
                style={[
                  styles.inputWrapper,
                  { borderColor: getEmailBorderColor() },
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={emailFocus ? Colors.lime : Colors.text.secondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailTouched) setErrorMessage('');
                  }}
                  onFocus={() => setEmailFocus(true)}
                  onBlur={() => {
                    setEmailFocus(false);
                    setEmailTouched(true);
                  }}
                  placeholder="Enter email address"
                  placeholderTextColor={Colors.muted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.textInput}
                />
                {emailTouched && (
                  <Ionicons
                    name={isEmailValid(email) ? 'checkmark-circle' : 'close-circle'}
                    size={18}
                    color={isEmailValid(email) ? Colors.lime : Colors.danger}
                    style={styles.validationIcon}
                  />
                )}
              </View>
            </View>

            {/* Password Field Block */}
            <View style={styles.inputGroup}>
              <View style={styles.labelForgotRow}>
                <Text style={styles.inputLabel}>Password</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => router.push('/(auth)/forgot')}
                >
                  <Text style={styles.forgotAction}>Forgot?</Text>
                </TouchableOpacity>
              </View>
              <View
                style={[
                  styles.inputWrapper,
                  { borderColor: getPasswordBorderColor() },
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={passwordFocus ? Colors.lime : Colors.text.secondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setErrorMessage('');
                  }}
                  onFocus={() => setPasswordFocus(true)}
                  onBlur={() => setPasswordFocus(false)}
                  placeholder="Enter your password"
                  placeholderTextColor={Colors.muted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.textInput}
                />
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={Colors.text.secondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Primary Action Sign In Button */}
            <TouchableOpacity
              style={[styles.submitButton, Shadows.lime, isLoggingIn && styles.disabledButton]}
              activeOpacity={0.85}
              onPress={handleLogin}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Sign In</Text>
                  <Ionicons name="log-in-outline" size={20} color={Colors.white} />
                </>
              )}
            </TouchableOpacity>
          </GlassCard>

          {/* Social Bypass Block */}
          <View style={styles.socialSection}>
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerLabel}>OR QUICK BYPASS</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtonsRow}>
              <TouchableOpacity
                style={[styles.socialButton, styles.googleButton]}
                activeOpacity={0.8}
                onPress={() => handleSocialBypass('Google')}
                disabled={isLoggingIn}
              >
                <Ionicons name="logo-google" size={18} color="#EA4335" />
                <Text style={[styles.socialText, { color: '#EA4335' }]}>Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.socialButton, styles.appleButton]}
                activeOpacity={0.8}
                onPress={() => handleSocialBypass('Apple')}
                disabled={isLoggingIn}
              >
                <Ionicons name="logo-apple" size={18} color="#1C1C1E" />
                <Text style={[styles.socialText, { color: '#1C1C1E' }]}>Apple</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom Account Switch Prompt */}
          <TouchableOpacity
            style={styles.toggleAuthView}
            activeOpacity={0.7}
            onPress={() => router.push('/(auth)/signup')}
            disabled={isLoggingIn}
          >
            <Text style={styles.toggleAuthLabel}>New to Vividly? </Text>
            <Text style={styles.toggleAuthAction}>Create Account</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  navBar: {
    height: 48,
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  header: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h1,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  formCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.dangerOverlay,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.danger + '20',
  },
  errorText: {
    ...Typography.captionBold,
    color: Colors.text.danger,
    flex: 1,
  },
  inputGroup: {
    gap: Spacing.xs,
  },
  inputLabel: {
    ...Typography.captionBold,
    color: Colors.text.primary,
    marginLeft: Spacing.xs,
  },
  labelForgotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  forgotAction: {
    ...Typography.captionBold,
    color: Colors.text.accent,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.ivory,
    borderWidth: 1,
    borderRadius: Radius.md,
    height: 48,
    paddingHorizontal: Spacing.md,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  textInput: {
    flex: 1,
    height: '100%',
    ...Typography.body,
    color: Colors.text.primary,
  },
  validationIcon: {
    marginLeft: Spacing.sm,
  },
  eyeButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  submitButton: {
    flexDirection: 'row',
    height: 50,
    backgroundColor: Colors.lime,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  disabledButton: {
    opacity: 0.8,
  },
  submitButtonText: {
    ...Typography.bodyBold,
    color: Colors.white,
  },
  socialSection: {
    marginTop: Spacing.xl,
    gap: Spacing.lg,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  dividerLabel: {
    ...Typography.micro,
    color: Colors.text.secondary,
    fontWeight: '800',
  },
  socialButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.sm,
    backgroundColor: Colors.card,
  },
  googleButton: {
    borderColor: '#EA433520',
    backgroundColor: '#EA433506',
  },
  appleButton: {
    borderColor: '#1C1C1E20',
    backgroundColor: '#1C1C1E06',
  },
  socialText: {
    ...Typography.captionBold,
  },
  toggleAuthView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
    paddingVertical: Spacing.xs,
  },
  toggleAuthLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  toggleAuthAction: {
    ...Typography.captionBold,
    color: Colors.text.accent,
  },
});
