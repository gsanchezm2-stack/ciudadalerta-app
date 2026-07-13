import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../api';
import { styles, COLORS } from '../styles';

export default function LoginView({ onToggleForm }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Completa todos los campos');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      login(data.usuario, data.token);
    } catch (err) {
      setError(err.message || 'No se pudo conectar al servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.authContainer}>
      <View style={styles.authBox}>
        <Text style={styles.authTitle}>Iniciar Sesion</Text>
        {error ? <Text style={styles.authError}>{error}</Text> : null}
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
          placeholder="Tu contrasena"
          placeholderTextColor={COLORS.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.btnEnviar} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnEnviarText}>Entrar</Text>
          )}
        </TouchableOpacity>
        <Text style={styles.authToggle}>
          No tienes cuenta?{' '}
          <Text style={styles.authLink} onPress={onToggleForm}>Registrate</Text>
        </Text>
      </View>
    </View>
  );
}
