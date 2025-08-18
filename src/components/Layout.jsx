// src/components/Layout.jsx
import styles from './Layout.module.css';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div className={styles.layout}>
      <header className={styles.navbar}>
        <Navbar />
      </header>
      <main className={styles.mainContent}>
        {children}
      </main>
      <aside className={styles.sidebar}>
        <Sidebar />
      </aside>
    </div>
  );
}