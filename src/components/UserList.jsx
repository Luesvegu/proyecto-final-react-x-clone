// src/components/UserList.jsx

import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import styles from './UserList.module.css';

function UserCard({ profile }) {
  // Un pequeño componente para mostrar cada usuario individualmente
  return (
    <div className={styles.userCard}>
      <div className={styles.avatar}></div>
      <div className={styles.userInfo}>
        <span className={styles.fullName}>{profile.full_name}</span>
        <span className={styles.username}>@{profile.username}</span>
      </div>
      <button className={styles.followButton}>Seguir</button>
    </div>
  );
}

export default function UserList() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      try {
        // Obtenemos todos los perfiles, limitados a 10 para no sobrecargar la lista
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .limit(10);

        if (error) throw error;
        setProfiles(data);
      } catch (error) {
        console.error('Error fetching profiles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  return (
    <div className={styles.userListContainer}>
      <h3 className={styles.header}>A quién seguir</h3>
      {loading ? (
        <p>Cargando usuarios...</p>
      ) : (
        profiles.map(profile => <UserCard key={profile.id} profile={profile} />)
      )}
    </div>
  );
}