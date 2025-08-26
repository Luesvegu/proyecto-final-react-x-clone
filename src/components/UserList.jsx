// src/components/UserList.jsx

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // 1. Importar Link
import { supabase } from '../supabaseClient';
import styles from './UserList.module.css';
import { useAuth } from '../context/AuthContext'; // Importamos useAuth para no mostrarnos a nosotros mismos

function UserCard({ profile }) {
  // 2. Envolvemos todo el div en un componente Link
  return (
    <Link to={`/profile/${profile.username}`} className={styles.userCardLink}>
      <div className={styles.userCard}>
        <img src={profile.avatar_url} alt={profile.full_name} className={styles.avatar} />
        <div className={styles.userInfo}>
          <span className={styles.fullName}>{profile.full_name}</span>
          <span className={styles.username}>@{profile.username}</span>
        </div>
        <button className={styles.followButton}>Seguir</button>
      </div>
    </Link>
  );
}

export default function UserList() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); // Obtenemos el usuario actual

  useEffect(() => {
    const fetchProfiles = async () => {
      if (!user) return; // Si no hay usuario, no hacemos nada
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .not('id', 'eq', user.id) // 3. Excluimos nuestro propio perfil de la lista
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
  }, [user]);

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