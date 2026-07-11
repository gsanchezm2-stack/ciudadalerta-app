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
import { styles } from './src/styles';

const SCREENS = {
  DASHBOARD: 'dashboard',
  ALERTAS: 'alertas',
  NUEVA: 'nueva',
  PERFIL: 'perfil',
  ADMIN: 'admin'
};

function AuthGate() {
  const { isAuthenticated, user, logout } = useAuth();
  const [authVista, setAuthVista] = useState('login');
  const [screen, setScreen] = useState(SCREENS.DASHBOARD);
  const [selectedAlertaId, setSelectedAlertaId] = useState(null);

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#065A82" />
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
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <AlertaDetail route={route} navigation={navigation} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#065A82" />
      <View style={[styles.header, { padding: 12 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.headerTitle}>CiudadAlerta</Text>
          <TouchableOpacity style={styles.btnLogout} onPress={logout}>
            <Text style={styles.btnLogoutText}>Salir</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.nav}>
        <TouchableOpacity style={[styles.navBtn, screen === SCREENS.DASHBOARD && styles.navBtnActive]}
          onPress={() => setScreen(SCREENS.DASHBOARD)}>
          <Text style={[styles.navText, screen === SCREENS.DASHBOARD && styles.navTextActive]}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navBtn, screen === SCREENS.ALERTAS && styles.navBtnActive]}
          onPress={() => setScreen(SCREENS.ALERTAS)}>
          <Text style={[styles.navText, screen === SCREENS.ALERTAS && styles.navTextActive]}>Alertas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navBtn, screen === SCREENS.NUEVA && styles.navBtnActive]}
          onPress={() => setScreen(SCREENS.NUEVA)}>
          <Text style={[styles.navText, screen === SCREENS.NUEVA && styles.navTextActive]}>Nueva</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navBtn, screen === SCREENS.PERFIL && styles.navBtnActive]}
          onPress={() => setScreen(SCREENS.PERFIL)}>
          <Text style={[styles.navText, screen === SCREENS.PERFIL && styles.navTextActive]}>Perfil</Text>
        </TouchableOpacity>
        {tienePermiso(user.rol, 'usuarios:ver') && (
          <TouchableOpacity style={[styles.navBtn, screen === SCREENS.ADMIN && styles.navBtnActive]}
            onPress={() => setScreen(SCREENS.ADMIN)}>
            <Text style={[styles.navText, screen === SCREENS.ADMIN && styles.navTextActive]}>Admin</Text>
          </TouchableOpacity>
        )}
      </View>
      {screen === SCREENS.DASHBOARD && <Dashboard />}
      {screen === SCREENS.ALERTAS && (
        <ScrollView>
          <AlertaList onViewDetail={(id) => setSelectedAlertaId(id)} />
        </ScrollView>
      )}
      {screen === SCREENS.NUEVA && <AlertaForm onAlertaCreada={() => setScreen(SCREENS.ALERTAS)} />}
      {screen === SCREENS.PERFIL && <PerfilScreen user={user} />}
      {screen === SCREENS.ADMIN && <AdminPanel />}
    </SafeAreaView>
  );
}

function PerfilScreen({ user }) {
  const { logout } = useAuth();
  return (
    <View style={{ flex: 1, padding: 20, alignItems: 'center' }}>
      <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#065A82', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
        <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold' }}>{user.nombre?.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={{ width: '100%', maxWidth: 320 }}>
        <Row label="Nombre" value={user.nombre} />
        <Row label="Email" value={user.email} />
        <Row label="Rol" value={user.rol} />
      </View>
      <TouchableOpacity style={{ backgroundColor: '#dc2626', padding: 14, borderRadius: 8, alignItems: 'center', width: '100%', maxWidth: 320, marginTop: 24 }}
        onPress={logout}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Cerrar sesion</Text>
      </TouchableOpacity>
    </View>
  );
}

function Row({ label, value }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}>
      <Text style={{ color: '#6b7280' }}>{label}</Text>
      <Text style={{ fontWeight: '500', color: '#1f2937' }}>{value}</Text>
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
