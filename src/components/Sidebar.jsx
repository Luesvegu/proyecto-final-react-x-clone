// src/components/Sidebar.jsx
import styles from './Sidebar.module.css';

export default function Sidebar() {
  return (
    <div className={styles.sidebar}>
      <div className={styles.widget}>
        <h3>Buscar</h3>
        <p>Buscador (próximamente)</p>
      </div>
      <div className={styles.widget}>
        <h3>Tendencias</h3>
        <p>Tendencias (próximamente)</p>
      </div>
    </div>
  );
}