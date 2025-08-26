// src/App.jsx

import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import TweetDetailPage from './pages/TweetDetailPage';
import ProfilePage from './pages/ProfilePage'; // ¡1. Importar la nueva página!

function App() {
  const { session } = useAuth();

  if (!session) {
    return <LoginPage />;
  }
  
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/tweet/:id" element={<TweetDetailPage />} />
      {/* --- 2. AÑADIR LA NUEVA RUTA DINÁMICA --- */}
      {/* El ':' indica que 'username' es un parámetro que puede cambiar */}
      <Route path="/profile/:username" element={<ProfilePage />} />
    </Routes>
  );
}

export default App;