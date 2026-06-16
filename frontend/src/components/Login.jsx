import React, { useState } from 'react';

const Login = ({ onNavigate }) => {
  const [credenciais, setCredenciais] = useState({ email: '', senha: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Tentativa de login:', credenciais);
    // Aqui no futuro chamaremos a API de autenticação do backend
    alert('Login simulado com sucesso! Levando ao Dashboard...');
    onNavigate('sistema'); // Temporario até autenticação ser feita no back
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.logo}>SCOUT<span style={{color: '#3b82f6'}}>PRO</span></h1>
        <p style={styles.subtitle}>Faça login para acessar o painel</p>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>E-mail</label>
            <input 
              type="email" 
              style={styles.input} 
              value={credenciais.email}
              onChange={(e) => setCredenciais({...credenciais, email: e.target.value})}
              required 
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Senha</label>
            <input 
              type="password" 
              style={styles.input} 
              value={credenciais.senha}
              onChange={(e) => setCredenciais({...credenciais, senha: e.target.value})}
              required 
            />
          </div>

          <button type="submit" style={styles.buttonPrimary}>Entrar</button>
        </form>

        <div style={styles.footer}>
          <span style={styles.footerText}>Ainda não tem acesso? </span>
          <button onClick={() => onNavigate('cadastro')} style={styles.linkButton}>
            Cadastre-se aqui
          </button>
        </div>
      </div>
    </div>
  );
};

// Estilos baseados no seu Dark Theme
const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0b1120', fontFamily: 'Inter, sans-serif' },
  card: { backgroundColor: '#1e293b', padding: '40px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' },
  logo: { color: '#ffffff', textAlign: 'center', fontSize: '28px', margin: '0 0 10px 0' },
  subtitle: { color: '#94a3b8', textAlign: 'center', marginBottom: '30px', fontSize: '14px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { color: '#cbd5e1', fontSize: '14px' },
  input: { padding: '12px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', outline: 'none' },
  buttonPrimary: { padding: '14px', borderRadius: '6px', border: 'none', backgroundColor: '#3b82f6', color: '#ffffff', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
  footer: { marginTop: '25px', textAlign: 'center', fontSize: '14px' },
  footerText: { color: '#94a3b8' },
  linkButton: { background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }
};

export default Login;