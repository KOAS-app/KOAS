# KOAS UI Implementation Guide

This guide provides code examples for implementing the refined design system across remaining pages.

---

## Table of Contents
1. [Admin Pages](#admin-pages)
2. [Owner Pages](#owner-pages)
3. [Mobile Screens](#mobile-screens)
4. [Common Patterns](#common-patterns)

---

## Admin Pages

### StadiumsPage Pattern
```tsx
// Refined filter tabs
<div className="flex gap-1 mb-6 p-1 rounded-lg w-fit"
  style={{ backgroundColor: 'var(--color-surface-muted)' }}>
  {(['ALL', 'PENDING', 'APPROVED'] as Filter[]).map((f) => (
    <button 
      key={f} 
      onClick={() => setFilter(f)}
      className="text-sm px-4 py-2 rounded-md font-semibold transition-all"
      style={{
        backgroundColor: filter === f ? 'var(--color-surface-card)' : 'transparent',
        color: filter === f ? 'var(--color-primary)' : 'var(--color-text-muted)',
        boxShadow: filter === f ? 'var(--shadow-sm)' : 'none',
      }}>
      {f}
    </button>
  ))}
</div>

// Refined table/list layout
<div className="card p-0 overflow-hidden">
  {items.map((item, i) => (
    <div 
      key={item.id}
      className="flex items-center justify-between px-6 py-4 gap-4 hover:bg-gray-50 transition-colors"
      style={{ 
        borderBottom: i < items.length - 1 ? '1px solid var(--color-border)' : 'none' 
      }}>
      {/* Content */}
    </div>
  ))}
</div>
```

### UsersPage Pattern
```tsx
// Search + Filter Row
<div className="flex gap-3 mb-6 flex-wrap items-center">
  <input
    type="text"
    className="input"
    placeholder="Search by name or email..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    style={{ maxWidth: 320 }}
  />
  
  <div className="flex gap-1 p-1 rounded-lg"
    style={{ backgroundColor: 'var(--color-surface-muted)' }}>
    {filters.map((f) => (
      <button 
        key={f}
        onClick={() => setFilter(f)}
        className="text-sm px-4 py-2 rounded-md font-semibold transition-all"
        style={{
          backgroundColor: filter === f ? 'var(--color-surface-card)' : 'transparent',
          color: filter === f ? 'var(--color-primary)' : 'var(--color-text-muted)',
          boxShadow: filter === f ? 'var(--shadow-sm)' : 'none',
        }}>
        {f}
      </button>
    ))}
  </div>
</div>

// Table with header
<div className="card p-0 overflow-hidden">
  {/* Header */}
  <div className="grid px-6 py-3 text-xs font-bold uppercase tracking-wider"
    style={{
      gridTemplateColumns: '1fr 1fr auto auto',
      color: 'var(--color-text-muted)',
      borderBottom: '1px solid var(--color-border)',
      backgroundColor: 'var(--color-surface-muted)',
    }}>
    <span>Name</span>
    <span>Email</span>
    <span>Role</span>
    <span></span>
  </div>
  
  {/* Rows */}
  {users.map((user, i) => (
    <div 
      key={user.id}
      className="grid items-center px-6 py-4 gap-4 hover:bg-gray-50 transition-colors"
      style={{
        gridTemplateColumns: '1fr 1fr auto auto',
        borderBottom: i < users.length - 1 ? '1px solid var(--color-border)' : 'none',
      }}>
      <div>
        <p className="text-sm font-semibold" style={{ color: 'var(--color-text-base)' }}>
          {user.name}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
          Joined {new Date(user.createdAt).toLocaleDateString()}
        </p>
      </div>
      <p className="text-sm truncate" style={{ color: 'var(--color-text-secondary)' }}>
        {user.email}
      </p>
      <span className={`badge badge-${getRoleBadge(user.role)}`}>
        {user.role}
      </span>
      <button className="btn btn-danger btn-sm">Delete</button>
    </div>
  ))}
</div>
```

### BookingsPage Pattern
```tsx
// Summary Cards Row
<div className="grid gap-4 mb-6" 
  style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
  {stats.map((stat) => (
    <div key={stat.label} className="card text-center">
      <p className="text-3xl font-extrabold mb-2" 
        style={{ color: 'var(--color-primary)' }}>
        {stat.value.toLocaleString()}
      </p>
      <p className="text-xs font-semibold uppercase tracking-wide" 
        style={{ color: 'var(--color-text-muted)' }}>
        {stat.label}
      </p>
    </div>
  ))}
</div>

// Booking List Item
<div className="flex items-center justify-between px-6 py-4 gap-4">
  {/* Player Info */}
  <div className="flex-1 min-w-0">
    <p className="font-semibold text-sm truncate" 
      style={{ color: 'var(--color-text-base)' }}>
      {booking.player.name}
    </p>
    <p className="text-xs truncate mt-0.5" 
      style={{ color: 'var(--color-text-muted)' }}>
      {booking.player.email}
    </p>
  </div>
  
  {/* Time */}
  <div className="text-sm text-center" 
    style={{ color: 'var(--color-text-secondary)', minWidth: 160 }}>
    <p className="font-medium">{formatDate(booking.slot.startTime)}</p>
    <p className="text-xs mt-0.5">{formatTime(booking.slot.startTime)} - {formatTime(booking.slot.endTime)}</p>
  </div>
  
  {/* Price */}
  <p className="text-sm font-bold" 
    style={{ color: 'var(--color-primary)', minWidth: 100, textAlign: 'right' }}>
    {booking.slot.price.toLocaleString()} ETB
  </p>
  
  {/* Status */}
  <span className={`badge badge-${getStatusBadge(booking.status)}`}>
    {booking.status}
  </span>
  
  {/* Actions */}
  <div className="flex gap-2">
    <button className="btn btn-accent btn-sm">Confirm</button>
    <button className="btn btn-ghost btn-sm">Cancel</button>
  </div>
</div>
```

---

## Owner Pages

### SlotsPage Pattern
```tsx
// Page Header with Back Button
<div className="flex items-center gap-4 mb-8">
  <button 
    onClick={() => navigate('/stadiums')} 
    className="btn btn-ghost btn-sm">
    ← Back
  </button>
  <div className="flex-1">
    <h1 className="page-title mb-2">Manage Slots</h1>
    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
      {stadiumName}
    </p>
  </div>
  <button className="btn btn-primary">+ Add Slot</button>
</div>

// Grouped Slots by Date
{Object.entries(groupedSlots).map(([date, slots]) => (
  <div key={date} className="mb-6">
    <h3 className="text-sm font-bold uppercase tracking-wide mb-3"
      style={{ color: 'var(--color-text-muted)' }}>
      {formatDate(date)}
    </h3>
    
    <div className="grid gap-3" 
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
      {slots.map((slot) => (
        <div key={slot.id} className="card">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-bold text-base" 
                style={{ color: 'var(--color-text-base)' }}>
                {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
              </p>
              <p className="text-sm font-semibold mt-1" 
                style={{ color: 'var(--color-primary)' }}>
                {slot.price.toLocaleString()} ETB
              </p>
            </div>
            <span className={`badge ${slot.isBooked ? 'badge-danger' : 'badge-success'}`}>
              {slot.isBooked ? 'Booked' : 'Available'}
            </span>
          </div>
          
          {!slot.isBooked && (
            <div className="flex gap-2 pt-3" 
              style={{ borderTop: '1px solid var(--color-border)' }}>
              <button className="btn btn-ghost btn-sm flex-1">Edit</button>
              <button className="btn btn-danger btn-sm">Delete</button>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
))}
```

### RegisterPage Pattern
```tsx
<div className="min-h-screen flex items-center justify-center px-4"
  style={{ backgroundColor: 'var(--color-surface)' }}>
  <div className="w-full max-w-md">
    {/* Logo */}
    <div className="text-center mb-10">
      <h1 className="text-5xl font-black tracking-tight mb-2" 
        style={{ color: 'var(--color-primary)' }}>
        KO<span style={{ color: 'var(--color-accent)' }}>A</span>S
      </h1>
      <p className="text-sm font-medium" 
        style={{ color: 'var(--color-text-muted)' }}>
        Owner Registration
      </p>
    </div>

    {/* Card */}
    <div className="card">
      <h2 className="text-xl font-bold mb-6" 
        style={{ color: 'var(--color-text-base)' }}>
        Create Account
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label">Full Name</label>
          <input 
            type="text" 
            className="input" 
            placeholder="John Doe"
            required 
          />
        </div>
        
        <div>
          <label className="label">Email Address</label>
          <input 
            type="email" 
            className="input" 
            placeholder="you@example.com"
            required 
          />
        </div>
        
        <div>
          <label className="label">Password</label>
          <input 
            type="password" 
            className="input" 
            placeholder="••••••••"
            required 
          />
        </div>
        
        <div>
          <label className="label">Confirm Password</label>
          <input 
            type="password" 
            className="input" 
            placeholder="••••••••"
            required 
          />
        </div>

        <button type="submit" className="btn btn-primary w-full btn-lg mt-2">
          Create Account
        </button>
      </form>

      <p className="text-sm text-center mt-6" 
        style={{ color: 'var(--color-text-muted)' }}>
        Already have an account?{' '}
        <Link to="/login" className="font-semibold hover:underline"
          style={{ color: 'var(--color-accent)' }}>
          Sign In
        </Link>
      </p>
    </div>
  </div>
</div>
```

---

## Mobile Screens

### StadiumDetailScreen Pattern
```tsx
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.surface 
  },
  
  // Header Section
  header: {
    backgroundColor: colors.card,
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    letterSpacing: -0.5,
  },
  headerLocation: {
    fontSize: typography.sizes.base,
    color: colors.textMuted,
    fontWeight: typography.weights.medium,
  },
  headerDesc: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    marginTop: spacing.md,
    lineHeight: 22,
  },
  
  // Slots Section
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    letterSpacing: -0.3,
  },
  
  // Day Group
  dayGroup: {
    marginBottom: spacing.xl,
  },
  dayLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  
  // Slot Card
  slotCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  slotTime: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  slotPrice: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  
  // Book Button
  bookBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    ...shadows.sm,
  },
  bookBtnText: {
    color: colors.textInverse,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
  },
});
```

### BookingsScreen Pattern
```tsx
const styles = StyleSheet.create({
  // Filter Tabs
  filterContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.xs,
    backgroundColor: colors.muted,
    borderRadius: radius.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  filterBtnActive: {
    backgroundColor: colors.card,
    ...shadows.sm,
  },
  filterBtnText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textMuted,
  },
  filterBtnTextActive: {
    color: colors.primary,
  },
  
  // Booking Card
  bookingCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  stadiumName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.md,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  statusText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  
  // Booking Details
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  detailIcon: {
    fontSize: typography.sizes.base,
    marginRight: spacing.sm,
  },
  detailText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  
  // Price
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  priceLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    fontWeight: typography.weights.medium,
  },
  priceValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
});
```

### ProfileScreen Pattern
```tsx
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  
  // Header
  header: {
    backgroundColor: colors.sidebar,
    paddingHorizontal: spacing.xl,
    paddingTop: 56,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  avatarText: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    color: colors.textInverse,
  },
  userName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textInverse,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: typography.sizes.sm,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: typography.weights.medium,
  },
  
  // Menu Section
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  
  // Menu Item
  menuItem: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  menuIcon: {
    fontSize: typography.sizes.xl,
    marginRight: spacing.md,
  },
  menuText: {
    flex: 1,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  menuChevron: {
    fontSize: typography.sizes.base,
    color: colors.textMuted,
  },
  
  // Logout Button
  logoutBtn: {
    backgroundColor: colors.dangerBg,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.danger,
    marginLeft: spacing.sm,
  },
});
```

---

## Common Patterns

### Modal/Dialog
```tsx
// Web
<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
  <div className="card max-w-md w-full">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-base)' }}>
        Modal Title
      </h2>
      <button 
        onClick={onClose}
        className="text-2xl leading-none" 
        style={{ color: 'var(--color-text-muted)' }}>
        ×
      </button>
    </div>
    
    <div className="space-y-5">
      {/* Modal content */}
    </div>
    
    <div className="flex gap-3 mt-6 pt-6" 
      style={{ borderTop: '1px solid var(--color-border)' }}>
      <button className="btn btn-ghost flex-1" onClick={onClose}>
        Cancel
      </button>
      <button className="btn btn-primary flex-1" onClick={onConfirm}>
        Confirm
      </button>
    </div>
  </div>
</div>

// Mobile
<Modal
  visible={visible}
  transparent
  animationType="fade"
  onRequestClose={onClose}>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Modal Title</Text>
      {/* Content */}
      <View style={styles.modalActions}>
        <TouchableOpacity style={styles.btnGhost} onPress={onClose}>
          <Text style={styles.btnGhostText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnPrimary} onPress={onConfirm}>
          <Text style={styles.btnPrimaryText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
```

### Toast Notification
```tsx
// Web (add to layout)
{toast && (
  <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
    <div className={`card flex items-center gap-3 ${
      toast.type === 'success' ? 'bg-green-50 border-green-200' :
      toast.type === 'error' ? 'bg-red-50 border-red-200' :
      'bg-blue-50 border-blue-200'
    }`}>
      <span className="text-xl">
        {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}
      </span>
      <p className="font-medium">{toast.message}</p>
    </div>
  </div>
)}
```

### Confirmation Dialog
```tsx
// Web
const confirmDelete = () => {
  if (window.confirm('Are you sure? This action cannot be undone.')) {
    handleDelete();
  }
};

// Mobile
Alert.alert(
  'Confirm Delete',
  'Are you sure? This action cannot be undone.',
  [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: handleDelete },
  ]
);
```

---

## Testing Checklist

### Visual Testing
- [ ] All spacing uses design tokens
- [ ] Typography follows scale
- [ ] Colors use CSS variables
- [ ] Shadows are consistent
- [ ] Border radius is consistent
- [ ] Hover states work
- [ ] Focus states are visible
- [ ] Loading states show
- [ ] Empty states display correctly
- [ ] Error states are clear

### Responsive Testing
- [ ] Mobile (< 640px)
- [ ] Tablet (640px - 1024px)
- [ ] Desktop (> 1024px)
- [ ] Touch targets ≥ 44px
- [ ] Text is readable
- [ ] No horizontal scroll
- [ ] Grids adapt properly

### Accessibility Testing
- [ ] Color contrast passes WCAG AA
- [ ] Focus indicators visible
- [ ] Keyboard navigation works
- [ ] Screen reader friendly
- [ ] Alt text on images
- [ ] Semantic HTML
- [ ] ARIA labels where needed

---

## Quick Tips

1. **Always use design tokens** — Never hardcode colors or spacing
2. **Test on real devices** — Simulators don't show everything
3. **Keep it simple** — Premium doesn't mean complex
4. **Consistent spacing** — Use the spacing scale religiously
5. **Strong hierarchy** — Make important things obvious
6. **Provide feedback** — Loading, success, error states
7. **Mobile first** — Design for small screens, enhance for large
8. **Accessibility matters** — It's not optional

---

**Happy Building! 🚀**
