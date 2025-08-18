// src/App.jsx

import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';

function App() {
  const { session } = useAuth();

  return (
    <div className="container">
      {/* Si no hay sesión, muestra siempre la página de Login */}
      {/* Si hay sesión, muestra la página principal */}
      {!session ? <LoginPage /> : <HomePage />}
    </div>
  );
}

export default App;