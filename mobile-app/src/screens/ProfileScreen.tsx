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
  container: { flex: 1, backgroundColor: colors.surface },
  header: { backgroundColor: colors.sidebar, padding: 20, paddingTop: 50 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.textInverse },
  content: { flex: 1, alignItems: 'center', padding: 32, gap: 12 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: colors.textInverse },
  name: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  email: { fontSize: 14, color: colors.textMuted },
  roleBadge: {
    backgroundColor: '#DCFCE7',
    borderRadius: 99,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginTop: 4,
  },
  roleText: { fontSize: 13, fontWeight: '600', color: '#166534' },
  logoutBtn: {
    backgroundColor: colors.danger,
    borderRadius: radius.md,
    paddingHorizontal: 40,
    paddingVertical: 12,
    marginTop: 32,
  },
  logoutText: { color: colors.textInverse, fontSize: 16, fontWeight: '600' },
});
