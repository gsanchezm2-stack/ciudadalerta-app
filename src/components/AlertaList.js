import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getAlertas, eliminarAlerta } from '../api';
import { tienePermiso } from '../permisos';
import { styles } from '../styles';

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

  const badgeStyle = (estado) => {
    if (estado === 'resuelto') return styles.badgeResolved;
    if (estado === 'en_revision') return styles.badgeReview;
    return styles.badgePending;
  };

  return (
    <FlatList
      data={alertas}
      keyExtractor={item => item._id}
      style={styles.lista}
      ListEmptyComponent={
        loading
          ? <ActivityIndicator size="large" color="#065A82" style={{ marginTop: 40 }} />
          : <Text style={styles.empty}>No hay alertas registradas</Text>
      }
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => onViewDetail && onViewDetail(item._id)}>
          <View style={styles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <View style={[styles.badge, badgeStyle(item.estado)]}>
                  <Text style={{ fontSize: 10, fontWeight: '600' }}>{item.estado?.replace('_', ' ') || 'pendiente'}</Text>
                </View>
                <Text style={styles.cardTipo}>{item.tipo}</Text>
              </View>
              {puedeEliminar && (
                <TouchableOpacity onPress={() => handleEliminar(item._id)}>
                  <Text style={styles.btnEliminar}>Eliminar</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.cardDesc}>{item.descripcion}</Text>
            <Text style={{ color: '#888', fontSize: 12, marginTop: 4 }}>{item.sector}</Text>
            <Text style={{ color: '#bbb', fontSize: 11, marginTop: 2 }}>Por: {item.autor?.nombre || 'Anonimo'}</Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}
