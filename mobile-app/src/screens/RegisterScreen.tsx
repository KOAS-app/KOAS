import { useState, useRef } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { findNodeHandle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { getApiError } from '../utils/apiError';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, radius, typography, shadows } from '../theme';
import type { StackScreenProps } from '@react-navigation/stack';
import type { AuthStackParamList } from '../navigation/types';

const koasLogo = require('../../assets/logo/koas_official_logo.png');

type Props = StackScreenProps<AuthStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState({ name: '', password: '', confirm: '', phoneNumber: '' });
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const scrollRef = useRef<ScrollView | null>(null);
  const inputPositions = useRef<Record<string, number>>({});
  const inputRefs = useRef<Record<string, any>>({});

  const scrollToInput = (key: string) => {
    setTimeout(() => {
      const input = inputRefs.current[key];
      if (!input || !scrollRef.current) return;
      try {
        input.measureLayout(
          scrollRef.current,
          (x: number, y: number) => {
            scrollRef.current?.scrollTo({ y: Math.max(y - 24, 0), animated: true });
          },
          () => {}
        );
      } catch (e) {
        // fallback
      }
    }, 100);
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter.';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number.';
    if (!/[^A-Za-z0-9]/.test(password)) return 'Password must contain at least one special character.';
    return null;
  };

  const handleRegister = async () => {
    if (!form.name || !form.password || !form.confirm || !form.phoneNumber) {
      Alert.alert('Required Fields', 'Please fill in all fields');
      return;
    }

    const passwordError = validatePassword(form.password);
    if (passwordError) {
      Alert.alert('Invalid Password', passwordError);
      return;
    }

    if (form.password !== form.confirm) {
      Alert.alert('Password Mismatch', 'Passwords do not match');
      return;
    }
    if (!/^\+251[79]\d{8}$/.test(form.phoneNumber)) {
      Alert.alert('Invalid Phone Number', 'Phone number must be in Ethiopian format: +251XXXXXXXXX');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name: form.name,
        password: form.password,
        phoneNumber: form.phoneNumber,
        role: 'PLAYER',
      });
      const { user, token } = res.data;
      await login(user, token);
    } catch (err) {
      Alert.alert('Registration Failed', getApiError(err, 'Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <LinearGradient
        colors={[colors.dark.bg, colors.dark.surface, colors.dark.bg]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Subtle Accent Glow */}
      <View style={styles.accentGlow} />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        >
          <ScrollView
            ref={(r) => { scrollRef.current = r; }}
            contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + spacing.xxl }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
          {/* Brand Header */}
          <View style={styles.header}>
            <Image 
              source={koasLogo} 
              style={styles.logo} 
              resizeMode="contain"
            />
            <Text style={styles.tagline}>Join thousands of players</Text>
          </View>

          {/* Auth Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Create account</Text>
              <Text style={styles.cardSubtitle}>Start booking your games today</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Name Input */}
              <View 
                style={styles.inputGroup}
                ref={(r) => { inputRefs.current['name'] = r; }}
              >
                <Text style={styles.label}>Full Name</Text>
                <View style={[
                  styles.inputWrapper,
                  focusedField === 'name' && styles.inputWrapperFocused,
                ]}>
                  <TextInput
                    style={styles.input}
                    placeholder="John Doe"
                    placeholderTextColor={colors.input.placeholder}
                    value={form.name}
                    onChangeText={(v) => setForm((p) => ({ ...p, name: v }))}
                    onFocus={() => {
                      setFocusedField('name');
                      scrollToInput('name');
                    }}
                    onBlur={() => setFocusedField(null)}
                    autoCapitalize="words"
                    editable={!loading}
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* Phone Number Input */}
              <View 
                style={styles.inputGroup}
                ref={(r) => { inputRefs.current['phoneNumber'] = r; }}
              >
                <Text style={styles.label}>Phone Number</Text>
                <View style={[
                  styles.inputWrapper,
                  focusedField === 'phoneNumber' && styles.inputWrapperFocused,
                ]}>
                  <TextInput
                    style={styles.input}
                    placeholder="+251912345678"
                    placeholderTextColor={colors.input.placeholder}
                    value={form.phoneNumber}
                    onChangeText={(v) => setForm((p) => ({ ...p, phoneNumber: v }))}
                    onFocus={() => {
                      setFocusedField('phoneNumber');
                      scrollToInput('phoneNumber');
                    }}
                    onBlur={() => setFocusedField(null)}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                    editable={!loading}
                    returnKeyType="next"
                  />
                </View>
                <Text style={styles.hint}>Ethiopian format: +251XXXXXXXXX</Text>
              </View>

              {/* Password Input */}
              <View 
                style={styles.inputGroup}
                ref={(r) => { inputRefs.current['password'] = r; }}
              >
                <Text style={styles.label}>Password</Text>
                <View style={[
                  styles.inputWrapper,
                  focusedField === 'password' && styles.inputWrapperFocused,
                ]}>
                  <View style={styles.passwordRow}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="At least 6 characters"
                      placeholderTextColor={colors.input.placeholder}
                      value={form.password}
                      onChangeText={(v) => setForm((p) => ({ ...p, password: v }))}
                      onFocus={() => {
                        setFocusedField('password');
                        scrollToInput('password');
                      }}
                      onBlur={() => setFocusedField(null)}
                      secureTextEntry={!showPassword}
                      editable={!loading}
                      returnKeyType="next"
                    />
                    <TouchableOpacity
                      style={styles.eyeBtn}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Feather name={showPassword ? 'eye' : 'eye-off'} size={20} color="#000" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Confirm Password Input */}
              <View 
                style={styles.inputGroup}
                ref={(r) => { inputRefs.current['confirm'] = r; }}
              >
                <Text style={styles.label}>Confirm Password</Text>
                <View style={[
                  styles.inputWrapper,
                  focusedField === 'confirm' && styles.inputWrapperFocused,
                ]}>
                  <View style={styles.passwordRow}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Re-enter your password"
                      placeholderTextColor={colors.input.placeholder}
                      value={form.confirm}
                      onChangeText={(v) => setForm((p) => ({ ...p, confirm: v }))}
                      onFocus={() => {
                        setFocusedField('confirm');
                        scrollToInput('confirm');
                      }}
                      onBlur={() => setFocusedField(null)}
                      secureTextEntry={!showConfirm}
                      editable={!loading}
                      returnKeyType="go"
                      onSubmitEditing={handleRegister}
                    />
                    <TouchableOpacity
                      style={styles.eyeBtn}
                      onPress={() => setShowConfirm(!showConfirm)}
                    >
                      <Feather name={showConfirm ? 'eye' : 'eye-off'} size={20} color="#000" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Create Account Button */}
              <TouchableOpacity
                style={[styles.btn, loading && styles.btnDisabled]}
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[colors.secondary, colors.secondary]}
                  style={styles.btnGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.btnText}>Create Account</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Terms */}
            <Text style={styles.terms}>
              By creating an account, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Sign In Link */}
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              disabled={loading}
              style={styles.signinButton}
              activeOpacity={0.7}
            >
              <Text style={styles.signinText}>
                Already have an account?{' '}
                <Text style={styles.signinLink}>Sign in</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Trust Badge */}
          <View style={styles.footer}>
            <View style={styles.trustBadge}>
              <View style={styles.trustDot} />
              <Text style={styles.trustText}>Secure · Trusted by 10,000+ players</Text>
            </View>
          </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.bg,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  accentGlow: {
    position: 'absolute',
    top: -100,
    left: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.secondary,
    opacity: 0.03,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
    // paddingTop is set dynamically from insets in the component
  },

  // ─── Header ────────────────────────────────────────────────
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl + spacing.sm,
  },
  logo: {
    width: 180,
    height: 60,
    marginBottom: spacing.md,
  },
  tagline: {
    fontSize: typography.sizes.base,
    color: colors.text.muted,
    fontWeight: typography.weights.medium,
    letterSpacing: 0.2,
  },

  // ─── Card ──────────────────────────────────────────────────
  card: {
    backgroundColor: colors.dark.card,
    borderRadius: radius.xl,
    padding: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.dark.border,
    ...shadows.lg,
  },
  cardHeader: {
    marginBottom: spacing.xl,
  },
  cardTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  cardSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
    fontWeight: typography.weights.medium,
  },

  // ─── Form ──────────────────────────────────────────────────
  form: {
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
    letterSpacing: 0.1,
  },
  inputWrapper: {
    backgroundColor: colors.input.bg,
    borderWidth: 1.5,
    borderColor: colors.input.border,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  inputWrapperFocused: {
    borderColor: colors.input.borderFocus,
    backgroundColor: colors.dark.elevated,
  },
  input: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    fontWeight: typography.weights.medium,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    fontWeight: typography.weights.medium,
  },
  eyeBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  hint: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: spacing.xs,
    fontWeight: typography.weights.medium,
  },

  // ─── Button ────────────────────────────────────────────────
  btn: {
    marginTop: spacing.sm,
    borderRadius: radius.md,
    overflow: 'hidden',
    ...shadows.md,
  },
  btnGradient: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnText: {
    color: '#ffffff',
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.2,
  },

  // ─── Terms ─────────────────────────────────────────────────
  terms: {
    marginTop: spacing.lg,
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    textAlign: 'center',
    lineHeight: typography.lineHeights.relaxed * typography.sizes.xs,
  },
  termsLink: {
    color: colors.secondary,
    fontWeight: typography.weights.semibold,
  },

  // ─── Divider ───────────────────────────────────────────────
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.dark.border,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    fontWeight: typography.weights.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // ─── Sign In Link ──────────────────────────────────────────
  signinButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  signinText: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
    fontWeight: typography.weights.medium,
  },
  signinLink: {
    color: colors.secondary,
    fontWeight: typography.weights.semibold,
  },

  // ─── Footer ────────────────────────────────────────────────
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.secondaryMuted,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.2)',
  },
  trustDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.secondary,
  },
  trustText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    fontWeight: typography.weights.medium,
    letterSpacing: 0.2,
  },
});

