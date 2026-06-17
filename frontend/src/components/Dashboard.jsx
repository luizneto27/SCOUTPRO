import React, { useEffect, useState } from 'react';
import { getCurrentUser } from '../lib/api';

const TOKEN_KEY = 'scoutpro.token';

const Dashboard = ({ onNavigate }) => {
  const [usuario, setUsuario] = useState(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const token = window.localStorage.getItem(TOKEN_KEY);

    if (!token) {
      onNavigate('/login', { replace: true });
      return;
    }

    let ativo = true;

    const carregarUsuario = async () => {
      try {
        const data = await getCurrentUser(token);
        if (ativo) {
          setUsuario(data);
        }
      } catch (error) {
        window.localStorage.removeItem(TOKEN_KEY);
        if (ativo) {
          setErro(error.message || 'Sessão inválida. Faça login novamente.');
          onNavigate('/login', { replace: true });
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    };

    carregarUsuario();

    return () => {
      ativo = false;
    };
  }, [onNavigate]);

  const sair = () => {
    window.localStorage.removeItem(TOKEN_KEY);
    onNavigate('/login', { replace: true });
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <p style={styles.kicker}>Sessão autenticada</p>
        <h1 style={styles.title}>Dashboard ScoutPro</h1>
        <p style={styles.subtitle}>
          {carregando && 'Carregando dados do usuário...'}
          {!carregando && usuario && `Autenticado como ${usuario.username}.`}
          {!carregando && erro && erro}
        </p>

        <div style={styles.actions}>
          <button type="button" onClick={() => onNavigate('/cadastro')} style={styles.buttonPrimary}>
            Novo usuário
          </button>
          <button type="button" onClick={sair} style={styles.buttonSecondary}>
            Sair
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    background: 'radial-gradient(circle at top, #172554 0%, #0b1120 50%, #020617 100%)',
    color: '#e2e8f0',
    fontFamily: 'Inter, sans-serif',
  },
  card: {
    width: '100%',
    maxWidth: '560px',
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    border: '1px solid rgba(148, 163, 184, 0.18)',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 24px 80px rgba(0, 0, 0, 0.45)',
  },
  kicker: {
    color: '#60a5fa',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.16em',
    marginBottom: '12px',
  },
  title: {
    fontSize: '32px',
    marginBottom: '12px',
  },
  subtitle: {
    color: '#94a3b8',
    lineHeight: 1.6,
  },
  actions: {
    marginTop: '28px',
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  buttonPrimary: {
    padding: '12px 18px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    cursor: 'pointer',
    fontWeight: 700,
  },
  buttonSecondary: {
    padding: '12px 18px',
    borderRadius: '10px',
    border: '1px solid rgba(148, 163, 184, 0.25)',
    backgroundColor: 'transparent',
    color: '#e2e8f0',
    cursor: 'pointer',
    fontWeight: 700,
  },
};

export default Dashboard;
