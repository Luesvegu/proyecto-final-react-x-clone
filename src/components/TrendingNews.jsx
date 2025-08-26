// src/components/TrendingNews.jsx

import { useEffect, useState } from 'react';
import styles from './TrendingNews.module.css';

function NewsArticle({ article }) {
  return (
    <a href={article.url} target="_blank" rel="noopener noreferrer" className={styles.articleLink}>
      <div className={styles.article}>
        <span className={styles.source}>{article.source.name}</span>
        <h4 className={styles.title}>{article.title}</h4>
      </div>
    </a>
  );
}

export default function TrendingNews() {
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState(null); // Nuevo estado para manejar errores
  const [loading, setLoading] = useState(true);
  const apiKey = import.meta.env.VITE_NEWS_API_KEY;

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null); // Reseteamos el error

      // Para el plan gratuito de NewsAPI en modo desarrollo (localhost), a veces se requiere este proxy.
      const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
      const apiUrl = `https://newsapi.org/v2/top-headlines?country=co&apiKey=${apiKey}`;

      try {
        // Usamos una URL de proxy para evitar problemas de CORS en localhost
        const response = await fetch(proxyUrl + apiUrl);
        const data = await response.json();
        
        console.log("News API Response:", data); // Log para ver la respuesta completa

        if (data.status === "ok") {
          setArticles(data.articles.slice(0, 5));
        } else {
          // Si la API devuelve un error, lo guardamos para mostrarlo
          throw new Error(data.message || "Error al obtener noticias.");
        }
      } catch (err) {
        console.error("Failed to fetch news from API:", err);
        setError(err.message); // Guardamos el mensaje de error
      } finally {
        setLoading(false);
      }
    };

    if (apiKey) {
      fetchNews();
    } else {
      const msg = "La clave de NewsAPI (VITE_NEWS_API_KEY) no se encontró en .env.local";
      console.error(msg);
      setError(msg);
      setLoading(false);
    }
  }, [apiKey]);

  return (
    <div className={styles.newsContainer}>
      <h3 className={styles.header}>Tendencias</h3>
      {loading && <p>Cargando noticias...</p>}
      
      {/* Mostramos el mensaje de error si existe */}
      {error && <p className={styles.errorText}>{error}</p>}
      
      {!loading && !error && articles.length > 0 && (
        articles.map((article, index) => <NewsArticle key={index} article={article} />)
      )}

      {!loading && !error && articles.length === 0 && (
        <p>No se encontraron noticias.</p>
      )}
    </div>
  );
}