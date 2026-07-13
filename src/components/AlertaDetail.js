import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getAlerta, cambiarEstadoAlerta, eliminarAlerta, crearComentario, eliminarComentario } from '../api';
import { tienePermiso } from '../permisos';
import { styles, COLORS } from '../styles';

const BADGE_COLORS = {
  pendiente: { bg: '#fef3c7', text: '#92400e' },
  en_revision: { bg: '#dbeafe', text: '#1e40af' },
  resuelto: { bg: '#dcfce7', text: '#166534' },
};

const TIPO_COLORS = {
  Seguridad: { bg: '#fee2e2', text: '#991b1b' },
  Infraestructura: { bg: '#fef3c7', text: '#92400e' },
  Movilidad: { bg: '#dbeafe', text: '#1e40af' },
  Ambiental: { bg: '#dcfce7', text: '#166534' },
  Salud: { bg: '#f3e8ff', text: '#6b21a8' },
  Educacion: { bg: '#e0e7ff', text: '#3730a3' },
  Otro: { bg: '#e5e7eb', text: '#4b5563' },
};

const ROLE_COLORS = {
  ciudadano: { bg: '#dbeafe', text: '#1e40af' },
  autoridad: { bg: '#dcfce7', text: '#166534' },
  administrador: { bg: '#fee2e2', text: '#991b1b' },
};

export default function AlertaDetail({ route, navigation }) {
  const { id } = route.params;
  const { user, token } = useAuth();
  const [alerta, setAlerta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [enviando, setEnviando] = useState(false);

  const esAutor = alerta?.autor?._id === user.id;
  const puedeCambiarEstado = tienePermiso(user.rol, 'alertas:cambiar_estado') || (tienePermiso(user.rol, 'alertas:cerrar_propia') && esAutor);
  const puedeEliminar = tienePermiso(user.rol, 'alertas:eliminar');
  const puedeCambiarEstadoLibre = tienePermiso(user.rol, 'alertas:cambiar_estado');

  useEffect(() => {
    async function load() {
      try {
        const data = await getAlerta(token, id);
        setAlerta(data);
        setComentarios(data.comentarios || []);
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
      const idx = ['pendiente', 'en_revision', 'resuelto'].indexOf(alerta.estado);
      nuevoEstado = ['pendiente', 'en_revision', 'resuelto'][(idx + 1) % 3];
    } else {
      nuevoEstado = 'resuelto';
    }
    try {
      const updated = await cambiarEstadoAlerta(token, id, nuevoEstado);
      setAlerta(prev => ({ ...prev, estado: updated.estado }));
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

  const handleComentario = async () => {
    if (!nuevoComentario.trim()) return;
    setEnviando(true);
    try {
      const c = await crearComentario(token, id, nuevoComentario);
      setComentarios(prev => [c, ...prev]);
      setNuevoComentario('');
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setEnviando(false);
    }
  };

  const handleDeleteComentario = (cid) => {
    Alert.alert('Confirmar', 'Eliminar comentario?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          try {
            await eliminarComentario(token, cid);
            setComentarios(prev => prev.filter(c => c._id !== cid));
          } catch (err) {
            Alert.alert('Error', err.message);
          }
        }
      }
    ]);
  };

  if (loading) return <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />;
  if (!alerta) return <Text style={styles.empty}>Alerta no encontrada</Text>;

  const badge = BADGE_COLORS[alerta.estado] || BADGE_COLORS.pendiente;
  const tipo = TIPO_COLORS[alerta.tipo] || TIPO_COLORS.Otro;

  return (
    <ScrollView style={{ backgroundColor: COLORS.bg }} contentContainerStyle={{ paddingBottom: 24 }}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 16 }}>
        <Text style={{ color: COLORS.primary, fontWeight: '600' }}>{'< '}Volver</Text>
      </TouchableOpacity>

      <View style={styles.detailCard}>
        <View style={styles.detailHeader}>
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.badgeText, { color: badge.text }]}>{alerta.estado?.replace('_', ' ') || 'pendiente'}</Text>
          </View>
          <View style={[styles.tipoBadge, { backgroundColor: tipo.bg }]}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: tipo.text }}>{alerta.tipo}</Text>
          </View>
        </View>

        <Text style={styles.detailTitle}>{alerta.descripcion}</Text>

        <View style={styles.detailMeta}>
          <MetaItem label="Sector" value={alerta.sector} />
          <MetaItem label="Fecha" value={new Date(alerta.fecha).toLocaleDateString('es-ES')} />
          <MetaItem label="Reportado por" value={alerta.autor?.nombre || 'Anonimo'} />
        </View>

        {puedeCambiarEstado && (
          <TouchableOpacity style={styles.btnAccent} onPress={handleEstado}>
            <Text style={styles.btnAccentText}>Cambiar estado</Text>
          </TouchableOpacity>
        )}

        {puedeEliminar && (
          <TouchableOpacity style={[styles.btnDanger, { marginTop: 12 }]} onPress={handleDelete}>
            <Text style={styles.btnDangerText}>Eliminar alerta</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={[styles.detailCard, { marginTop: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0 }]}>
        <Text style={styles.commentTitle}>Comentarios ({comentarios.length})</Text>

        <View style={{ marginBottom: 16 }}>
          <TextInput
            style={[styles.input, { marginBottom: 12 }]}
            placeholder="Escribe un comentario..."
            placeholderTextColor={COLORS.textMuted}
            value={nuevoComentario}
            onChangeText={setNuevoComentario}
            multiline
            numberOfLines={3}
          />
          <TouchableOpacity
            style={[styles.btnEnviar, (!nuevoComentario.trim() || enviando) && { opacity: 0.5 }]}
            onPress={handleComentario}
            disabled={!nuevoComentario.trim() || enviando}
          >
            <Text style={styles.btnEnviarText}>{enviando ? 'Enviando...' : 'Comentar'}</Text>
          </TouchableOpacity>
        </View>

        {comentarios.map(c => {
          const roleColor = ROLE_COLORS[c.autor?.rol] || ROLE_COLORS.ciudadano;
          return (
            <View key={c._id} style={styles.commentCard}>
              <View style={styles.commentHeader}>
                <Text style={styles.commentAuthor}>{c.autor?.nombre || 'Anonimo'}</Text>
                <View style={[styles.roleBadge, { backgroundColor: roleColor.bg }]}>
                  <Text style={[styles.roleBadgeText, { color: roleColor.text }]}>{c.autor?.rol}</Text>
                </View>
                <Text style={styles.commentDate}>{new Date(c.fecha).toLocaleDateString('es-ES')}</Text>
              </View>
              <Text style={styles.commentText}>{c.texto}</Text>
              {(c.autor?._id === user.id || tienePermiso(user.rol, 'comentarios:eliminar')) && (
                <TouchableOpacity onPress={() => handleDeleteComentario(c._id)} style={{ marginTop: 6 }}>
                  <Text style={{ color: COLORS.danger, fontSize: 12, fontWeight: '600' }}>Eliminar</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
        {comentarios.length === 0 && <Text style={styles.empty}>No hay comentarios aun</Text>}
      </View>
    </ScrollView>
  );
}

function MetaItem({ label, value }) {
  return (
    <View style={styles.detailMetaItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}
