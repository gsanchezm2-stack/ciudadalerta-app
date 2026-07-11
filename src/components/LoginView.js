import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../api';
import { styles } from '../styles';

export default function LoginView({ onToggleForm }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      login(data.usuario, data.token);
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo conectar al servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.authContainer}>
      <View style={styles.authBox}>
        <Text style={styles.authTitle}>Iniciar Sesión</Text>
        <TextInput style={styles.input} placeholder="Email" value={email}
          onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Contraseña" value={password}
          onChangeText={setPassword} secureTextEntry />
        <TouchableOpacity style={styles.btnEnviar} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnEnviarText}>Entrar</Text>
          )}
        </TouchableOpacity>
        <Text style={styles.authToggle}>
          ¿No tienes cuenta?{' '}
          <Text style={styles.authLink} onPress={onToggleForm}>Regístrate</Text>
        </Text>
      </View>
    </View>
  );
}
