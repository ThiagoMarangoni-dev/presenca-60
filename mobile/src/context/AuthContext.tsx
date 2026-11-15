import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
import { clearSession, getUser, saveSession, saveUser } from '../storage/storage';
import { User } from '../types';

interface AuthContextData {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
}

// 1. Cria o contexto (estado global do usuário logado)
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// 2. Provider: guarda o usuário e as funções de login/logout
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Quando o app abre: procura o usuário salvo no AsyncStorage
  useEffect(() => {
    getUser().then((savedUser) => {
      setUser(savedUser);
      setLoading(false);
    });
  }, []);

  async function signIn(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password });
    await saveSession(response.data.token, response.data.user);
    setUser(response.data.user);
  }

  async function signUp(name: string, email: string, password: string) {
    const response = await api.post('/auth/register', { name, email, password });
    await saveSession(response.data.token, response.data.user);
    setUser(response.data.user);
  }

  async function signOut() {
    await clearSession();
    setUser(null);
  }

  // Usado pelo Perfil depois de salvar as alterações
  async function updateUser(newUser: User) {
    await saveUser(newUser);
    setUser(newUser);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. Hook para usar o contexto nas telas: const { user } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}
