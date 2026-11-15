import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../services/api';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { colors } from '../../theme';

export function RegisterScreen() {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!name || !email || password.length < 6) {
      setError('Preencha tudo. A senha precisa ter 6 caracteres ou mais');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await signUp(name.trim(), email.trim(), password); // já entra logado
    } catch (e) {
      setError(getErrorMessage(e));
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Input label="Nome" value={name} onChangeText={setName} placeholder="Seu nome" />
      <Input label="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="voce@empresa.com" />
      <Input label="Senha" value={password} onChangeText={setPassword} secureTextEntry placeholder="Mínimo 6 caracteres" />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button title="Criar conta" onPress={handleRegister} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  error: { color: colors.danger, textAlign: 'center' },
});
