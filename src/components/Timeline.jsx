import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import styles from './Timeline.module.css';
import CreateTweet from './CreateTweet';
import Tweet from './Tweet';

export default function Timeline() {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Función para obtener los tweets iniciales
    const fetchTweets = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('tweets')
          .select('*, profiles(*), likes(*)') // Traemos tweets, perfiles y likes
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

    // 2. Suscripción a nuevos tweets en tiempo real
    const channel = supabase
      .channel('realtime tweets')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tweets' },
        (payload) => {
          // Cuando llega un nuevo tweet, necesitamos obtener el perfil del autor
          // ya que la subscripción no hace el "join" automáticamente.
          const fetchNewTweetWithProfile = async () => {
             const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', payload.new.user_id)
              .single();

            if (!error) {
              // --- LÍNEA CORREGIDA ---
              // Aseguramos que el nuevo tweet tenga la misma estructura,
              // incluyendo un array de 'likes' vacío.
              const newTweet = { ...payload.new, profiles: data, likes: [] };
              setTweets((currentTweets) => [newTweet, ...currentTweets]);
            }
          };
          fetchNewTweetWithProfile();
        }
      )
      .subscribe();
      
    // 3. Limpieza de la suscripción al desmontar el componente
    return () => {
      supabase.removeChannel(channel);
    };

  }, []);

  return (
    <div className={styles.timeline}>
      <div className={styles.header}>
        <h2>Inicio</h2>
      </div>
      <CreateTweet />
      <div className={styles.tweetFeed}>
        {loading ? (
          <p className={styles.loadingText}>Cargando tweets...</p>
        ) : (
          tweets.map((tweet) => <Tweet key={tweet.id} tweet={tweet} />)
        )}
      </div>
    </div>
  );
}