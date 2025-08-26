// src/components/ReplyModal.jsx

import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import styles from './ReplyModal.module.css';
import Tweet from './Tweet';

export default function ReplyModal({ isOpen, onClose, tweetToReplyTo, onReplySuccess }) {
  // --- LÍNEA CORREGIDA ---
  const [content, setContent] = useState(''); // Solo un signo de igual
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('tweets')
        .insert([{
          content,
          user_id: user.id,
          reply_to_tweet_id: tweetToReplyTo.id
        }]);

      if (error) throw error;
      
      onReplySuccess();
      setContent('');
    } catch (error) {
      console.error('Error creating reply:', error);
      alert('No se pudo publicar la respuesta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        
        <Tweet tweet={tweetToReplyTo} onDelete={() => {}} /> {/* Pasamos una función vacía a onDelete */}
        <p className={styles.replyingTo}>Respondiendo a <span className={styles.username}>@{tweetToReplyTo.profiles.username}</span></p>

        <form onSubmit={handleSubmit} className={styles.replyForm}>
          <textarea
            className={styles.textarea}
            placeholder="Publica tu respuesta"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength="280"
          />
          <div className={styles.footer}>
            <button type="submit" disabled={loading || !content.trim()}>
              {loading ? 'Respondiendo...' : 'Responder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}