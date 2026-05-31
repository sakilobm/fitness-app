import React, { useState } from 'react';
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
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Typography, Shadows } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '@/components/ui/GlassCard';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  // Input / Visual Screen state togglers
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  // validation / focus states
  const [emailFocus, setEmailFocus] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isEmailValid = (text: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(text);
  };

  const handleSendReset = () => {
    setErrorMessage('');
    setEmailTouched(true);

    if (!isEmailValid(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsSending(true);

    // Simulate link dispatching
    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);
    }, 1500);
  };

  const getEmailBorderColor = () => {
    if (emailFocus) return Colors.lime;
    if (emailTouched) {
      return isEmailValid(email) ? Colors.lime : Colors.danger;
    }
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

          {/* Dynamic Render: Input Form vs. Success Screens */}
          {!isSent ? (
            <>
              {/* Typography Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Reset Password</Text>
                <Text style={styles.subtitle}>Enter the email address associated with your account, and we will send a secure recovery link.</Text>
              </View>

              {/* Form card */}
              <GlassCard style={styles.formCard} accentColor={Colors.lime}>
                {errorMessage ? (
                  <View style={styles.errorBanner}>
                    <Ionicons name="alert-circle-outline" size={18} color={Colors.danger} />
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  </View>
                ) : null}

                {/* Email Field Block */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Registered Email</Text>
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
                      placeholder="Enter registered email"
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

                {/* Primary Button send reset link */}
                <TouchableOpacity
                  style={[styles.submitButton, Shadows.lime, isSending && styles.disabledButton]}
                  activeOpacity={0.85}
                  onPress={handleSendReset}
                  disabled={isSending}
                >
                  {isSending ? (
                    <ActivityIndicator size="small" color={Colors.white} />
                  ) : (
                    <>
                      <Text style={styles.submitButtonText}>Send Reset Link</Text>
                      <Ionicons name="paper-plane-outline" size={20} color={Colors.white} />
                    </>
                  )}
                </TouchableOpacity>
              </GlassCard>
            </>
          ) : (
            /* Success Display Screen */
            <View style={styles.successContainer}>
              <GlassCard style={styles.successCard} accentColor={Colors.lime}>
                {/* Glowing Success Icon Wrapper */}
                <View style={styles.successIconWrapper}>
                  <Ionicons name="mail-open-outline" size={48} color={Colors.lime} />
                </View>

                <Text style={styles.successTitle}>Recovery Link Sent!</Text>
                
                <View style={styles.emailChip}>
                  <Ionicons name="mail" size={14} color={Colors.text.accent} />
                  <Text style={styles.emailChipText}>{email}</Text>
                </View>

                <Text style={styles.successDescription}>
                  We have successfully dispatched a secure password recovery code and instruction link to your registered inbox. Please inspect your folder and spam segments.
                </Text>

                {/* Back to Login Primary Button */}
                <TouchableOpacity
                  style={[styles.backToLoginBtn, Shadows.lime]}
                  activeOpacity={0.85}
                  onPress={() => router.replace('/(auth)/login')}
                >
                  <Text style={styles.backToLoginBtnText}>Back to Login</Text>
                  <Ionicons name="arrow-forward-outline" size={18} color={Colors.white} />
                </TouchableOpacity>
              </GlassCard>
            </View>
          )}

          {/* Bottom Back Button Link */}
          {!isSent ? (
            <TouchableOpacity
              style={styles.toggleAuthView}
              activeOpacity={0.7}
              onPress={() => router.back()}
              disabled={isSending}
            >
              <Text style={styles.toggleAuthAction}>Return to Sign In</Text>
            </TouchableOpacity>
          ) : null}
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
  toggleAuthView: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
    paddingVertical: Spacing.xs,
  },
  toggleAuthAction: {
    ...Typography.captionBold,
    color: Colors.text.accent,
  },
  /* Success Styles */
  successContainer: {
    marginTop: Spacing.md,
    width: '100%',
  },
  successCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  successIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: Radius.xl,
    backgroundColor: 'rgba(46,125,94,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  successTitle: {
    ...Typography.h2,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.overlay,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  emailChipText: {
    ...Typography.captionBold,
    color: Colors.text.accent,
  },
  successDescription: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.sm,
  },
  backToLoginBtn: {
    flexDirection: 'row',
    height: 48,
    backgroundColor: Colors.lime,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    width: '100%',
  },
  backToLoginBtnText: {
    ...Typography.bodyBold,
    color: Colors.white,
  },
});
