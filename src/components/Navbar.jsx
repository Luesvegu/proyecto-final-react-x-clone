// src/components/Navbar.jsx
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { signOut, user } = useAuth(); // Importamos signOut y user

  // Creamos un manejador para el cierre de sesión que pregunte antes de salir
  const handleSignOut = () => {
    // Es una buena práctica preguntar al usuario si realmente quiere salir
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      signOut();
    }
  };

  return (
    <nav className={styles.navbar}>
      <ul className={styles.navList}>
        <li className={styles.navItem}>
          <span className={styles.navIcon}>🏠</span>
          <span className={styles.navText}>Inicio</span>
        </li>
        <li className={styles.navItem}>
          <span className={styles.navIcon}>#️⃣</span>
          <span className={styles.navText}>Explorar</span>
        </li>

        {/* --- NUEVO ELEMENTO DE PERFIL / CERRAR SESIÓN --- */}
        {/* Este elemento se mostrará solo en móvil y funcionará para cerrar sesión */}
        <li className={`${styles.navItem} ${styles.profileMobile}`} onClick={handleSignOut}>
          <span className={styles.navIcon}>👤</span>
          <span className={styles.navText}>Salir</span>
        </li>
      </ul>

      {/* --- BOTÓN DE CERRAR SESIÓN PARA ESCRITORIO --- */}
      {/* Este botón se ocultará en la vista móvil */}
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