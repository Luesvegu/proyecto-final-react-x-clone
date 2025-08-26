import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Tweet.module.css';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import ReplyModal from './ReplyModal';

function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleString('es-ES', options);
}

export default function Tweet({ tweet, onDelete }) {
  // Guarda para evitar errores si el tweet o su autor no están definidos
  if (!tweet || !tweet.profiles) {
    return null;
  }

  const { user } = useAuth();
  const author = tweet.profiles;
  const navigate = useNavigate();

  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [likeCount, setLikeCount] = useState(tweet.likes.length);
  const [isLikedByUser, setIsLikedByUser] = useState(false);
  const [loadingLike, setLoadingLike] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(true);

  // --- NAVEGACIÓN ---
  const handleNavigate = (e) => {
    // Si el clic fue en un botón, enlace o el área de acciones, no navegamos
    if (e.target.closest('button, a')) {
      return;
    }
    navigate(`/tweet/${tweet.id}`);
  };

  // --- LÓGICA DE ACCIONES ---
  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este tweet?')) {
      try {
        const { error } = await supabase.from('tweets').delete().match({ id: tweet.id });
        if (error) throw error;
        onDelete(tweet.id);
      } catch (error) {
        console.error('Error deleting tweet:', error);
        alert('No se pudo eliminar el tweet.');
      }
    }
  };

  useEffect(() => {
    const checkIfFollowing = async () => {
      if (!user || user.id === author.id) {
        setLoadingFollow(false);
        return;
      }
      try {
        const { data, error } = await supabase.from('followers').select('*').eq('follower_id', user.id).eq('following_id', author.id).single();
        if (error && error.code !== 'PGRST116') throw error;
        setIsFollowing(!!data);
      } catch (error) {
        console.error('Error checking follow status:', error);
      } finally {
        setLoadingFollow(false);
      }
    };
    checkIfFollowing();
  }, [user, author.id]);

  const handleFollow = async () => {
    if (loadingFollow) return;
    setLoadingFollow(true);
    try {
      if (isFollowing) {
        const { error } = await supabase.from('followers').delete().match({ follower_id: user.id, following_id: author.id });
        if (error) throw error;
        setIsFollowing(false);
      } else {
        const { error } = await supabase.from('followers').insert({ follower_id: user.id, following_id: author.id });
        if (error) throw error;
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error handling follow:', error);
    } finally {
      setLoadingFollow(false);
    }
  };

  useEffect(() => {
    if (user && tweet.likes) {
      const userHasLiked = tweet.likes.some(like => like.user_id === user.id);
      setIsLikedByUser(userHasLiked);
    }
  }, [tweet.likes, user]);

  const handleLike = async () => {
    if (!user || loadingLike) return;
    setLoadingLike(true);
    try {
      if (isLikedByUser) {
        setIsLikedByUser(false); setLikeCount(prev => prev - 1);
        const { error } = await supabase.from('likes').delete().match({ user_id: user.id, tweet_id: tweet.id });
        if (error) { setIsLikedByUser(true); setLikeCount(prev => prev + 1); throw error; }
      } else {
        setIsLikedByUser(true); setLikeCount(prev => prev + 1);
        const { error } = await supabase.from('likes').insert({ user_id: user.id, tweet_id: tweet.id });
        if (error) { setIsLikedByUser(false); setLikeCount(prev => prev - 1); throw error; }
      }
    } catch (error) {
      console.error('Error handling like:', error.message);
    } finally {
      setLoadingLike(false);
    }
  };
  
  return (
    <>
      <div className={styles.tweetContainer} onClick={handleNavigate}>
        <div className={styles.avatar}></div>
        <div className={styles.tweetContent}>
          <div className={styles.header}>
            <div className={styles.authorInfo}>
              <Link
                to={`/profile/${author.username}`}
                className={styles.authorLink}
                onClick={(e) => e.stopPropagation()} // Detiene la navegación del div padre
              >
                <span className={styles.fullName}>{author.full_name || 'Usuario'}</span>
                <span className={styles.username}>@{author.username || 'username'}</span>
              </Link>
              <span className={styles.dot}>·</span>
              <span className={styles.timestamp}>{formatDate(tweet.created_at)}</span>
            </div>
            <div className={styles.headerActions}>
              {user && user.id !== author.id && (
                <button onClick={handleFollow} disabled={loadingFollow} className={`${styles.followButton} ${isFollowing ? styles.following : ''}`}>
                  {loadingFollow ? '...' : (isFollowing ? 'Siguiendo' : 'Seguir')}
                </button>
              )}
              {user && user.id === author.id && (
                <button onClick={handleDelete} className={styles.deleteButton}>
                  🗑️
                </button>
              )}
            </div>
          </div>
          <p className={styles.content}>{tweet.content}</p>
          <div className={styles.actions}>
            <button className={styles.actionButton} onClick={() => setIsReplyModalOpen(true)}>
              <span className={styles.icon}>💬</span>
            </button>
            <button onClick={handleLike} className={`${styles.likeButton} ${isLikedByUser ? styles.liked : ''}`} disabled={loadingLike}>
              <span className={styles.icon}>{isLikedByUser ? '❤️' : '🤍'}</span>
              <span className={styles.count}>{likeCount}</span>
            </button>
          </div>
        </div>
      </div>

      <ReplyModal
        isOpen={isReplyModalOpen}
        onClose={() => setIsReplyModalOpen(false)}
        tweetToReplyTo={tweet}
        onReplySuccess={() => {
          setIsReplyModalOpen(false);
          alert("Respuesta publicada con éxito.");
        }}
      />
    </>
  );
}