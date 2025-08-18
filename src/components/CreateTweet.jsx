// src/components/CreateTweet.jsx

import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import styles from './CreateTweet.module.css';

export default function CreateTweet({ onTweetCreated }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return; // No enviar tweets vacíos

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tweets')
        .insert([{ content, user_id: user.id }])
        .select() // .select() devuelve el registro recién creado
        .single();

      if (error) throw error;

      // Llamamos a la función del padre para actualizar el estado de los tweets
      if (onTweetCreated) {
        onTweetCreated(data);
      }
      
      setContent(''); // Limpiamos el textarea
    } catch (error) {
      console.error('Error creating tweet:', error);
      alert('No se pudo publicar el tweet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.createTweetContainer}>
      <form onSubmit={handleSubmit}>
        <textarea
          className={styles.textarea}
          placeholder="¿Qué está pasando?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength="280"
        />
        <div className={styles.footer}>
          <span className={styles.charCount}>{280 - content.length}</span>
          <button type="submit" disabled={loading || !content.trim()}>
            {loading ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </form>
    </div>
  );
}