// src/context/AuthContext.jsx

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

// 1. Creamos el contexto
const AuthContext = createContext();

// 2. Creamos el Proveedor del contexto
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificamos si ya existe una sesión
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Escuchamos cambios en el estado de autenticación (login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    // Limpiamos la suscripción cuando el componente se desmonte
    return () => subscription.unsubscribe();
  }, []);

  const value = {
    session,
    user: session?.user,
    signOut: () => supabase.auth.signOut(),
  };

  // Retornamos el proveedor con el 'value' que queremos exponer
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// 3. Creamos un hook personalizado para usar el contexto más fácilmente
export function useAuth() {
  return useContext(AuthContext);
}