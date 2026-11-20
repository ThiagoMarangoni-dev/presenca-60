import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { api, getErrorMessage } from '../../services/api';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { colors } from '../../theme';

export function ProfileScreen() {
  const { user, updateUser, signOut } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [target, setTarget] = useState(String(user?.targetPercent || 60));

  async function handleSave() {
    try {
      const response = await api.put('/users/me', { name, targetPercent: Number(target) }); // UPDATE
      await updateUser(response.data);
      Alert.alert('Pronto', 'Perfil atualizado!');
    } catch (e) {
      Alert.alert('Erro', getErrorMessage(e));
    }
  }

  function handleDelete() {
    Alert.alert('Excluir conta', 'Sua conta e seus registros serão apagados.', [
      { text: 'Cancelar' },
      {
        text: 'Excluir',
        onPress: async () => {
          await api.delete('/users/me'); // DELETE
          await signOut();
        },
      },
    ]);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.email}>{user?.email}</Text>

      <Input label="Nome" value={name} onChangeText={setName} />
      <Input label="Meta de presença (%)" value={target} onChangeText={setTarget} keyboardType="numeric" />

      <Button title="Salvar" onPress={handleSave} />
      <Button title="Sair" onPress={signOut} color={colors.gray} />
      <Button title="Excluir conta" onPress={handleDelete} color={colors.danger} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  email: { textAlign: 'center', color: colors.gray, fontSize: 16, marginBottom: 16 },
});
