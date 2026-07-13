import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getAlertas, eliminarAlerta } from '../api';
import { tienePermiso } from '../permisos';
import { styles, COLORS } from '../styles';

const BADGE_COLORS = {
  pendiente: { bg: '#fef3c7', text: '#92400e' },
  en_revision: { bg: '#dbeafe', text: '#1e40af' },
  resuelto: { bg: '#dcfce7', text: '#166534' },
};

const TIPO_COLORS = {
  Seguridad: { bg: '#fee2e2', text: '#991b1b' },
  Infraestructura: { bg: '#fef3c7', text: '#92400e' },
  Movilidad: { bg: '#dbeafe', text: '#1e40af' },
  Ambiental: { bg: '#dcfce7', text: '#166534' },
  Salud: { bg: '#f3e8ff', text: '#6b21a8' },
  Educacion: { bg: '#e0e7ff', text: '#3730a3' },
  Otro: { bg: '#e5e7eb', text: '#4b5563' },
};

export default function AlertaList({ onViewDetail }) {
  const { user, token } = useAuth();
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(false);

  const puedeEliminar = tienePermiso(user.rol, 'alertas:eliminar');

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await getAlertas(token, { limit: 50 });
      setAlertas(data.alertas || []);
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo conectar al servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const handleEliminar = (id) => {
    Alert.alert('Confirmar', 'Deseas eliminar esta alerta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          try {
            await eliminarAlerta(token, id);
            cargar();
          } catch (err) {
            Alert.alert('Error', err.message || 'Error al eliminar');
          }
        }
      }
    ]);
  };

  return (
    <FlatList
      data={alertas}
      keyExtractor={item => item._id}
      style={{ backgroundColor: COLORS.bg }}
      contentContainerStyle={{ padding: 16 }}
      ListEmptyComponent={
        loading
          ? <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
          : <Text style={styles.empty}>No hay alertas registradas</Text>
      }
      renderItem={({ item }) => {
        const badge = BADGE_COLORS[item.estado] || BADGE_COLORS.pendiente;
        const tipo = TIPO_COLORS[item.tipo] || TIPO_COLORS.Otro;
        return (
          <TouchableOpacity style={styles.card} onPress={() => onViewDetail && onViewDetail(item._id)}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                <Text style={[styles.badgeText, { color: badge.text }]}>{item.estado?.replace('_', ' ') || 'pendiente'}</Text>
              </View>
              <Text style={{ fontSize: 12, color: COLORS.textMuted }}>{new Date(item.fecha).toLocaleDateString('es-ES')}</Text>
            </View>
            <View style={[styles.tipoBadge, { backgroundColor: tipo.bg, alignSelf: 'flex-start', marginBottom: 8 }]}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: tipo.text }}>{item.tipo}</Text>
            </View>
            <Text style={styles.cardDesc}>{item.descripcion}</Text>
            <Text style={styles.cardSector}>{item.sector}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardAuthor}>Por: {item.autor?.nombre || 'Anonimo'}</Text>
              {puedeEliminar && (
                <TouchableOpacity onPress={() => handleEliminar(item._id)}>
                  <Text style={styles.btnEliminar}>Eliminar</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
}
