import React, { useState } from 'react';
import { createUser } from '../lib/api';

const CadastroUsuario = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    username: '',
    nomeUsuario: '',
    cpf: '',
    email: '',
    telefone: '',
    senha: '',
  });
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    setCarregando(true);
    setErro('');
    setSucesso('');

    try {
      await createUser({
        username: formData.username.trim(),
        nomeUsuario: formData.nomeUsuario.trim(),
        cpf: formData.cpf.trim(),
        email: formData.email.trim(),
        telefone: formData.telefone.trim() || null,
        senha: formData.senha,
      });

      setSucesso('Conta criada com sucesso. Redirecionando para o login...');
      window.setTimeout(() => onNavigate('/login', { replace: true }), 1200);
    } catch (error) {
      setErro(error.message || 'Não foi possível criar o usuário.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Criar Conta</h2>
        <p style={styles.subtitle}>Cadastro restrito a usuários ADMIN autenticados</p>
        {erro ? <p style={styles.error}>{erro}</p> : null}
        {sucesso ? <p style={styles.success}>{sucesso}</p> : null}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              style={styles.input}
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Nome completo</label>
            <input
              type="text"
              style={styles.input}
              value={formData.nomeUsuario}
              onChange={(e) => setFormData({ ...formData, nomeUsuario: e.target.value })}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>CPF</label>
            <input
              type="text"
              style={styles.input}
              placeholder="00000000000 ou 000.000.000-00"
              value={formData.cpf}
              onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>E-mail</label>
            <input
              type="email"
              style={styles.input}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Telefone</label>
            <input
              type="tel"
              style={styles.input}
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Senha</label>
            <input
              type="password"
              style={styles.input}
              value={formData.senha}
              onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
              required
            />
          </div>

          <button type="submit" style={styles.buttonPrimary} disabled={carregando}>
            {carregando ? 'Criando conta...' : 'Finalizar Cadastro'}
          </button>
        </form>

        <div style={styles.footer}>
          <button type="button" onClick={() => onNavigate('/login')} style={styles.linkButton}>
            Voltar para o Login
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
    maxWidth: '480px',
    boxShadow: '0 24px 80px rgba(0, 0, 0, 0.45)',
    border: '1px solid rgba(148, 163, 184, 0.16)',
  },
  title: { color: '#ffffff', textAlign: 'center', fontSize: '24px', margin: '0 0 5px 0' },
  subtitle: { color: '#94a3b8', textAlign: 'center', marginBottom: '18px', fontSize: '14px' },
  error: {
    color: '#fca5a5',
    backgroundColor: 'rgba(127, 29, 29, 0.35)',
    border: '1px solid rgba(248, 113, 113, 0.35)',
    padding: '12px 14px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
    lineHeight: 1.5,
  },
  success: {
    color: '#bbf7d0',
    backgroundColor: 'rgba(6, 78, 59, 0.35)',
    border: '1px solid rgba(74, 222, 128, 0.35)',
    padding: '12px 14px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
    lineHeight: 1.5,
  },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
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
    backgroundColor: '#10b981',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
  },
  footer: { marginTop: '20px', textAlign: 'center' },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
};

export default CadastroUsuario;
