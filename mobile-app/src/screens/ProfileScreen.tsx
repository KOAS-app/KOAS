import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Feather } from '@expo/vector-icons';
import api from '../api/axios';
import { getApiError } from '../utils/apiError';
import { colors, radius, spacing } from '../theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [deleting, setDeleting] = useState(false);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action is irreversible. All your bookings and data will be permanently deleted. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            setDeleting(true);
            try {
              await api.delete('/auth/delete-account');
              logout();
            } catch (err) {
              Alert.alert('Error', getApiError(err, 'Failed to delete account.'));
              setDeleting(false);
            }
          } 
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Info Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        {/* Actions List */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionCard, styles.dangerCard]} 
            onPress={handleLogout}
            disabled={deleting}
          >
            <View style={[styles.iconBox, styles.dangerIconBox]}>
              <Feather name="log-out" size={20} color="#EF4444" />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Logout</Text>
              <Text style={styles.actionSubtitle}>Sign out from your account</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#EF4444" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, styles.dangerCard]} 
            onPress={handleDeleteAccount}
            disabled={deleting}
          >
            <View style={[styles.iconBox, styles.dangerIconBox]}>
              {deleting ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Feather name="trash-2" size={20} color="#EF4444" />
              )}
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Delete Account</Text>
              <Text style={styles.actionSubtitle}>Permanently delete your account</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E0D' },
  header: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5 },
  scrollContainer: { flex: 1 },
  scrollContent: { padding: 20, gap: 24, paddingBottom: 60 },
  
  profileCard: {
    backgroundColor: '#0F1713',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1A2520',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarText: { fontSize: 28, fontWeight: '900', color: '#0A0E0D' },
  name: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.3, marginBottom: 4 },
  email: { fontSize: 13, color: '#8B9A94', fontWeight: '500' },

  // Actions Container
  actionsContainer: { gap: 12 },
  
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F1713',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1A2520',
  },
  dangerCard: {
    borderColor: 'rgba(239, 68, 68, 0.2)',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  dangerIconBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#8B9A94',
    fontWeight: '500',
  },
});
