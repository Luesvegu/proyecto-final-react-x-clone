// src/pages/ProfilePage.jsx

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Layout from '../components/Layout';
import Tweet from '../components/Tweet';
import styles from './ProfilePage.module.css';
import { useAuth } from '../context/AuthContext';
import EditProfileModal from '../components/EditProfileModal';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { username } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileAndTweets = async () => {
      if (!username) return; // Evita ejecuciones innecesarias si el username no está
      setLoading(true);

      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        if (profileData) {
          const { data: tweetsData, error: tweetsError } = await supabase
            .from('tweets')
            .select('*, profiles(*), likes(*)')
            .eq('user_id', profileData.id)
            .is('reply_to_tweet_id', null)
            .order('created_at', { ascending: false });

          if (tweetsError) throw tweetsError;
          setTweets(tweetsData);
        }
      } catch (error) {
        console.error('Error fetching profile page:', error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndTweets();
  }, [username]);

  const handleProfileUpdate = (updatedProfile) => {
    setProfile(updatedProfile);
    // Si el username cambió, navegamos a la nueva URL del perfil
    if (username !== updatedProfile.username) {
        navigate(`/profile/${updatedProfile.username}`);
    }
  };

  const handleDeleteTweet = (deletedTweetId) => {
    setTweets(currentTweets => currentTweets.filter(tweet => tweet.id !== deletedTweetId));
  };

  return (
    <>
      <Layout>
        <div className={styles.container}>
          {loading ? (
            <p className={styles.loadingText}>Cargando perfil...</p>
          ) : profile ? (
            <>
              <div className={styles.profileHeader}>
                <div className={styles.avatar}></div>
                <div className={styles.profileInfo}>
                  <h2 className={styles.fullName}>{profile.full_name}</h2>
                  <p className={styles.username}>@{profile.username}</p>
                </div>
                {user && user.id === profile.id && (
                  <button onClick={() => setIsEditModalOpen(true)} className={styles.editButton}>
                    Editar Perfil
                  </button>
                )}
              </div>
              <div className={styles.tweetsContainer}>
                <h3 className={styles.tweetsTitle}>Tweets</h3>
                {tweets.length > 0 ? (
                    tweets.map(tweet => (
                        <Tweet key={tweet.id} tweet={tweet} onDelete={handleDeleteTweet} />
                    ))
                ) : (
                    <p className={styles.loadingText}>Este usuario aún no ha publicado tweets.</p>
                )}
              </div>
            </>
          ) : (
            <p className={styles.loadingText}>Este perfil no existe.</p>
          )}
        </div>
      </Layout>
      
      {profile && (
        <EditProfileModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            profile={profile}
            onProfileUpdated={handleProfileUpdate}
        />
      )}
    </>
  );
}