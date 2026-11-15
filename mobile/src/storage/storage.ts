import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

// Salva o token e o usuário no celular: assim o app abre já logado
export async function saveSession(token: string, user: User) {
  await AsyncStorage.setItem('token', token);
  await AsyncStorage.setItem('user', JSON.stringify(user)); // objeto -> texto
}

export async function saveUser(user: User) {
  await AsyncStorage.setItem('user', JSON.stringify(user));
}

export async function getToken() {
  return AsyncStorage.getItem('token');
}

export async function getUser(): Promise<User | null> {
  const user = await AsyncStorage.getItem('user');
  return user ? JSON.parse(user) : null; // texto -> objeto
}

export async function clearSession() {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('user');
}
