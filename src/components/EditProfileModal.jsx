// src/components/EditProfileModal.jsx

import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import styles from './ReplyModal.module.css'; // Reutilizaremos los estilos del otro modal

export default function EditProfileModal({ isOpen, onClose, profile, onProfileUpdated }) {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  // Cuando el modal se abre, llenamos el formulario con los datos actuales del perfil
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setUsername(profile.username || '');
    }
  }, [profile]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          username: username,
          updated_at: new Date() // Actualizamos la fecha de modificación
        })
        .eq('id', profile.id) // Aseguramos que solo actualizamos el perfil correcto
        .select()
        .single();
      
      if (error) throw error;

      onProfileUpdated(data); // Devolvemos el perfil actualizado para refrescar la UI
      onClose();

    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error al actualizar el perfil. El nombre de usuario ya podría estar en uso.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        <h2>Editar Perfil</h2>
        <form onSubmit={handleSubmit} className={styles.replyForm}>
          <label htmlFor="fullName">Nombre Completo</label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={styles.inputField}
          />

          <label htmlFor="username">Nombre de Usuario</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={styles.inputField}
          />

          <div className={styles.footer}>
            <button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}