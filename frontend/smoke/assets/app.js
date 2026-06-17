// Minimal shared frontend JS for ScoutPro smoke pages
(function(){
  // Base URL for API (host omitted -> same origin). Override if needed.
  const DEFAULT_BASE = window.__SCOUTPRO_BASE__ || '';
  const BASE_URL = DEFAULT_BASE || (window.location.origin);

  function apiPath(p){
    if (p.startsWith('/')) return BASE_URL + '/api/v1' + p;
    return BASE_URL + '/api/v1/' + p;
  }

  window.getToken = function(){ return localStorage.getItem('scoutpro_token') || '' };

  window.setToken = function(t){ if (t) localStorage.setItem('scoutpro_token', t); else localStorage.removeItem('scoutpro_token'); };

  window.apiFetch = function(path, opts={}){
    const url = path.startsWith('/api') || path.startsWith('/api/v1') ? (BASE_URL + path) : apiPath(path);
    const headers = new Headers(opts.headers || {});
    headers.set('Accept','application/json');
    if (!headers.get('Content-Type') && opts.body) headers.set('Content-Type','application/json');
    const token = getToken();
    if (token) headers.set('Authorization','Bearer ' + token);
    return fetch(url, Object.assign({}, opts, { headers }));
  };

  // expose small helpers
  window.SCOUTPRO = { BASE_URL, apiPath };
})();
