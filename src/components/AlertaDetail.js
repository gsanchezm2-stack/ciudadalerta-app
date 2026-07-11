import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getAlerta, cambiarEstadoAlerta, eliminarAlerta } from '../api';
import { tienePermiso } from '../permisos';
import { ESTADOS_ALERTA } from '../utils';

export default function AlertaDetail({ route, navigation }) {
  const { id } = route.params;
  const { user, token } = useAuth();
  const [alerta, setAlerta] = useState(null);
  const [loading, setLoading] = useState(true);

  const esAutor = alerta?.autor?._id === user.id;
  const puedeCambiarEstado = tienePermiso(user.rol, 'alertas:cambiar_estado') || (tienePermiso(user.rol, 'alertas:cerrar_propia') && esAutor);
  const puedeEliminar = tienePermiso(user.rol, 'alertas:eliminar');
  const puedeCambiarEstadoLibre = tienePermiso(user.rol, 'alertas:cambiar_estado');

  useEffect(() => {
    async function load() {
      try {
        const data = await getAlerta(token, id);
        setAlerta(data);
      } catch (err) {
        Alert.alert('Error', err.message);
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleEstado = async () => {
    let nuevoEstado;
    if (puedeCambiarEstadoLibre) {
      const idx = ESTADOS_ALERTA.indexOf(alerta.estado);
      const nextIdx = (idx + 1) % ESTADOS_ALERTA.length;
      nuevoEstado = ESTADOS_ALERTA[nextIdx];
    } else {
      nuevoEstado = 'resuelto';
    }
    try {
      const updated = await cambiarEstadoAlerta(token, id, nuevoEstado);
      setAlerta(updated);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const handleDelete = () => {
    Alert.alert('Confirmar', 'Seguro que quieres eliminar esta alerta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          try {
            await eliminarAlerta(token, id);
            navigation.goBack();
          } catch (err) {
            Alert.alert('Error', err.message);
          }
        }
      }
    ]);
  };

  if (loading) return <ActivityIndicator size="large" color="#065A82" style={{ marginTop: 40 }} />;
  if (!alerta) return <Text style={{ textAlign: 'center', marginTop: 40, color: '#888' }}>Alerta no encontrada</Text>;

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 20 }}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={{ color: '#065A82', marginBottom: 12 }}>{'< '}Volver</Text>
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
        <View style={[{ paddingHorizontal: 10, paddingVertical: 3, borderRadius: 100 },
          alerta.estado === 'resuelto' ? { backgroundColor: '#dcfce7' } :
          alerta.estado === 'en_revision' ? { backgroundColor: '#dbeafe' } : { backgroundColor: '#fef3c7' }
        ]}>
          <Text style={{ fontSize: 12, fontWeight: '600' }}>{alerta.estado?.replace('_', ' ') || 'pendiente'}</Text>
        </View>
        <Text style={{ fontWeight: '600', color: '#065A82' }}>{alerta.tipo}</Text>
      </View>

      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 20 }}>{alerta.descripcion}</Text>

      <View style={{ gap: 12, marginBottom: 24 }}>
        <Row label="Sector" value={alerta.sector} />
        <Row label="Fecha" value={new Date(alerta.fecha).toLocaleDateString('es-ES')} />
        <Row label="Reportado por" value={alerta.autor?.nombre || 'Anonimo'} />
      </View>

      {puedeCambiarEstado && (
        <TouchableOpacity style={{ backgroundColor: '#028090', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 12 }}
          onPress={handleEstado}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Cambiar estado</Text>
        </TouchableOpacity>
      )}

      {puedeEliminar && (
        <TouchableOpacity style={{ backgroundColor: '#dc2626', padding: 14, borderRadius: 8, alignItems: 'center' }}
          onPress={handleDelete}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Eliminar alerta</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function Row({ label, value }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={{ color: '#6b7280', fontSize: 14 }}>{label}</Text>
      <Text style={{ color: '#1f2937', fontSize: 14, fontWeight: '500' }}>{value}</Text>
    </View>
  );
}
