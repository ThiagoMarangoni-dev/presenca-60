import axios from 'axios';
import { getToken } from '../storage/storage';

// TROQUE pelo IP do computador que está rodando o backend (veja o README)
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.10:8080';

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
