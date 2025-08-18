// src/components/Tweet.jsx

import { useState, useEffect } from 'react';
import styles from './Tweet.module.css';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

// Función para formatear la fecha (sin cambios)
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('es-ES', options);
}

export default function Tweet({ tweet }) {
  const { user } = useAuth(); // Obtenemos el usuario actual del contexto
  const author = tweet.profiles;

  // --- NUEVO ESTADO PARA LIKES ---
  const [likeCount, setLikeCount] = useState(tweet.likes.length);
  const [isLikedByUser, setIsLikedByUser] = useState(false);
  const [loadingLike, setLoadingLike] = useState(false);

  // useEffect para determinar si el usuario actual ya le dio "like" a este tweet
  useEffect(() => {
    if (user) {
      const userHasLiked = tweet.likes.some(like => like.user_id === user.id);
      setIsLikedByUser(userHasLiked);
    }
  }, [tweet.likes, user]);

  // --- NUEVA FUNCIÓN PARA MANEJAR EL CLIC EN "ME GUSTA" ---
  const handleLike = async () => {
    if (!user || loadingLike) return;
    setLoadingLike(true);

    try {
      if (isLikedByUser) {
        // --- Lógica para quitar el "like" (Unlike) ---
        // Actualización optimista de la UI
        setIsLikedByUser(false);
        setLikeCount(prev => prev - 1);

        const { error } = await supabase
          .from('likes')
          .delete()
          .match({ user_id: user.id, tweet_id: tweet.id });

        if (error) {
          // Si falla, revertimos la UI
          setIsLikedByUser(true);
          setLikeCount(prev => prev + 1);
          throw error;
        }
      } else {
        // --- Lógica para dar "like" (Like) ---
        // Actualización optimista de la UI
        setIsLikedByUser(true);
        setLikeCount(prev => prev + 1);

        const { error } = await supabase
          .from('likes')
          .insert({ user_id: user.id, tweet_id: tweet.id });

        if (error) {
          // Si falla, revertimos la UI
          setIsLikedByUser(false);
          setLikeCount(prev => prev - 1);
          throw error;
        }
      }
    } catch (error) {
      console.error('Error handling like:', error.message);
    } finally {
      setLoadingLike(false);
    }
  };

  return (
    <div className={styles.tweetContainer}>
      <div className={styles.avatar}></div>
      <div className={styles.tweetContent}>
        <div className={styles.header}>
          <span className={styles.fullName}>{author?.full_name || 'Usuario'}</span>
          <span className={styles.username}>@{author?.username || 'username'}</span>
          <span className={styles.dot}>·</span>
          <span className={styles.timestamp}>{formatDate(tweet.created_at)}</span>
        </div>
        <p className={styles.content}>{tweet.content}</p>

        {/* --- NUEVA SECCIÓN DE ACCIONES CON EL BOTÓN DE LIKE --- */}
        <div className={styles.actions}>
          <button 
            onClick={handleLike} 
            className={`${styles.likeButton} ${isLikedByUser ? styles.liked : ''}`}
            disabled={loadingLike}
          >
            <span className={styles.icon}>{isLikedByUser ? '❤️' : '🤍'}</span>
            <span className={styles.count}>{likeCount}</span>
          </button>
          {/* Aquí irían otros botones como Comentar, etc. */}
        </div>
      </div>
    </div>
  );
}