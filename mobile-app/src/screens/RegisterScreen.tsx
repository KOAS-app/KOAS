import { useState, useRef } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { getApiError } from '../utils/apiError';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../theme';
import type { StackScreenProps } from '@react-navigation/stack';
import type { AuthStackParamList } from '../navigation/types';

const koasLogo = require('../../assets/logo/koas_official_logo.png');

type Props = StackScreenProps<AuthStackParamList, 'Register'>;

const TOTAL_STEPS = 4;

export default function RegisterScreen({ navigation }: Props) {
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', phoneNumber: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView | null>(null);

  const validatePassword = (password: string) => {
    if (password.length < 8) return 'At least 8 characters';
    if (!/[A-Z]/.test(password)) return 'One uppercase letter';
    if (!/[a-z]/.test(password)) return 'One lowercase letter';
    if (!/[0-9]/.test(password)) return 'One number';
    if (!/[^A-Za-z0-9]/.test(password)) return 'One special character';
    return null;
  };

  const handleNext = () => {
    if (step === 1) {
      if (!form.name.trim()) {
        Alert.alert('Required', 'Enter your name.');
        return;
      }
    }
    if (step === 2) {
      if (!/^\+251[79]\d{8}$/.test(form.phoneNumber)) {
        Alert.alert('Invalid', 'Use Ethiopian format: +251XXXXXXXXX');
        return;
      }
    }
    if (step === 3) {
      if (!form.password) {
        Alert.alert('Required', 'Enter a password.');
        return;
      }
      const err = validatePassword(form.password);
      if (err) {
        Alert.alert('Weak Password', err);
        return;
      }
      if (form.password !== form.confirm) {
        Alert.alert('Mismatch', 'Passwords do not match');
        return;
      }
    }
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
      setPasswordError(null);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleRegister = async () => {
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

  const onPasswordChange = (v: string) => {
    setForm((p) => ({ ...p, password: v }));
    if (v.length === 0) {
      setPasswordError(null);
    } else {
      setPasswordError(validatePassword(v));
    }
  };

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            ref={(r) => { scrollRef.current = r; }}
            contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 48 }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Logo */}
            <View style={styles.logoWrap}>
              <Image source={koasLogo} style={styles.logo} resizeMode="contain" />
            </View>

            {/* Progress bar */}
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${(step / TOTAL_STEPS) * 100}%` }]} />
            </View>

            {/* Step 1: Name */}
            {step === 1 && (
              <View style={styles.stepContent}>
                <Text style={styles.question}>What's your name?</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Full name"
                  placeholderTextColor="#999"
                  value={form.name}
                  onChangeText={(v) => setForm((p) => ({ ...p, name: v }))}
                  autoCapitalize="words"
                  editable={!loading}
                  autoFocus
                  returnKeyType="next"
                  onSubmitEditing={handleNext}
                />
              </View>
            )}

            {/* Step 2: Phone */}
            {step === 2 && (
              <View style={styles.stepContent}>
                <Text style={styles.question}>Your phone number?</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+251912345678"
                  placeholderTextColor="#999"
                  value={form.phoneNumber}
                  onChangeText={(v) => setForm((p) => ({ ...p, phoneNumber: v }))}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  editable={!loading}
                  autoFocus
                  returnKeyType="next"
                  onSubmitEditing={handleNext}
                />
                <Text style={styles.hint}>Ethiopian format: +251XXXXXXXXX</Text>
              </View>
            )}

            {/* Step 3: Password */}
            {step === 3 && (
              <View style={styles.stepContent}>
                <Text style={styles.question}>Create a password</Text>
                <View style={styles.passwordRow}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="Enter password"
                    placeholderTextColor="#999"
                    value={form.password}
                    onChangeText={onPasswordChange}
                    secureTextEntry={!showPassword}
                    editable={!loading}
                    autoFocus
                    returnKeyType="next"
                  />
                  <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
                    <Feather name={showPassword ? 'eye' : 'eye-off'} size={20} color="#666" />
                  </TouchableOpacity>
                </View>
                {passwordError && <Text style={styles.passwordHint}>{passwordError}</Text>}
                <View style={[styles.passwordRow, { marginTop: 12 }]}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="Confirm password"
                    placeholderTextColor="#999"
                    value={form.confirm}
                    onChangeText={(v) => setForm((p) => ({ ...p, confirm: v }))}
                    secureTextEntry={!showConfirm}
                    editable={!loading}
                    returnKeyType="done"
                    onSubmitEditing={handleNext}
                  />
                  <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowConfirm(!showConfirm)}>
                    <Feather name={showConfirm ? 'eye' : 'eye-off'} size={20} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <View style={styles.stepContent}>
                <Text style={styles.question}>Review your info</Text>
                <View style={styles.reviewCard}>
                  <View style={styles.reviewRow}>
                    <Text style={styles.reviewLabel}>Name</Text>
                    <Text style={styles.reviewValue}>{form.name}</Text>
                  </View>
                  <View style={styles.reviewDivider} />
                  <View style={styles.reviewRow}>
                    <Text style={styles.reviewLabel}>Phone</Text>
                    <Text style={styles.reviewValue}>{form.phoneNumber}</Text>
                  </View>
                  <View style={styles.reviewDivider} />
                  <View style={styles.reviewRow}>
                    <Text style={styles.reviewLabel}>Password</Text>
                    <Text style={styles.reviewValue}>••••••••</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Navigation */}
            <View style={styles.navRow}>
              {step > 1 ? (
                <TouchableOpacity onPress={handleBack} disabled={loading} style={styles.navBack}>
                  <Text style={styles.navBackText}>Back</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.navBack} />
              )}
              {step < TOTAL_STEPS ? (
                <TouchableOpacity onPress={handleNext} disabled={loading} style={styles.navNext}>
                  <Text style={styles.navNextText}>Next</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={handleRegister} disabled={loading} style={styles.navNext}>
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.navNextText}>Create Account</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>

            {/* Sign in link */}
            <TouchableOpacity onPress={() => navigation.goBack()} disabled={loading} style={styles.signinWrap}>
              <Text style={styles.signinText}>
                Already have an account? <Text style={styles.signinLink}>Sign in</Text>
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24 },

  // Logo
  logoWrap: { alignItems: 'center', marginBottom: 40 },
  logo: { width: 120, height: 40 },

  // Progress bar
  progressBg: { height: 4, backgroundColor: '#e0e0e0', borderRadius: 2, marginBottom: 48 },
  progressFill: { height: 4, backgroundColor: '#215630', borderRadius: 2 },

  // Step content
  stepContent: { marginBottom: 32 },
  question: { fontSize: 22, fontWeight: '600', color: '#111', marginBottom: 24 },
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111',
  },
  hint: { fontSize: 12, color: '#888', marginTop: 8 },

  // Password
  passwordRow: { flexDirection: 'row', alignItems: 'center' },
  passwordInput: { flex: 1 },
  eyeBtn: { position: 'absolute', right: 12, padding: 4 },
  passwordHint: { fontSize: 12, color: '#888', marginTop: 6 },

  // Review
  reviewCard: { backgroundColor: '#f9f9f9', borderRadius: 8, padding: 16, borderWidth: 1, borderColor: '#eee' },
  reviewRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  reviewDivider: { height: 1, backgroundColor: '#eee' },
  reviewLabel: { fontSize: 14, color: '#666' },
  reviewValue: { fontSize: 14, color: '#111', fontWeight: '600' },

  // Navigation
  navRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  navBack: { width: 80 },
  navBackText: { fontSize: 16, color: '#666' },
  navNext: {
    backgroundColor: '#215630',
    borderRadius: 100,
    paddingHorizontal: 32,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  navNextText: { fontSize: 16, fontWeight: '600', color: '#fff' },

  // Sign in
  signinWrap: { alignItems: 'center', marginTop: 40 },
  signinText: { fontSize: 14, color: '#666' },
  signinLink: { color: '#215630', fontWeight: '600' },
});
