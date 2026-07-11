import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getAlertas } from '../api';
import { styles } from '../styles';

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const [recientes, setRecientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAlertas(token, { limit: 5 });
        setRecientes((data.alertas || []).slice(0, 5));
      } catch (e) { /* silent */ }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const pendientes = recientes.filter(a => a.estado === 'pendiente').length;
  const resueltos = recientes.filter(a => a.estado === 'resuelto').length;

  return (
    <>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>CiudadAlerta</Text>
            <Text style={styles.headerSubtitle}>Bienvenido, {user.nombre}</Text>
          </View>
          <TouchableOpacity style={styles.btnLogout} onPress={logout}>
            <Text style={styles.btnLogoutText}>Salir</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.container}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 16, marginTop: 16, paddingHorizontal: 16 }}>
          Dashboard
        </Text>
        <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginBottom: 24 }}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{recientes.length}</Text>
            <Text style={styles.statLabel}>Recientes</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#f59e0b' }]}>{pendientes}</Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#16a34a' }]}>{resueltos}</Text>
            <Text style={styles.statLabel}>Resueltos</Text>
          </View>
        </View>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 12, paddingHorizontal: 16 }}>
          Alertas recientes
        </Text>
        {loading ? (
          <Text style={styles.empty}>Cargando...</Text>
        ) : recientes.length === 0 ? (
          <Text style={styles.empty}>No hay alertas recientes</Text>
        ) : (
          <View style={{ paddingHorizontal: 16 }}>
            {recientes.map(a => (
              <View key={a._id} style={styles.recentCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={[styles.badge, a.estado === 'resuelto' ? styles.badgeResolved : a.estado === 'en_revision' ? styles.badgeReview : styles.badgePending]}>
                    <Text style={{ fontSize: 10, fontWeight: '600' }}>{a.estado?.replace('_', ' ') || 'pendiente'}</Text>
                  </View>
                  <Text style={{ fontWeight: '600', color: '#111827', fontSize: 13 }}>{a.tipo}</Text>
                </View>
                <Text style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>{a.descripcion?.slice(0, 80)}...</Text>
                <Text style={{ color: '#9ca3af', fontSize: 11, marginTop: 4 }}>{a.sector}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </>
  );
}
