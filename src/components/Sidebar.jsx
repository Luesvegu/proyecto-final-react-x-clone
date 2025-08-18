// src/components/Sidebar.jsx
import styles from './Sidebar.module.css';
import UserList from './UserList'; // Importamos el nuevo componente

export default function Sidebar() {
  return (
    <div className={styles.sidebar}>
      <UserList />
      {/* Puedes añadir más widgets aquí en el futuro */}
    </div>
  );
}