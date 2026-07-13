import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getAlertas, getStats } from '../api';
import { styles, COLORS } from '../styles';

const BADGE_COLORS = {
  pendiente: { bg: '#fef3c7', text: '#92400e' },
  en_revision: { bg: '#dbeafe', text: '#1e40af' },
  resuelto: { bg: '#dcfce7', text: '#166534' },
};

const TIPO_COLORS = {
  Seguridad: '#fee2e2', Infraestructura: '#fef3c7', Movilidad: '#dbeafe',
  Ambiental: '#dcfce7', Salud: '#f3e8ff', Educacion: '#e0e7ff', Otro: '#e5e7eb',
};

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [recientes, setRecientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [s, alertasData] = await Promise.all([
          getStats(token),
          getAlertas(token, { limit: 5 })
        ]);
        setStats(s);
        setRecientes(alertasData.alertas || []);
      } catch (e) {
        setError(e.message || 'Error de conexion');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const estadoData = stats?.porEstado || {};
  const total = stats?.total || recientes.length;

  return (
    <ScrollView style={{ backgroundColor: COLORS.bg }} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>Tablero</Text>
          <Text style={styles.pageSubtitle}>Bienvenido, {user.nombre}</Text>
        </View>
      </View>

      {loading ? (
        <Text style={styles.empty}>Cargando...</Text>
      ) : error ? (
        <View style={{ paddingHorizontal: 16 }}>
          <Text style={{ color: COLORS.danger, fontSize: 14, marginBottom: 8 }}>{error}</Text>
          <TouchableOpacity onPress={() => { setError(null); setLoading(true); }}>
            <Text style={{ color: COLORS.primary, fontWeight: '600' }}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginBottom: 28 }}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: COLORS.warning }]}>{estadoData['pendiente'] || 0}</Text>
              <Text style={styles.statLabel}>Pendientes</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: COLORS.primaryLight }]}>{estadoData['en_revision'] || 0}</Text>
              <Text style={styles.statLabel}>Revision</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: COLORS.success }]}>{estadoData['resuelto'] || 0}</Text>
              <Text style={styles.statLabel}>Resueltos</Text>
            </View>
          </View>

          <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 12, paddingHorizontal: 16 }}>
            Alertas recientes
          </Text>
          <View style={{ paddingHorizontal: 16 }}>
            {recientes.map(a => {
              const badge = BADGE_COLORS[a.estado] || BADGE_COLORS.pendiente;
              return (
                <TouchableOpacity key={a._id} style={styles.recentCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.badgeText, { color: badge.text }]}>{a.estado?.replace('_', ' ')}</Text>
                    </View>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: COLORS.text }}>{a.tipo}</Text>
                  </View>
                  <Text style={{ color: COLORS.textSecondary, fontSize: 13, marginTop: 6 }}>{a.descripcion?.slice(0, 60)}...</Text>
                  <Text style={{ color: COLORS.textMuted, fontSize: 12, marginTop: 4 }}>{a.sector}</Text>
                </TouchableOpacity>
              );
            })}
            {recientes.length === 0 && <Text style={styles.empty}>No hay alertas recientes</Text>}
          </View>
        </>
      )}
    </ScrollView>
  );
}
