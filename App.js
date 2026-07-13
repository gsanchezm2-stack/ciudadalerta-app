import { useState } from 'react';
import { View, Text, SafeAreaView, StatusBar, TouchableOpacity, ScrollView } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { tienePermiso } from './src/permisos';
import LoginView from './src/components/LoginView';
import RegisterView from './src/components/RegisterView';
import Dashboard from './src/components/Dashboard';
import AlertaList from './src/components/AlertaList';
import AlertaForm from './src/components/AlertaForm';
import AlertaDetail from './src/components/AlertaDetail';
import AdminPanel from './src/components/AdminPanel';
import { styles, COLORS } from './src/styles';

const SCREENS = {
  DASHBOARD: 'dashboard',
  ALERTAS: 'alertas',
  NUEVA: 'nueva',
  PERFIL: 'perfil',
  ADMIN: 'admin'
};

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Tablero', icon: '\u{1F4CA}' },
  { key: 'alertas', label: 'Alertas', icon: '\u{1F514}' },
  { key: 'nueva', label: 'Nueva', icon: '\u{2795}' },
  { key: 'perfil', label: 'Perfil', icon: '\u{1F464}' },
];

function AuthGate() {
  const { isAuthenticated, user, logout } = useAuth();
  const [authVista, setAuthVista] = useState('login');
  const [screen, setScreen] = useState(SCREENS.DASHBOARD);
  const [selectedAlertaId, setSelectedAlertaId] = useState(null);

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>CiudadAlerta</Text>
          <Text style={styles.headerSubtitle}>Plataforma de alertas ciudadanas</Text>
        </View>
        {authVista === 'login' ? (
          <LoginView onToggleForm={() => setAuthVista('register')} />
        ) : (
          <RegisterView onToggleForm={() => setAuthVista('login')} />
        )}
      </SafeAreaView>
    );
  }

  if (selectedAlertaId) {
    const route = { params: { id: selectedAlertaId } };
    const navigation = { goBack: () => setSelectedAlertaId(null) };
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <AlertaDetail route={route} navigation={navigation} />
      </SafeAreaView>
    );
  }

  const allNav = tienePermiso(user.rol, 'usuarios:ver')
    ? [...NAV_ITEMS, { key: 'admin', label: 'Admin', icon: '\u{2699}\u{FE0F}' }]
    : NAV_ITEMS;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>CiudadAlerta</Text>
          <TouchableOpacity style={styles.btnLogout} onPress={logout}>
            <Text style={styles.btnLogoutText}>Salir</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.nav}>
        {allNav.map(item => {
          const active = screen === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.navBtn, active && styles.navBtnActive]}
              onPress={() => setScreen(item.key)}
            >
              <Text style={{ fontSize: 14, marginBottom: 2 }}>{item.icon}</Text>
              <Text style={[styles.navText, active && styles.navTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={{ flex: 1 }}>
        {screen === SCREENS.DASHBOARD && <Dashboard />}
        {screen === SCREENS.ALERTAS && (
          <AlertaList onViewDetail={(id) => setSelectedAlertaId(id)} />
        )}
        {screen === SCREENS.NUEVA && <AlertaForm onAlertaCreada={() => setScreen(SCREENS.ALERTAS)} />}
        {screen === SCREENS.PERFIL && <PerfilScreen user={user} />}
        {screen === SCREENS.ADMIN && <AdminPanel />}
      </View>
    </SafeAreaView>
  );
}

function PerfilScreen({ user }) {
  const { logout } = useAuth();
  return (
    <ScrollView style={{ backgroundColor: COLORS.bg }} contentContainerStyle={{ alignItems: 'center', padding: 16 }}>
      <View style={styles.perfilCard}>
        <View style={styles.perfilAvatar}>
          <Text style={styles.perfilAvatarText}>{user.nombre?.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ width: '100%' }}>
          <View style={styles.perfilRow}>
            <Text style={styles.perfilLabel}>Nombre</Text>
            <Text style={styles.perfilValue}>{user.nombre}</Text>
          </View>
          <View style={styles.perfilRow}>
            <Text style={styles.perfilLabel}>Email</Text>
            <Text style={styles.perfilValue}>{user.email}</Text>
          </View>
          <View style={styles.perfilRow}>
            <Text style={styles.perfilLabel}>Rol</Text>
            <Text style={styles.perfilValue}>{user.rol}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={[styles.btnDanger, { width: '100%', maxWidth: 480, marginTop: 16 }]} onPress={logout}>
        <Text style={styles.btnDangerText}>Cerrar sesion</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
