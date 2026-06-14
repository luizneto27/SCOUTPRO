import React, { useState } from 'react';
import Login from './components/Login';
import CadastroUsuario from './components/CadastroUsuario';

function App() {
  // Começa sempre na tela de login
  const [telaAtual, setTelaAtual] = useState('login');

  return (
    <div>
      {telaAtual === 'login' && <Login onNavigate={setTelaAtual} />}
      {telaAtual === 'cadastro' && <CadastroUsuario onNavigate={setTelaAtual} />}
    </div>
  );
}

export default App;