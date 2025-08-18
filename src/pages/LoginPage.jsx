// src/pages/LoginPage.jsx

import { useState } from 'react';
import { supabase } from '../supabaseClient';
import styles from './LoginPage.module.css'; // Importaremos estilos CSS Modules

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false); // Nuevo estado para alternar

  const handleAuthAction = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // --- Lógica de Registro ---
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        // Supabase envía un email de confirmación por defecto.
        alert('¡Registro exitoso! Revisa tu email para confirmar tu cuenta.');
      } else {
        // --- Lógica de Login ---
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // No necesitamos un alert aquí porque el onAuthStateChange nos redirigirá
      }
    } catch (error) {
      alert(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h1>{isSignUp ? 'Crear una Cuenta' : 'Iniciar Sesión'}</h1>
        <p>{isSignUp ? 'Únete a la conversación.' : 'Descubre lo que está pasando.'}</p>
        
        <form onSubmit={handleAuthAction}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Cargando...' : (isSignUp ? 'Registrarse' : 'Iniciar Sesión')}
          </button>
        </form>

        <p className={styles.toggleText}>
          {isSignUp ? '¿Ya tienes una cuenta? ' : '¿No tienes una cuenta? '}
          <span onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? 'Inicia sesión' : 'Regístrate'}
          </span>
        </p>
      </div>
    </div>
  );
}