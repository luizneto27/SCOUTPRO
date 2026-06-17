import React, { useEffect, useState } from 'react';
import { LayoutDashboard, Users, Activity, FileText, GitCompare, LogOut, Settings, BarChart2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import GestaoAtletas from './GestaoAtletas';
import RegistroLesoes from './RegistroLesoes';
import EstatisticasPartida from './EstatisticasPartida';
import ClubesContratos from './ClubesContratos';
import ComparativoAtletas from './ComparativoAtletas';
import { getCurrentUser, listCampeonatos, listClubes, listJogadores } from '../lib/api';


// --- DADOS FALSOS (MOCKS) ---
const dadosPerformance = [
  { dia: '01/05', performance: 60 },
  { dia: '02/05', performance: 35 },
  { dia: '03/05', performance: 55 },
  { dia: '04/05', performance: 68 },
  { dia: '05/05', performance: 52 },
  { dia: '06/05', performance: 48 },
  { dia: '07/05', performance: 72 },
];

const dadosCarga = [
  { name: 'Alta', value: 45 },
  { name: 'Moderada', value: 35 },
  { name: 'Baixa', value: 20 },
];
const CORES = ['#3b82f6', '#06b6d4', '#8b5cf6'];

const atletasDestaque = [
  { nome: 'João Silva', posicao: 'Meia', performance: 92, carga: 'Alta', status: 'Excelente', corStatus: '#10b981' },
  { nome: 'Pedro Santos', posicao: 'Atacante', performance: 87, carga: 'Moderada', status: 'Bom', corStatus: '#3b82f6' },
  { nome: 'Lucas Pereira', posicao: 'Zagueiro', performance: 78, carga: 'Moderada', status: 'Atenção', corStatus: '#f59e0b' },
  { nome: 'Gabriel Costa', posicao: 'Goleiro', performance: 95, carga: 'Alta', status: 'Excelente', corStatus: '#10b981' },
];

const alertasRecentes = [
  { id: 1, tipo: 'Carga excessiva detectada', atleta: 'João Silva', tempo: 'há 2h', cor: '#ef4444' },
  { id: 2, tipo: 'Queda de performance', atleta: 'Lucas Pereira', tempo: 'há 4h', cor: '#f59e0b' },
  { id: 3, tipo: 'Recuperação otimizada', atleta: 'Pedro Santos', tempo: 'há 6h', cor: '#3b82f6' },
];

const TOKEN_KEY = 'scoutpro.token';

// --- COMPONENTE PRINCIPAL ---
const PainelPrincipal = ({ onLogout }) => {
  const [menuAtivo, setMenuAtivo] = useState('dashboard');
  const [usuario, setUsuario] = useState(null);
  const [resumo, setResumo] = useState({
    atletas: 0,
    clubes: 0,
    campeonatos: 0,
  });

  useEffect(() => {
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (!token) {
      onLogout();
      return;
    }

    let ativo = true;

    const carregar = async () => {
      try {
        const [user, jogadoresPage, clubes, campeonatosPage] = await Promise.all([
          getCurrentUser(token),
          listJogadores(token, { size: 1 }),
          listClubes(token),
          listCampeonatos(token, { size: 1 }),
        ]);

        if (!ativo) {
          return;
        }

        setUsuario(user);
        setResumo({
          atletas: jogadoresPage?.totalElements ?? jogadoresPage?.content?.length ?? 0,
          clubes: Array.isArray(clubes) ? clubes.length : 0,
          campeonatos: campeonatosPage?.totalElements ?? campeonatosPage?.content?.length ?? 0,
        });
      } catch (error) {
        window.localStorage.removeItem(TOKEN_KEY);
        if (ativo) {
          onLogout();
        }
      }
    };

    carregar();

    return () => {
      ativo = false;
    };
  }, [onLogout]);

  return (
    <div style={styles.container}>
      {/* MENU LATERAL */}
      <aside style={styles.sidebar}>
        <div style={styles.logoContainer}>
          <h1 style={styles.logo}>SCOUT<span style={{ color: '#3b82f6' }}>PRO</span></h1>
        </div>

        <nav style={styles.nav}>
          <button style={menuAtivo === 'dashboard' ? styles.navItemAtivo : styles.navItem} onClick={() => setMenuAtivo('dashboard')}>
            <LayoutDashboard size={20} /> Dashboard
          </button>
          
          <button style={menuAtivo === 'atletas' ? styles.navItemAtivo : styles.navItem} onClick={() => setMenuAtivo('atletas')}>
            <Users size={20} /> Gestão de Atletas
          </button>
          
          <button style={menuAtivo === 'lesoes' ? styles.navItemAtivo : styles.navItem} onClick={() => setMenuAtivo('lesoes')}>
            <Activity size={20} /> Saúde e Lesões
          </button>
          
          <button style={menuAtivo === 'estatisticas' ? styles.navItemAtivo : styles.navItem} onClick={() => setMenuAtivo('estatisticas')}>
            <BarChart2 size={20} /> Estatísticas & Partidas
          </button>

          <button style={menuAtivo === 'comparativo' ? styles.navItemAtivo : styles.navItem} onClick={() => setMenuAtivo('comparativo')}>
            <GitCompare size={20} /> Dashboard Comparativo
          </button>

          <button style={menuAtivo === 'contratos' ? styles.navItemAtivo : styles.navItem} onClick={() => setMenuAtivo('contratos')}>
            <FileText size={20} /> Clubes e Contratos
          </button>

          <button style={menuAtivo === 'configuracoes' ? styles.navItemAtivo : styles.navItem} onClick={() => setMenuAtivo('configuracoes')}>
            <Settings size={20} /> Configurações
          </button>
        </nav>

        <button onClick={onLogout} style={styles.logoutButton}>
          <LogOut size={20} /> Sair
        </button>
      </aside>

      {/* ÁREA DE CONTEÚDO DINÂMICO */}
      <main style={styles.content}>
        <header style={styles.header}>
          <h2 style={styles.pageTitle}>
            {/* Muda o título da página baseado no menu ativo */}
            {menuAtivo === 'dashboard' && 'Dashboard'}
            {menuAtivo === 'lesoes' && 'Departamento Médico'}
            {menuAtivo === 'atletas' && 'Gestão de Atletas'}
            {menuAtivo === 'estatisticas' && 'Estatísticas'}
            {menuAtivo === 'comparativo' && 'Comparativo de Atletas'}
            {menuAtivo === 'contratos' && 'Contratos'}
            {menuAtivo === 'configuracoes' && 'Configurações'}
          </h2>
          <div style={styles.userProfile}>
            <div style={styles.avatar}>A</div>
            <span style={{ color: '#fff' }}>{usuario?.username || 'Admin'}</span>
          </div>
        </header>

        {menuAtivo === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* LINHA 1: Cards Superiores */}
            <div style={styles.cardsGrid}>
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <Users size={20} color="#3b82f6" />
                  <span style={styles.cardTitle}>Atletas Ativos</span>
                </div>
                <h3 style={styles.cardValue}>{resumo.atletas}</h3>
                <span style={styles.cardTrend}>+12% vs período anterior</span>
              </div>
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <FileText size={20} color="#06b6d4" />
                  <span style={styles.cardTitle}>Campeonatos</span>
                </div>
                <h3 style={styles.cardValue}>{resumo.campeonatos}</h3>
                <span style={styles.cardTrend}>Dados do endpoint /campeonatos</span>
              </div>
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <Activity size={20} color="#8b5cf6" />
                  <span style={styles.cardTitle}>Clubes</span>
                </div>
                <h3 style={styles.cardValue}>{resumo.clubes}</h3>
                <span style={styles.cardTrend}>Dados do endpoint /clubes</span>
              </div>
            </div>

            {/* LINHA 2: Gráficos */}
            <div style={styles.chartsRow}>
              {/* Gráfico de Linha */}
              <div style={{ ...styles.card, flex: 2 }}>
                <div style={styles.cardHeaderBetween}>
                  <span style={styles.sectionTitle}>Performance Média</span>
                  <select style={styles.select}>
                    <option>Últimos 7 dias</option>
                  </select>
                </div>
                <div style={{ height: '250px', width: '100%', marginTop: '15px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dadosPerformance}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="dia" stroke="#94a3b8" axisLine={false} tickLine={false} />
                      <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
                      <Line type="monotone" dataKey="performance" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Gráfico de Rosca */}
              <div style={{ ...styles.card, flex: 1 }}>
                <span style={styles.sectionTitle}>Carga de Treino</span>
                <div style={{ height: '250px', width: '100%', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={dadosCarga} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                        {dadosCarga.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={styles.donutCenterText}>
                    <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>832</span>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>Carga total</span>
                  </div>
                </div>
              </div>
            </div>

            {/* LINHA 3: Tabelas e Alertas */}
            <div style={styles.tablesRow}>
              {/* Tabela de Atletas */}
              <div style={{ ...styles.card, flex: 2 }}>
                <span style={styles.sectionTitle}>Atletas em Destaque</span>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeader}>
                      <th style={styles.th}>Atleta</th>
                      <th style={styles.th}>Posição</th>
                      <th style={styles.th}>Performance</th>
                      <th style={styles.th}>Carga de Treino</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {atletasDestaque.map((atleta, index) => (
                      <tr key={index} style={styles.tableRow}>
                        <td style={styles.tdBold}>{atleta.nome}</td>
                        <td style={styles.td}>{atleta.posicao}</td>
                        <td style={styles.tdBold}>{atleta.performance}</td>
                        <td style={styles.td}>{atleta.carga}</td>
                        <td style={styles.td}>
                          <span style={{ color: atleta.corStatus, border: `1px solid ${atleta.corStatus}40`, padding: '4px 8px', borderRadius: '12px', fontSize: '12px' }}>
                            {atleta.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Lista de Alertas */}
              <div style={{ ...styles.card, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <span style={styles.sectionTitle}>Alertas Recentes</span>
                <div style={styles.alertsContainer}>
                  {alertasRecentes.map((alerta) => (
                    <div key={alerta.id} style={styles.alertItem}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: alerta.cor, marginTop: '6px' }}></div>
                      <div>
                        <div style={{ color: '#fff', fontSize: '14px' }}>{alerta.tipo}</div>
                        <div style={{ color: '#94a3b8', fontSize: '12px' }}>{alerta.atleta} • {alerta.tempo}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <button style={styles.verTodosBtn}>Ver todos os alertas</button>
              </div>
            </div>

          </div>
        )}

        {/* --- TELAS PLUGADAS AQUI --- */}
        {menuAtivo === 'atletas' && <GestaoAtletas onSessionExpired={onLogout} />}
        
        {menuAtivo === 'lesoes' && <RegistroLesoes />}

        {menuAtivo === 'estatisticas' && <EstatisticasPartida />}
        
        {menuAtivo === 'comparativo' && <ComparativoAtletas />}

        {menuAtivo === 'contratos' && <ClubesContratos onSessionExpired={onLogout} />}      

        {/* OUTROS MENUS EM DESENVOLVIMENTO */}
        {menuAtivo !== 'dashboard' && menuAtivo !== 'atletas'&& menuAtivo !== 'comparativo' && menuAtivo !== 'lesoes' && menuAtivo !== 'estatisticas' && menuAtivo !== 'contratos' && (
          <div style={styles.placeholder}>
            <h3 style={{ color: '#94a3b8' }}>Tela de {menuAtivo} em desenvolvimento...</h3>
          </div>
        )}  
      </main>
    </div>
  );
};

// --- ESTILOS ---
const styles = {
  container: { display: 'flex', height: '100vh', backgroundColor: '#0b1120', fontFamily: 'Inter, sans-serif' },
  sidebar: { width: '260px', backgroundColor: '#0f172a', display: 'flex', flexDirection: 'column', padding: '20px', borderRight: '1px solid #1e293b' },
  logoContainer: { marginBottom: '40px' },
  logo: { color: '#ffffff', fontSize: '24px', margin: 0 },
  nav: { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 },
  navItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', backgroundColor: 'transparent', color: '#94a3b8', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', textAlign: 'left', transition: '0.2s' },
  navItemAtivo: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', backgroundColor: '#3b82f6', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', textAlign: 'left', fontWeight: 'bold' },
  logoutButton: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', backgroundColor: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: '14px', marginTop: 'auto' },
  content: { flex: 1, padding: '30px', overflowY: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  pageTitle: { color: '#fff', fontSize: '24px', margin: 0, fontWeight: 'bold' },
  userProfile: { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontWeight: 'bold' },
  cardsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
  card: { backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', border: '1px solid #334155' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' },
  cardHeaderBetween: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { color: '#94a3b8', fontSize: '14px' },
  cardValue: { color: '#fff', fontSize: '32px', margin: '0 0 5px 0', fontWeight: 'bold' },
  cardTrend: { color: '#10b981', fontSize: '12px' },
  sectionTitle: { color: '#fff', fontSize: '16px', fontWeight: 'bold', marginBottom: '15px' },
  select: { backgroundColor: '#0f172a', color: '#94a3b8', border: '1px solid #334155', borderRadius: '6px', padding: '5px 10px', outline: 'none' },
  chartsRow: { display: 'flex', gap: '20px' },
  donutCenterText: { position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none' },
  tablesRow: { display: 'flex', gap: '20px' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
  tableHeader: { borderBottom: '1px solid #334155', textAlign: 'left' },
  th: { color: '#94a3b8', fontSize: '12px', paddingBottom: '15px', fontWeight: 'normal' },
  tableRow: { borderBottom: '1px solid #334155' },
  td: { padding: '15px 0', color: '#cbd5e1', fontSize: '14px' },
  tdBold: { padding: '15px 0', color: '#fff', fontSize: '14px', fontWeight: 'bold' },
  alertsContainer: { display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px', flex: 1 },
  alertItem: { display: 'flex', gap: '12px', alignItems: 'flex-start' },
  verTodosBtn: { marginTop: '15px', backgroundColor: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', textAlign: 'center', fontSize: '14px' },
  placeholder: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60%', border: '2px dashed #334155', borderRadius: '12px' }
};

export default PainelPrincipal;
