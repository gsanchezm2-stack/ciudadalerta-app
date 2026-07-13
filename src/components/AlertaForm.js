import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { crearAlerta } from '../api';
import { styles, COLORS } from '../styles';
import { TIPOS_ALERTA } from '../utils';

const TIPO_COLORS = {
  Seguridad: '#fee2e2', Infraestructura: '#fef3c7', Movilidad: '#dbeafe',
  Ambiental: '#dcfce7', Salud: '#f3e8ff', Educacion: '#e0e7ff', Otro: '#e5e7eb',
};

export default function AlertaForm({ onAlertaCreada }) {
  const { token } = useAuth();
  const [tipo, setTipo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [sector, setSector] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!tipo || !descripcion.trim() || !sector.trim()) {
      setError('Todos los campos son obligatorios');
      return;
    }
    if (descripcion.trim().length < 10) {
      setError('La descripcion debe tener al menos 10 caracteres');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await crearAlerta(token, { tipo, descripcion, sector });
      Alert.alert('Exito', 'Alerta registrada correctamente');
      setTipo('');
      setDescripcion('');
      setSector('');
      onAlertaCreada();
    } catch (err) {
      setError(err.message || 'No se pudo enviar la alerta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.form} contentContainerStyle={{ paddingBottom: 24 }}>
      <Text style={styles.formTitle}>Nueva Alerta</Text>
      {error ? <Text style={styles.authError}>{error}</Text> : null}

      <Text style={styles.formLabel}>Tipo de alerta</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {TIPOS_ALERTA.map(t => {
          const isSelected = tipo === t;
          const tc = TIPO_COLORS[t] || '#e5e7eb';
          return (
            <TouchableOpacity
              key={t}
              style={[
                styles.tipoBadge,
                { backgroundColor: isSelected ? tc : COLORS.card, borderWidth: isSelected ? 2 : 1, borderColor: isSelected ? COLORS.primary : 'rgba(0,0,0,0.05)' },
              ]}
              onPress={() => setTipo(t)}
            >
              <Text style={{ fontSize: 13, fontWeight: isSelected ? '700' : '500', color: isSelected ? COLORS.primary : COLORS.textSecondary }}>
                {t}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.formLabel}>Sector</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Zona Colonial, Naco..."
        placeholderTextColor={COLORS.textMuted}
        value={sector}
        onChangeText={setSector}
      />

      <Text style={styles.formLabel}>Descripcion detallada</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        placeholder="Describe el problema con detalle (min. 10 caracteres)"
        placeholderTextColor={COLORS.textMuted}
        value={descripcion}
        onChangeText={setDescripcion}
        multiline
        numberOfLines={4}
      />
      <Text style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 16, textAlign: 'right' }}>
        {descripcion.length}/500
      </Text>

      <TouchableOpacity
        style={[styles.btnEnviar, loading && { opacity: 0.5 }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.btnEnviarText}>{loading ? 'Enviando...' : 'Enviar Alerta'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
