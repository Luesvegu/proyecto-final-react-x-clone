// src/components/Timeline.jsx

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

  // --- NUEVA FUNCIÓN PARA ACTUALIZAR LA UI AL ELIMINAR ---
  const handleDeleteTweet = (deletedTweetId) => {
    // Filtramos la lista de tweets, quedándonos solo con los que NO tengan el ID eliminado
    setTweets(currentTweets => currentTweets.filter(tweet => tweet.id !== deletedTweetId));
  };

  useEffect(() => {
    // Dentro de useEffect en Timeline.jsx

    const fetchTweets = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('tweets')
          .select('*, profiles(*), likes(*)')
          // --- LÍNEA MODIFICADA ---
          // .is() es el filtro para buscar valores NULOS
          .is('reply_to_tweet_id', null) 
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

    const channel = supabase
      .channel('realtime tweets')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tweets' }, (payload) => {
        fetchTweets(); 
      })
      // --- NUEVO: ESCUCHAR EVENTOS DE ELIMINACIÓN ---
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'tweets' }, (payload) => {
        // Cuando un tweet se borra en la BD, lo quitamos de la UI
        handleDeleteTweet(payload.old.id);
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

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
          // Pasamos la función handleDeleteTweet como prop a cada tweet
          tweets.map((tweet) => (
            <Tweet key={tweet.id} tweet={tweet} onDelete={handleDeleteTweet} />
          ))
        ) : (
          <p className={styles.loadingText}>Aún no hay tweets. ¡Sé el primero en publicar!</p>
        )}
      </div>
    </div>
  );
}