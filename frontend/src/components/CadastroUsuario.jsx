import React, { useState } from 'react';

const CadastroUsuario = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    perfil: 'CLIENTE', // Baseado nos requisitos do projeto (Cliente, Clube, Empresário)
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Novo usuário registrado:', formData);
    alert('Conta criada com sucesso! Redirecionando para o login...');
    onNavigate('login');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Criar Conta</h2>
        <p style={styles.subtitle}>Junte-se ao SCOUTPRO</p>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nome Completo</label>
            <input 
              type="text" 
              style={styles.input} 
              value={formData.nome}
              onChange={(e) => setFormData({...formData, nome: e.target.value})}
              required 
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Tipo de Perfil</label>
            <select 
              style={styles.input} 
              value={formData.perfil}
              onChange={(e) => setFormData({...formData, perfil: e.target.value})}
            >
              <option value="CLIENTE">Cliente / Analista</option>
              <option value="CLUBE">Representante de Clube</option>
              <option value="EMPRESARIO">Empresário de Atletas</option>
            </select>
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>E-mail Profissional</label>
            <input 
              type="email" 
              style={styles.input} 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required 
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Senha</label>
            <input 
              type="password" 
              style={styles.input} 
              value={formData.senha}
              onChange={(e) => setFormData({...formData, senha: e.target.value})}
              required 
            />
          </div>

          <button type="submit" style={styles.buttonPrimary}>Finalizar Cadastro</button>
        </form>

        <div style={styles.footer}>
          <button onClick={() => onNavigate('login')} style={styles.linkButton}>
            Voltar para o Login
          </button>
        </div>
      </div>
    </div>
  );
};

// Reutilizando a mesma identidade visual
const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#0b1120', fontFamily: 'Inter, sans-serif' },
  card: { backgroundColor: '#1e293b', padding: '40px', borderRadius: '12px', width: '100%', maxWidth: '450px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' },
  title: { color: '#ffffff', textAlign: 'center', fontSize: '24px', margin: '0 0 5px 0' },
  subtitle: { color: '#94a3b8', textAlign: 'center', marginBottom: '25px', fontSize: '14px' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { color: '#cbd5e1', fontSize: '14px' },
  input: { padding: '12px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', outline: 'none' },
  buttonPrimary: { padding: '14px', borderRadius: '6px', border: 'none', backgroundColor: '#10b981', color: '#ffffff', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
  footer: { marginTop: '20px', textAlign: 'center' },
  linkButton: { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textDecoration: 'underline' }
};

export default CadastroUsuario;