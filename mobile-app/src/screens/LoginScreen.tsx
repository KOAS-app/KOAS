import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { getApiError } from '../utils/apiError';
import { colors, spacing, radius, typography, shadows } from '../theme';
import type { StackScreenProps } from '@react-navigation/stack';
import type { AuthStackParamList } from '../navigation/types';

type Props = StackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Required Fields', 'Please fill in all fields');
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
      <LinearGradient
        colors={[colors.authBg, '#0D1812']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.header}>
            <Text style={styles.logo}>
              KO<Text style={styles.logoAccent}>A</Text>S
            </Text>
            <Text style={styles.tagline}>Book. Play. Enjoy.</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome back</Text>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.authMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.authMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!loading}
                />
              </View>

              <TouchableOpacity
                style={[styles.btn, loading && styles.btnDisabled]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[colors.accent, colors.accentHover]}
                  style={styles.btnGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.textInverse} />
                  ) : (
                    <Text style={styles.btnText}>Sign In</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              onPress={() => navigation.navigate('Register')} 
              disabled={loading}
              style={styles.linkContainer}
            >
              <Text style={styles.linkText}>
                Don't have an account?{' '}
                <Text style={styles.link}>Create account</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Secure access · Join thousands of players</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  header: { 
    alignItems: 'center', 
    marginBottom: spacing.xxxl 
  },
  logo: { 
    fontSize: typography.sizes.huge, 
    fontWeight: typography.weights.black, 
    color: colors.authText,
    letterSpacing: -2,
  },
  logoAccent: { 
    color: colors.accent 
  },
  tagline: { 
    fontSize: typography.sizes.base, 
    color: colors.authMuted, 
    marginTop: spacing.sm,
    fontWeight: typography.weights.medium,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: colors.authCard,
    borderRadius: radius.xl,
    padding: spacing.xxxl,
    borderWidth: 1,
    borderColor: colors.authBorder,
    ...shadows.auth,
  },
  cardTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.authText,
    marginBottom: spacing.xxl,
    letterSpacing: -0.5,
  },
  form: { 
    gap: spacing.xl 
  },
  inputGroup: {
    gap: spacing.sm,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.authText,
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: colors.authInput,
    borderWidth: 1.5,
    borderColor: colors.authBorder,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: typography.sizes.base,
    color: colors.authText,
    fontWeight: typography.weights.medium,
  },
  btn: {
    marginTop: spacing.sm,
    borderRadius: radius.md,
    overflow: 'hidden',
    ...shadows.md,
  },
  btnGradient: {
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: { 
    opacity: 0.6 
  },
  btnText: { 
    color: colors.textInverse, 
    fontSize: typography.sizes.md, 
    fontWeight: typography.weights.bold,
  },
  linkContainer: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  linkText: { 
    textAlign: 'center', 
    color: colors.authMuted, 
    fontSize: typography.sizes.sm,
  },
  link: {
    color: colors.accent,
    fontWeight: typography.weights.semibold,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  footerText: {
    fontSize: typography.sizes.xs,
    color: colors.authMuted,
    letterSpacing: 0.3,
  },
});
