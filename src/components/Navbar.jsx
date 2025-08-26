// src/components/Navbar.jsx

import { Link } from 'react-router-dom'; // 1. Importar Link
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { signOut, user } = useAuth();

  const handleSignOut = () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      signOut();
    }
  };

  return (
    <nav className={styles.navbar}>
      <ul className={styles.navList}>
        {/* --- 2. ENVOLVEMOS EL ELEMENTO "INICIO" EN UN LINK --- */}
        <Link to="/" className={styles.navLink}>
          <li className={styles.navItem}>
            <span className={styles.navIcon}>🏠</span>
            <span className={styles.navText}>Inicio</span>
          </li>
        </Link>
        <li className={styles.navItem}>
          <span className={styles.navIcon}>#️⃣</span>
          <span className={styles.navText}>Explorar</span>
        </li>
        <li className={`${styles.navItem} ${styles.profileMobile}`} onClick={handleSignOut}>
          <span className={styles.navIcon}>👤</span>
          <span className={styles.navText}>Salir</span>
        </li>
      </ul>
      <div className={styles.profileDesktop}>
        <div className={styles.userInfo}>
          <span className={styles.userName}>Usuario</span>
          <span className={styles.userHandle}>@{user?.email.split('@')[0]}</span>
        </div>
        <button onClick={handleSignOut} className={styles.signOutButton}>
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
}