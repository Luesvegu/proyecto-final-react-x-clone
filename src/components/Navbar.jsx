// src/components/Navbar.jsx
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { signOut } = useAuth();
  return (
    <nav className={styles.navbar}>
      <ul>
        <li>Logo X</li>
        <li>Inicio</li>
        <li>Explorar</li>
        <li>Perfil</li>
      </ul>
      <button onClick={signOut}>Cerrar Sesión</button>
    </nav>
  );
}