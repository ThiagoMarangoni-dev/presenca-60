import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../services/api';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { colors } from '../../theme';
import type { RootStackScreenProps } from '../../navigation/types';

export function LoginScreen({ navigation }: RootStackScreenProps<'Login'>) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      setError('Preencha o e-mail e a senha');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await signIn(email.trim(), password);
      // não precisa navegar: quando o "user" muda, as rotas trocam sozinhas para o app
    } catch (e) {
      setError(getErrorMessage(e));
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Presença 60</Text>
      <Text style={styles.subtitle}>Controle seus dias no escritório</Text>

      <Input label="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="voce@empresa.com" />
      <Input label="Senha" value={password} onChangeText={setPassword} secureTextEntry placeholder="Sua senha" />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button title="Entrar" onPress={handleLogin} loading={loading} />

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Não tem conta? Cadastre-se</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: colors.background },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: colors.primary },
  subtitle: { fontSize: 16, textAlign: 'center', color: colors.gray, marginBottom: 32 },
  error: { color: colors.danger, textAlign: 'center' },
  link: { color: colors.primary, fontWeight: 'bold', textAlign: 'center', marginTop: 24, fontSize: 16 },
});
