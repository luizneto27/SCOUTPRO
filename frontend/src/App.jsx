import React, { useEffect, useState } from 'react';
import Login from './components/Login';
import CadastroUsuario from './components/CadastroUsuario';
import Dashboard from './components/Dashboard';

function normalizePath(pathname) {
  if (!pathname || pathname === '/') {
    return '/login';
  }

  return pathname.replace(/\/+$/, '') || '/login';
}

function App() {
  const [pathname, setPathname] = useState(normalizePath(window.location.pathname));

  useEffect(() => {
    const handlePopState = () => {
      setPathname(normalizePath(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);

    if (window.location.pathname === '/') {
      window.history.replaceState({}, '', '/login');
      setPathname('/login');
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const navigate = (to, options = {}) => {
    const normalized = normalizePath(to);

    if (options.replace) {
      window.history.replaceState({}, '', normalized);
    } else {
      window.history.pushState({}, '', normalized);
    }

    setPathname(normalized);
  };

  if (pathname === '/cadastro') {
    return <CadastroUsuario onNavigate={navigate} />;
  }

  if (pathname === '/dashboard') {
    return <Dashboard onNavigate={navigate} />;
  }

  return <Login onNavigate={navigate} />;
}

export default App;
