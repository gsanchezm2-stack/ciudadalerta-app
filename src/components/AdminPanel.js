import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getUsuarios, cambiarRolUsuario } from '../api';
import { tienePermiso } from '../permisos';
import { styles, COLORS } from '../styles';

const ROLES = ['ciudadano', 'autoridad', 'administrador'];

const ROLE_BADGE = {
  ciudadano: { bg: '#dbeafe', text: '#1e40af' },
  autoridad: { bg: '#dcfce7', text: '#166534' },
  administrador: { bg: '#fee2e2', text: '#991b1b' },
};

export default function AdminPanel() {
  const { user, token } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await getUsuarios(token);
      setUsuarios(data);
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const handleRolChange = (id, nombre, nuevoRol) => {
    if (id === user.id) {
      Alert.alert('Error', 'No puedes cambiar tu propio rol');
      return;
    }
    Alert.alert('Cambiar rol', `Cambiar rol de ${nombre} a "${nuevoRol}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Confirmar', onPress: async () => {
          try {
            await cambiarRolUsuario(token, id, nuevoRol);
            setUsuarios(prev => prev.map(u => u._id === id ? { ...u, rol: nuevoRol } : u));
          } catch (err) {
            Alert.alert('Error', err.message || 'Error al cambiar rol');
          }
        }
      }
    ]);
  };

  if (!tienePermiso(user.rol, 'usuarios:ver')) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg }}>
        <Text style={{ color: COLORS.textMuted }}>No tienes acceso a esta seccion</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg, padding: 16 }}>
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>Panel de Administracion</Text>
          <Text style={styles.pageSubtitle}>Gestionar usuarios y roles</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={usuarios}
          keyExtractor={item => item._id}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => {
            const roleColor = ROLE_BADGE[item.rol] || ROLE_BADGE.ciudadano;
            return (
              <View style={styles.card}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={{ fontWeight: '600', color: COLORS.text, fontSize: 15 }}>{item.nombre}</Text>
                  <View style={[styles.roleBadge, { backgroundColor: roleColor.bg }]}>
                    <Text style={[styles.roleBadgeText, { color: roleColor.text }]}>{item.rol}</Text>
                  </View>
                </View>
                <Text style={{ color: COLORS.textSecondary, fontSize: 13 }}>{item.email}</Text>
                {item.createdAt && (
                  <Text style={{ color: COLORS.textMuted, fontSize: 12, marginTop: 4 }}>
                    Registro: {new Date(item.createdAt).toLocaleDateString('es-ES')}
                  </Text>
                )}

                {item._id !== user.id && (
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                    {ROLES.filter(r => r !== item.rol).map(r => {
                      const rc = ROLE_BADGE[r] || ROLE_BADGE.ciudadano;
                      return (
                        <TouchableOpacity
                          key={r}
                          style={[styles.btnSm, { backgroundColor: COLORS.card, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' }]}
                          onPress={() => handleRolChange(item._id, item.nombre, r)}
                        >
                          <Text style={{ fontSize: 12, color: COLORS.text, fontWeight: '600' }}>{r}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}
