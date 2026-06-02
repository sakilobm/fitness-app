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

export default function SignupScreen() {
  const router = useRouter();

  // Input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // validation / loaders / focus states
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [nameFocus, setNameFocus] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);

  const [nameTouched, setNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Email format check helper
  const isEmailValid = (text: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(text);
  };

  // Password strength calculator
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: Colors.muted, width: '0%' };
    if (pass.length < 6) return { score: 1, label: 'Weak 🔴', color: Colors.danger, width: '33%' };

    const hasUpper = /[A-Z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecial = /[^A-Za-z0-9]/.test(pass);

    const complexity = [hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

    if (pass.length >= 8 && complexity >= 2) {
      return { score: 3, label: 'Strong 🟢', color: Colors.lime, width: '100%' };
    }
    return { score: 2, label: 'Medium 🟡', color: Colors.amber, width: '66%' };
  };

  const strength = getPasswordStrength(password);

  const handleSignup = async () => {
    setErrorMessage('');
    setNameTouched(true);
    setEmailTouched(true);

    if (name.trim().length < 2) {
      setErrorMessage('Please enter your name.');
      return;
    }
    if (!isEmailValid(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (strength.score < 2) {
      setErrorMessage('Password is too weak. Please use at least 6 characters.');
      return;
    }

    setIsSigningUp(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name.trim(),
        },
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setIsSigningUp(false);
    } else {
      setIsSigningUp(false);
      if (!data.session) {
        // Email confirmation required — session won't exist until they verify
        setConfirmationSent(true);
      }
      // If session exists, onAuthStateChange handles routing automatically
    }
  };

  const handleSocialBypass = async (platform: 'Google' | 'Apple') => {
    setIsSigningUp(true);
    setErrorMessage('');
    try {
      await performOAuth(platform.toLowerCase() as 'google' | 'apple');
      // On success, state will update automatically via AppContext listener
    } catch (error: any) {
      setErrorMessage(error.message || `Failed to sign up with ${platform}`);
    } finally {
      setIsSigningUp(false);
    }
  };

  // Borders outline calculations
  const getNameBorderColor = () => {
    if (nameFocus) return Colors.lime;
    if (nameTouched) {
      return name.trim().length >= 2 ? Colors.lime : Colors.danger;
    }
    return Colors.cardBorder;
  };

  const getEmailBorderColor = () => {
    if (emailFocus) return Colors.lime;
    if (emailTouched) {
      return isEmailValid(email) ? Colors.lime : Colors.danger;
    }
    return Colors.cardBorder;
  };

  const getPasswordBorderColor = () => {
    if (passwordFocus) return Colors.lime;
    if (password) {
      return strength.score >= 2 ? Colors.lime : Colors.danger;
    }
    return Colors.cardBorder;
  };

  if (confirmationSent) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.confirmContainer}>
          <GlassCard style={styles.confirmCard} accentColor={Colors.lime}>
            <Text style={styles.confirmIcon}>📬</Text>
            <Text style={styles.confirmTitle}>Check your email</Text>
            <Text style={styles.confirmBody}>
              We sent a confirmation link to{'\n'}
              <Text style={styles.confirmEmail}>{email}</Text>
            </Text>
            <Text style={styles.confirmHint}>
              Tap the link in the email to activate your account. Check your spam folder if you don't see it.
            </Text>
            <TouchableOpacity
              style={styles.confirmButton}
              activeOpacity={0.8}
              onPress={() => router.replace('/(auth)/login')}
            >
              <Text style={styles.confirmButtonText}>Back to Sign In</Text>
            </TouchableOpacity>
          </GlassCard>
        </View>
      </SafeAreaView>
    );
  }

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
          {/* NavBar */}
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to start tracking weigh-ins, planning meals, and creating habits.</Text>
          </View>

          {/* Glass Form Container */}
          <GlassCard style={styles.formCard} accentColor={Colors.lime}>
            {errorMessage ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle-outline" size={18} color={Colors.danger} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Full Name Block */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View
                style={[
                  styles.inputWrapper,
                  { borderColor: getNameBorderColor() },
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={nameFocus ? Colors.lime : Colors.text.secondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (nameTouched) setErrorMessage('');
                  }}
                  onFocus={() => setNameFocus(true)}
                  onBlur={() => {
                    setNameFocus(false);
                    setNameTouched(true);
                  }}
                  placeholder="Enter your name"
                  placeholderTextColor={Colors.muted}
                  autoCapitalize="words"
                  autoCorrect={false}
                  style={styles.textInput}
                />
                {nameTouched && (
                  <Ionicons
                    name={name.trim().length >= 2 ? 'checkmark-circle' : 'close-circle'}
                    size={18}
                    color={name.trim().length >= 2 ? Colors.lime : Colors.danger}
                    style={styles.validationIcon}
                  />
                )}
              </View>
            </View>

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
              <Text style={styles.inputLabel}>Create Password</Text>
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
                  placeholder="Create a strong password"
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

              {/* Password Strength Indicator Visual Panel */}
              {password ? (
                <View style={styles.strengthMeterContainer}>
                  <View style={styles.strengthHeaderRow}>
                    <Text style={styles.strengthLabel}>Password Strength:</Text>
                    <Text style={[styles.strengthValueText, { color: strength.color }]}>
                      {strength.label}
                    </Text>
                  </View>
                  <View style={styles.meterTrack}>
                    <View
                      style={[
                        styles.meterFill,
                        { width: strength.width as any, backgroundColor: strength.color },
                      ]}
                    />
                  </View>
                  <Text style={styles.strengthTip}>
                    Tip: Use 8+ characters, uppercase letters, and numbers.
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Submit Action Registration Button */}
            <TouchableOpacity
              style={[styles.submitButton, Shadows.lime, isSigningUp && styles.disabledButton]}
              activeOpacity={0.85}
              onPress={handleSignup}
              disabled={isSigningUp}
            >
              {isSigningUp ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Create Account</Text>
                  <Ionicons name="checkmark-circle-outline" size={20} color={Colors.white} />
                </>
              )}
            </TouchableOpacity>
          </GlassCard>

          {/* Social Bypass Grid */}
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
                disabled={isSigningUp}
              >
                <Ionicons name="logo-google" size={18} color="#EA4335" />
                <Text style={[styles.socialText, { color: '#EA4335' }]}>Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.socialButton, styles.appleButton]}
                activeOpacity={0.8}
                onPress={() => handleSocialBypass('Apple')}
                disabled={isSigningUp}
              >
                <Ionicons name="logo-apple" size={18} color="#1C1C1E" />
                <Text style={[styles.socialText, { color: '#1C1C1E' }]}>Apple</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Switch Account Action Footer */}
          <TouchableOpacity
            style={styles.toggleAuthView}
            activeOpacity={0.7}
            onPress={() => router.push('/(auth)/login')}
            disabled={isSigningUp}
          >
            <Text style={styles.toggleAuthLabel}>Already have an account? </Text>
            <Text style={styles.toggleAuthAction}>Log In</Text>
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
  strengthMeterContainer: {
    marginTop: Spacing.sm,
    gap: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  strengthHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  strengthLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  strengthValueText: {
    ...Typography.captionBold,
  },
  meterTrack: {
    height: 5,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 2,
  },
  meterFill: {
    height: '100%',
    borderRadius: 3,
  },
  strengthTip: {
    ...Typography.micro,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
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
  confirmContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  confirmCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  confirmIcon: {
    fontSize: 52,
    marginBottom: Spacing.xs,
  },
  confirmTitle: {
    ...Typography.h2,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  confirmBody: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  confirmEmail: {
    ...Typography.bodyBold,
    color: Colors.text.primary,
  },
  confirmHint: {
    ...Typography.caption,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  confirmButton: {
    height: 50,
    backgroundColor: Colors.lime,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.sm,
    alignSelf: 'stretch',
  },
  confirmButtonText: {
    ...Typography.bodyBold,
    color: Colors.white,
  },
});
