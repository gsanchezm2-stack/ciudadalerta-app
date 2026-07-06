import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  FlatList, Alert, SafeAreaView, StatusBar
} from 'react-native';

// ✅ CAMBIADO: Ahora usa la URL de ngrok
const API = 'https://handler-keep-ecology.ngrok-free.dev';

export default function App() {
  const [alertas, setAlertas] = useState([]);
  const [tipo, setTipo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [sector, setSector] = useState('');
  const [vista, setVista] = useState('alertas');

  const obtenerAlertas = async () => {
    try {
      const res = await fetch(`${API}/alertas`);
      const data = await res.json();
      setAlertas(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar al servidor');
    }
  };

  useEffect(() => {
    obtenerAlertas();
  }, []);

  const enviarAlerta = async () => {
    if (!tipo || !descripcion || !sector) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }
    try {
      await fetch(`${API}/alertas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, descripcion, sector })
      });
      Alert.alert('Éxito', 'Alerta registrada correctamente');
      setTipo('');
      setDescripcion('');
      setSector('');
      setVista('alertas');
      obtenerAlertas();
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar la alerta');
    }
  };

  const eliminarAlerta = async (id) => {
    Alert.alert('Confirmar', '¿Deseas eliminar esta alerta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          await fetch(`${API}/alertas/${id}`, { method: 'DELETE' });
          obtenerAlertas();
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#065A82" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🚨 CiudadAlerta</Text>
        <Text style={styles.headerSubtitle}>Plataforma de alertas ciudadanas</Text>
      </View>
      <View style={styles.nav}>
        <TouchableOpacity
          style={[styles.navBtn, vista === 'alertas' && styles.navBtnActive]}
          onPress={() => setVista('alertas')}>
          <Text style={[styles.navText, vista === 'alertas' && styles.navTextActive]}>Ver Alertas</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navBtn, vista === 'nueva' && styles.navBtnActive]}
          onPress={() => setVista('nueva')}>
          <Text style={[styles.navText, vista === 'nueva' && styles.navTextActive]}>Nueva Alerta</Text>
        </TouchableOpacity>
      </View>
      {vista === 'nueva' && (
        <View style={styles.form}>
          <Text style={styles.formTitle}>Registrar nueva alerta</Text>
          <TextInput style={styles.input} placeholder="Tipo (Seguridad, Infraestructura...)"
            value={tipo} onChangeText={setTipo} />
          <TextInput style={styles.input} placeholder="Sector o barrio"
            value={sector} onChangeText={setSector} />
          <TextInput style={[styles.input, styles.textarea]} placeholder="Descripción de la alerta"
            value={descripcion} onChangeText={setDescripcion} multiline numberOfLines={4} />
          <TouchableOpacity style={styles.btnEnviar} onPress={enviarAlerta}>
            <Text style={styles.btnEnviarText}>Enviar Alerta</Text>
          </TouchableOpacity>
        </View>
      )}
      {vista === 'alertas' && (
        <FlatList
          data={alertas}
          keyExtractor={item => item._id}
          style={styles.lista}
          ListEmptyComponent={<Text style={styles.empty}>No hay alertas registradas</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTipo}>{item.tipo}</Text>
                <TouchableOpacity onPress={() => eliminarAlerta(item._id)}>
                  <Text style={styles.btnEliminar}>Eliminar</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.cardDesc}>{item.descripcion}</Text>
              <Text style={styles.cardSector}>📍 {item.sector}</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { backgroundColor: '#065A82', padding: 20 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  headerSubtitle: { color: '#A8DADC', fontSize: 14, marginTop: 4 },
  nav: { flexDirection: 'row', padding: 10, gap: 10, backgroundColor: '#f5f5f5' },
  navBtn: { flex: 1, padding: 10, borderRadius: 8, backgroundColor: '#ddd', alignItems: 'center' },
  navBtnActive: { backgroundColor: '#065A82' },
  navText: { color: '#333', fontWeight: '600' },
  navTextActive: { color: '#fff' },
  form: { padding: 20 },
  formTitle: { fontSize: 18, fontWeight: 'bold', color: '#065A82', marginBottom: 15 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 14 },
  textarea: { height: 100, textAlignVertical: 'top' },
  btnEnviar: { backgroundColor: '#028090', padding: 15, borderRadius: 8, alignItems: 'center' },
  btnEnviarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  lista: { padding: 15 },
  empty: { textAlign: 'center', color: '#888', marginTop: 20 },
  card: { backgroundColor: '#f0f9fb', borderRadius: 10, padding: 15, marginBottom: 12, borderLeftWidth: 5, borderLeftColor: '#065A82' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTipo: { fontSize: 16, fontWeight: 'bold', color: '#065A82' },
  btnEliminar: { color: '#e74c3c', fontWeight: '600' },
  cardDesc: { color: '#333', marginTop: 5 },
  cardSector: { color: '#888', fontSize: 12, marginTop: 5 },
});