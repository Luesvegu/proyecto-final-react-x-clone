// src/components/Timeline.jsx

import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import styles from './Timeline.module.css';
import CreateTweet from './CreateTweet';
import Tweet from './Tweet';
import { useAuth } from '../context/AuthContext';

export default function Timeline() {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // --- LÓGICA DE FETCHING RESTAURADA A "FEED GLOBAL" ---
    const fetchTweets = async () => {
      setLoading(true);
      try {
        // Simplemente obtenemos todos los tweets, sin filtrar por seguidores
        const { data, error } = await supabase
          .from('tweets')
          .select('*, profiles(*), likes(*)')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTweets(data);
      } catch (error) {
        console.error('Error fetching tweets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTweets();

    // La suscripción en tiempo real simplemente volverá a cargar el feed global
    // para mostrar cualquier tweet nuevo de cualquier usuario.
    const channel = supabase
      .channel('realtime tweets')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tweets' }, (payload) => {
        fetchTweets(); 
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };

  }, [user]); // Dejamos la dependencia de 'user' para que el feed se recargue si el usuario cambia

  return (
    <div className={styles.timeline}>
      <div className={styles.header}>
        <h2>Inicio</h2>
      </div>
      <CreateTweet />
      <div className={styles.tweetFeed}>
        {loading ? (
          <p className={styles.loadingText}>Cargando tweets...</p>
        ) : tweets.length > 0 ? (
          tweets.map((tweet) => <Tweet key={tweet.id} tweet={tweet} />)
        ) : (
          <p className={styles.loadingText}>Aún no hay tweets. ¡Sé el primero en publicar!</p>
        )}
      </div>
    </div>
  );
}