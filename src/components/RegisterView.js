import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { registrarUsuario } from '../api';
import { styles, COLORS } from '../styles';

export default function RegisterView({ onToggleForm }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!nombre || !email || !password) {
      setError('Completa todos los campos');
      return;
    }
    if (password.length < 8) {
      setError('La contrasena debe tener al menos 8 caracteres');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await registrarUsuario(nombre, email, password);
      Alert.alert('Exito', 'Registrado exitosamente. Ahora inicia sesion.');
      onToggleForm();
    } catch (err) {
      setError(err.message || 'No se pudo conectar al servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.authContainer}>
      <View style={styles.authBox}>
        <Text style={styles.authTitle}>Crear Cuenta</Text>
        {error ? <Text style={styles.authError}>{error}</Text> : null}
        <Text style={styles.formLabel}>Nombre completo</Text>
        <TextInput
          style={styles.input}
          placeholder="Tu nombre"
          placeholderTextColor={COLORS.textMuted}
          value={nombre}
          onChangeText={setNombre}
        />
        <Text style={styles.formLabel}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="tu@email.com"
          placeholderTextColor={COLORS.textMuted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Text style={styles.formLabel}>Contrasena</Text>
        <TextInput
          style={styles.input}
          placeholder="Min. 8 caracteres"
          placeholderTextColor={COLORS.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.btnEnviar} onPress={handleRegister} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnEnviarText}>Registrarse</Text>
          )}
        </TouchableOpacity>
        <Text style={styles.authToggle}>
          Ya tienes cuenta?{' '}
          <Text style={styles.authLink} onPress={onToggleForm}>Inicia sesion</Text>
        </Text>
      </View>
    </View>
  );
}
