import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { registrarUsuario } from '../api';
import { styles } from '../styles';

export default function RegisterView({ onToggleForm }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!nombre || !email || !password) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
      return;
    }
    setLoading(true);
    try {
      await registrarUsuario(nombre, email, password);
      Alert.alert('Éxito', 'Registrado exitosamente. Ahora inicia sesión.');
      onToggleForm();
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo conectar al servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.authContainer}>
      <View style={styles.authBox}>
        <Text style={styles.authTitle}>Crear Cuenta</Text>
        <TextInput style={styles.input} placeholder="Nombre completo" value={nombre}
          onChangeText={setNombre} />
        <TextInput style={styles.input} placeholder="Email" value={email}
          onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Contraseña (mín. 8 caracteres)"
          value={password} onChangeText={setPassword} secureTextEntry />
        <TouchableOpacity style={styles.btnEnviar} onPress={handleRegister} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnEnviarText}>Registrarse</Text>
          )}
        </TouchableOpacity>
        <Text style={styles.authToggle}>
          ¿Ya tienes cuenta?{' '}
          <Text style={styles.authLink} onPress={onToggleForm}>Inicia sesión</Text>
        </Text>
      </View>
    </View>
  );
}
