import React, { useState } from 'react';
import Login from './components/Login';
import CadastroUsuario from './components/CadastroUsuario';
import PainelPrincipal from './components/PainelPrincipal'; // Importamos a casca!

function App() {
  const [telaAtual, setTelaAtual] = useState('login');

  return (
    <div>
      {telaAtual === 'login' && <Login onNavigate={setTelaAtual} />}
      {telaAtual === 'cadastro' && <CadastroUsuario onNavigate={setTelaAtual} />}
      {/* Quando a tela for sistema, chamamos o Painel */}
      {telaAtual === 'sistema' && <PainelPrincipal onLogout={setTelaAtual} />}
    </div>
  );
}

export default App;