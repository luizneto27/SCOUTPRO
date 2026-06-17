import React, { useState } from 'react';
import { login as loginRequest } from '../lib/api';

const TOKEN_KEY = 'scoutpro.token';

const Login = ({ onNavigate }) => {
  const [credenciais, setCredenciais] = useState({ username: '', password: '' });
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    setCarregando(true);
    setErro('');

    try {
      const response = await loginRequest(credenciais.username.trim(), credenciais.password);
      window.localStorage.setItem(TOKEN_KEY, response.token);
      onNavigate('/dashboard', { replace: true });
    } catch (error) {
      setErro(error.message || 'Falha ao autenticar.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.logo}>SCOUT<span style={{ color: '#3b82f6' }}>PRO</span></h1>
        <p style={styles.subtitle}>Faça login para acessar o painel</p>
        {erro ? <p style={styles.error}>{erro}</p> : null}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              style={styles.input}
              value={credenciais.username}
              onChange={(e) => setCredenciais({ ...credenciais, username: e.target.value })}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Senha</label>
            <input
              type="password"
              style={styles.input}
              value={credenciais.password}
              onChange={(e) => setCredenciais({ ...credenciais, password: e.target.value })}
              required
            />
          </div>

          <button type="submit" style={styles.buttonPrimary} disabled={carregando}>
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div style={styles.footer}>
          <span style={styles.footerText}>Ainda não tem acesso? </span>
          <button type="button" onClick={() => onNavigate('/cadastro')} style={styles.linkButton}>
            Cadastro de usuário
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '24px',
    background: 'radial-gradient(circle at top, #172554 0%, #0b1120 50%, #020617 100%)',
    fontFamily: 'Inter, sans-serif',
  },
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    padding: '40px',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 24px 80px rgba(0, 0, 0, 0.45)',
    border: '1px solid rgba(148, 163, 184, 0.16)',
  },
  logo: { color: '#ffffff', textAlign: 'center', fontSize: '28px', margin: '0 0 10px 0' },
  subtitle: { color: '#94a3b8', textAlign: 'center', marginBottom: '18px', fontSize: '14px' },
  error: {
    color: '#fca5a5',
    backgroundColor: 'rgba(127, 29, 29, 0.35)',
    border: '1px solid rgba(248, 113, 113, 0.35)',
    padding: '12px 14px',
    borderRadius: '8px',
    marginBottom: '18px',
    fontSize: '14px',
    lineHeight: 1.5,
  },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { color: '#cbd5e1', fontSize: '14px' },
  input: {
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #334155',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    outline: 'none',
  },
  buttonPrimary: {
    padding: '14px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
  },
  footer: { marginTop: '25px', textAlign: 'center', fontSize: '14px' },
  footerText: { color: '#94a3b8' },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#3b82f6',
    cursor: 'pointer',
    fontWeight: 'bold',
    textDecoration: 'underline',
  },
};

export default Login;
