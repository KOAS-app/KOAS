import { useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { getApiError } from '../utils/apiError';
import { colors, spacing, radius, typography, shadows, animation } from '../theme';
import type { StackScreenProps } from '@react-navigation/stack';
import type { AuthStackParamList } from '../navigation/types';

const koasLogo = require('../../assets/logo/koas_official_logo.png');

type Props = StackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Required Fields', 'Please enter your email and password');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, token } = res.data;
      if (user.role !== 'PLAYER') {
        Alert.alert('Access Denied', 'This app is for players only.');
        return;
      }
      await login(user, token);
    } catch (err) {
      Alert.alert('Login Failed', getApiError(err, 'Invalid credentials. Please try again.'));
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
      
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
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
            <Text style={styles.tagline}>Book your game. Play your best.</Text>
          </View>

          {/* Auth Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Welcome back</Text>
              <Text style={styles.cardSubtitle}>Sign in to continue</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={[
                  styles.inputWrapper,
                  emailFocused && styles.inputWrapperFocused,
                ]}>
                  <TextInput
                    style={styles.input}
                    placeholder="you@example.com"
                    placeholderTextColor={colors.input.placeholder}
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Password</Text>
                </View>
                <View style={[
                  styles.inputWrapper,
                  passwordFocused && styles.inputWrapperFocused,
                ]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.input.placeholder}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    secureTextEntry
                    editable={!loading}
                    returnKeyType="go"
                    onSubmitEditing={handleLogin}
                  />
                </View>
              </View>

              {/* Sign In Button */}
              <TouchableOpacity
                style={[styles.btn, loading && styles.btnDisabled]}
                onPress={handleLogin}
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
                    <Text style={styles.btnText}>Sign In</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Sign Up Link */}
            <TouchableOpacity 
              onPress={() => navigation.navigate('Register')} 
              disabled={loading}
              style={styles.signupButton}
              activeOpacity={0.7}
            >
              <Text style={styles.signupText}>
                New to KOAS?{' '}
                <Text style={styles.signupLink}>Create account</Text>
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
    right: -50,
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
  },
  
  // ─── Header ────────────────────────────────────────────────
  header: { 
    alignItems: 'center', 
    marginBottom: spacing.xxxl,
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
    marginBottom: spacing.xxl,
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
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
    letterSpacing: 0.1,
  },
  forgotLink: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.secondary,
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
  
  // ─── Divider ───────────────────────────────────────────────
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
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
  
  // ─── Sign Up Link ──────────────────────────────────────────
  signupButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  signupText: { 
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
    fontWeight: typography.weights.medium,
  },
  signupLink: {
    color: colors.secondary,
    fontWeight: typography.weights.semibold,
  },
  
  // ─── Footer ────────────────────────────────────────────────
  footer: {
    alignItems: 'center',
    marginTop: spacing.xxl,
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

