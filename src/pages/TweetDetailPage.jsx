// src/pages/TweetDetailPage.jsx

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Tweet from '../components/Tweet';
import styles from './TweetDetailPage.module.css';
import Layout from '../components/Layout';

export default function TweetDetailPage() {
  const [parentTweet, setParentTweet] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams(); // Obtiene el ID del tweet desde la URL

  useEffect(() => {
    const fetchTweetAndReplies = async () => {
      setLoading(true);
      try {
        // 1. Obtener el tweet principal
        const { data: parentData, error: parentError } = await supabase
          .from('tweets')
          .select('*, profiles(*), likes(*)')
          .eq('id', id)
          .single();
        
        if (parentError) throw parentError;
        setParentTweet(parentData);

        // 2. Obtener las respuestas a ese tweet
        const { data: repliesData, error: repliesError } = await supabase
          .from('tweets')
          .select('*, profiles(*), likes(*)')
          .eq('reply_to_tweet_id', id)
          .order('created_at', { ascending: true }); // Las respuestas en orden cronológico

        if (repliesError) throw repliesError;
        setReplies(repliesData);

      } catch (error) {
        console.error('Error fetching conversation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTweetAndReplies();
  }, [id]);

  // Función para actualizar la UI cuando se borra un tweet de esta vista
  const handleDelete = (deletedTweetId) => {
    if (parentTweet && parentTweet.id === deletedTweetId) {
      // Si se borra el tweet principal, podríamos redirigir o mostrar un mensaje
      setParentTweet(null);
    } else {
      setReplies(currentReplies => currentReplies.filter(reply => reply.id !== deletedTweetId));
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <Link to="/" className={styles.backButton}>←</Link>
          <h2>Hilo</h2>
        </div>
        {loading ? (
          <p>Cargando conversación...</p>
        ) : (
          <>
            {parentTweet ? (
              <Tweet tweet={parentTweet} onDelete={handleDelete} />
            ) : (
              <p>Este tweet ya no existe.</p>
            )}
            <div className={styles.repliesSection}>
              {replies.map(reply => (
                <Tweet key={reply.id} tweet={reply} onDelete={handleDelete} />
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}