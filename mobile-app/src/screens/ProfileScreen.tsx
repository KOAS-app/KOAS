import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors, radius } from '../theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <View style={styles.content}>
        {/* Avatar */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase()}
          </Text>
        </View>

        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>

        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>⚽ PLAYER</Text>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark.bg },
  header: { backgroundColor: colors.dark.surface, padding: 20, paddingTop: 50 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: colors.text.primary, letterSpacing: -0.5 },
  content: { flex: 1, alignItems: 'center', padding: 32, gap: 12 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 36, fontWeight: '900', color: colors.text.inverse, letterSpacing: -1 },
  name: { fontSize: 24, fontWeight: '800', color: colors.text.primary, letterSpacing: -0.5 },
  email: { fontSize: 14, color: colors.text.muted, fontWeight: '600' },
  roleBadge: {
    backgroundColor: '#DCFCE7',
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  roleText: { fontSize: 13, fontWeight: '700', color: '#166534', letterSpacing: 0.5 },
  logoutBtn: {
    backgroundColor: colors.danger,
    borderRadius: radius.md,
    paddingHorizontal: 48,
    paddingVertical: 14,
    marginTop: 40,
  },
  logoutText: { color: colors.text.inverse, fontSize: 16, fontWeight: '700' },
});
