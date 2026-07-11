import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getUsuarios, cambiarRolUsuario } from '../api';
import { tienePermiso } from '../permisos';
import { styles } from '../styles';

const ROLES = ['ciudadano', 'autoridad', 'administrador'];

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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#888' }}>No tienes acceso a esta seccion</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827' }}>Panel de Administracion</Text>
        <Text style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>Gestionar usuarios y roles</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#065A82" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={usuarios}
          keyExtractor={item => item._id}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontWeight: '600', color: '#111827', fontSize: 15 }}>{item.nombre}</Text>
                <View style={[styles.badge,
                  item.rol === 'administrador' ? { backgroundColor: '#fef2f2' } :
                  item.rol === 'autoridad' ? { backgroundColor: '#dbeafe' } : { backgroundColor: '#f3f4f6' }
                ]}>
                  <Text style={{ fontSize: 10, fontWeight: '600' }}>{item.rol}</Text>
                </View>
              </View>
              <Text style={{ color: '#6b7280', fontSize: 13 }}>{item.email}</Text>

              {item._id !== user.id && (
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                  {ROLES.filter(r => r !== item.rol).map(r => (
                    <TouchableOpacity
                      key={r}
                      style={{ backgroundColor: '#f3f4f6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }}
                      onPress={() => handleRolChange(item._id, item.nombre, r)}
                    >
                      <Text style={{ fontSize: 11, color: '#374151' }}>{r}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}
