import axios from 'axios';
import { Platform } from 'react-native';
import { getToken } from '../storage/storage';

// Endereço do computador nos simuladores. No celular físico, configure
// EXPO_PUBLIC_API_URL com o IP do computador na rede Wi-Fi (veja o README).
const DEFAULT_API_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:8080'
  : 'http://localhost:8080';
const API_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL;

export const api = axios.create({ baseURL: API_URL });

// Interceptor: antes de cada requisição, coloca o token JWT no header
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Pega a mensagem de erro que o Spring mandou
export function getErrorMessage(error: any): string {
  if (!error.response) {
    return 'Sem conexão com o servidor. Confira o IP em services/api.ts';
  }
  return error.response.data?.message || 'Erro ao falar com o servidor';
}
