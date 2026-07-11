import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { crearAlerta } from '../api';
import { styles } from '../styles';
import { TIPOS_ALERTA } from '../utils';

export default function AlertaForm({ onAlertaCreada }) {
  const { token } = useAuth();
  const [tipo, setTipo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [sector, setSector] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const handleSubmit = async () => {
    if (!tipo || !descripcion.trim() || !sector.trim()) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }
    if (descripcion.trim().length < 10) {
      Alert.alert('Error', 'La descripcion debe tener al menos 10 caracteres');
      return;
    }
    setLoading(true);
    try {
      await crearAlerta(token, { tipo, descripcion, sector });
      Alert.alert('Exito', 'Alerta registrada correctamente');
      setTipo('');
      setDescripcion('');
      setSector('');
      onAlertaCreada();
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo enviar la alerta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.form}>
      <Text style={styles.formTitle}>Registrar nueva alerta</Text>

      <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 }}>Tipo de alerta</Text>
      {TIPOS_ALERTA.map(t => (
        <TouchableOpacity
          key={t}
          style={[styles.tipoSelect, tipo === t && { backgroundColor: '#f0f7fa', borderColor: '#065A82' }]}
          onPress={() => setTipo(t)}
        >
          <Text style={[tipo === t && { color: '#065A82', fontWeight: '600' }]}>{t}</Text>
        </TouchableOpacity>
      ))}

      <TextInput style={styles.input} placeholder="Sector"
        value={sector} onChangeText={setSector} />

      <TextInput style={[styles.input, styles.textarea]} placeholder="Descripcion de la alerta (min. 10 caracteres)"
        value={descripcion} onChangeText={setDescripcion} multiline numberOfLines={4} />

      <TouchableOpacity style={styles.btnEnviar} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.btnEnviarText}>{loading ? 'Enviando...' : 'Enviar Alerta'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
