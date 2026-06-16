import React, { useState } from 'react';
import { Search, Plus, Trash2, X, BarChart2, Calendar } from 'lucide-react';

// Mocks (Dados Falsos) de Estatísticas por Jogo
const estatisticasIniciais = [
  { id: 1, atleta: 'João Silva', data: '12/06/2026', adversario: 'Clube X', minutos: 90, gols: 1, assistencias: 2, passesCertos: '88%', nota: 8.5 },
  { id: 2, atleta: 'Gabriel Costa', data: '12/06/2026', adversario: 'Clube X', minutos: 90, defesas: 5, golsSofridos: 0, passesCertos: '75%', nota: 8.0 },,
  { id: 3, atleta: 'Pedro Santos', data: '05/06/2026', adversario: 'Clube Y', minutos: 75, gols: 2, assistencias: 0, passesCertos: '82%', nota: 9.2 },
];

const EstatisticasPartida = () => {
  const [busca, setBusca] = useState('');
  const [estatisticas, setEstatisticas] = useState(estatisticasIniciais);
  
  // Controle do Modal
  const [modalAberto, setModalAberto] = useState(false);
  const [formStats, setFormStats] = useState({ 
    atleta: '', data: '', adversario: '', minutos: '', gols: 0, assistencias: 0, passesCertos: '', nota: '' 
  });

  const handleDelete = (id) => {
    if (window.confirm("Deseja remover este registro de partida?")) {
      setEstatisticas(estatisticas.filter(stat => stat.id !== id));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormStats(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    const novaStat = { ...formStats, id: estatisticas.length + 1 };
    setEstatisticas([novaStat, ...estatisticas]); // Adiciona no topo da lista
    setModalAberto(false);
    // Limpa o formulário
    setFormStats({ atleta: '', data: '', adversario: '', minutos: '', gols: 0, assistencias: 0, passesCertos: '', nota: '' });
  };

  const estatisticasFiltradas = estatisticas.filter(stat => 
    stat.atleta.toLowerCase().includes(busca.toLowerCase()) || 
    stat.adversario.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div style={styles.container}>
      
      {/* Barra superior de ações */}
      <div style={styles.topBar}>
        <div style={styles.searchBox}>
          <Search size={18} color="#94a3b8" />
          <input 
            type="text" 
            placeholder="Buscar por atleta ou adversário..." 
            style={styles.searchInput}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <button style={styles.addButton} onClick={() => setModalAberto(true)}>
          <Plus size={18} /> Registrar Partida
        </button>
      </div>

      {/* Tabela de Histórico de Partidas */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Atleta</th>
              <th style={styles.th}>Confronto</th>
              <th style={styles.th}>Minutagem</th>
              <th style={styles.th}>Gols / Defesas</th>
              <th style={styles.th}>Assistências</th>
              <th style={styles.th}>Passes Certos</th>
              <th style={styles.th}>Rating (Nota)</th>
              <th style={{...styles.th, textAlign: 'center'}}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {estatisticasFiltradas.map((stat) => (
              <tr key={stat.id} style={styles.tableRow}>
                <td style={styles.tdBold}>{stat.atleta}</td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={14} color="#94a3b8" />
                    <span>vs {stat.adversario}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>{stat.data}</div>
                </td>
                <td style={styles.td}>{stat.minutos}'</td>
                <td style={styles.td}>{stat.gols !== undefined ? stat.gols : stat.defesas}</td>
                <td style={styles.td}>{stat.assistencias}</td>
                <td style={styles.td}>{stat.passesCertos}</td>
                <td style={styles.td}>
                  <span style={{ 
                    ...styles.ratingBadge, 
                    backgroundColor: stat.nota >= 8 ? '#10b98120' : stat.nota >= 6 ? '#f59e0b20' : '#ef444420',
                    color: stat.nota >= 8 ? '#10b981' : stat.nota >= 6 ? '#f59e0b' : '#ef4444'
                  }}>
                    {stat.nota}
                  </span>
                </td>
                <td style={styles.tdActions}>
                  <button style={styles.actionBtn} title="Remover Registro" onClick={() => handleDelete(stat.id)}>
                    <Trash2 size={18} color="#ef4444" />
                  </button>
                </td>
              </tr>
            ))}
            {estatisticasFiltradas.length === 0 && (
              <tr>
                <td colSpan="8" style={styles.emptyState}>Nenhuma estatística encontrada.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE REGISTRO DE ESTATÍSTICAS */}
      {modalAberto && (
        <div style={styles.modalOverlay}>
          <form onSubmit={handleSave} style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BarChart2 size={24} color="#3b82f6" />
                <h3 style={styles.modalTitle}>Registrar Scout da Partida</h3>
              </div>
              <button type="button" style={styles.closeBtn} onClick={() => setModalAberto(false)}>
                <X size={24} color="#94a3b8" />
              </button>
            </div>
            
            <div style={styles.modalBody}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ flex: 2 }}>
                    <label style={styles.fieldLabel}>Atleta</label>
                    <input type="text" name="atleta" required value={formStats.atleta} onChange={handleChange} placeholder="Nome do jogador..." style={styles.inputModal} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>Rating (Nota 0-10)</label>
                    <input type="number" step="0.1" name="nota" required value={formStats.nota} onChange={handleChange} placeholder="Ex: 8.5" style={styles.inputModal} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>Adversário</label>
                    <input type="text" name="adversario" required value={formStats.adversario} onChange={handleChange} placeholder="Clube adversário" style={styles.inputModal} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>Data da Partida</label>
                    <input type="text" name="data" required value={formStats.data} onChange={handleChange} placeholder="DD/MM/AAAA" style={styles.inputModal} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>Minutos Jogados</label>
                    <input type="number" name="minutos" required value={formStats.minutos} onChange={handleChange} placeholder="Ex: 90" style={styles.inputModal} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>Passes Certos (%)</label>
                    <input type="text" name="passesCertos" required value={formStats.passesCertos} onChange={handleChange} placeholder="Ex: 85%" style={styles.inputModal} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>Gols / Defesas Difíceis</label>
                    <input type="number" name="gols" required value={formStats.gols} onChange={handleChange} style={styles.inputModal} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>Assistências</label>
                    <input type="number" name="assistencias" required value={formStats.assistencias} onChange={handleChange} style={styles.inputModal} />
                  </div>
                </div>

              </div>
            </div>

            <div style={styles.modalFooter}>
              <button type="button" style={styles.btnCancel} onClick={() => setModalAberto(false)}>Cancelar</button>
              <button type="submit" style={styles.btnSave}>Salvar Scout</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// --- ESTILOS ---
const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '20px' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e293b', padding: '15px 20px', borderRadius: '12px', border: '1px solid #334155' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#0f172a', padding: '10px 15px', borderRadius: '8px', border: '1px solid #334155', width: '350px' },
  searchInput: { backgroundColor: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '14px' },
  addButton: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' },
  tableContainer: { backgroundColor: '#1e293b', borderRadius: '12px', padding: '20px', border: '1px solid #334155', overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHeader: { borderBottom: '1px solid #334155', textAlign: 'left' },
  th: { color: '#94a3b8', fontSize: '13px', paddingBottom: '15px', fontWeight: 'bold', textTransform: 'uppercase' },
  tableRow: { borderBottom: '1px solid #334155', transition: '0.2s' },
  td: { padding: '15px 0', color: '#cbd5e1', fontSize: '14px' },
  tdBold: { padding: '15px 0', color: '#fff', fontSize: '14px', fontWeight: 'bold' },
  ratingBadge: { padding: '4px 10px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold' },
  tdActions: { padding: '15px 0', display: 'flex', gap: '10px', justifyContent: 'center' },
  actionBtn: { backgroundColor: 'transparent', border: 'none', cursor: 'pointer', padding: '5px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  emptyState: { textAlign: 'center', padding: '30px', color: '#94a3b8' },
  
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: '#1e293b', padding: '0', borderRadius: '12px', width: '100%', maxWidth: '600px', border: '1px solid #334155', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #334155' },
  modalTitle: { color: '#fff', margin: 0, fontSize: '20px', fontWeight: 'bold' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex' },
  modalBody: { padding: '25px' },
  fieldLabel: { color: '#cbd5e1', fontSize: '13px', display: 'block', marginBottom: '6px' },
  inputModal: { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', outline: 'none', boxSizing: 'border-box', fontSize: '14px' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '20px', borderTop: '1px solid #334155' },
  btnCancel: { padding: '10px 20px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: 'transparent', color: '#cbd5e1', cursor: 'pointer', fontWeight: 'bold' },
  btnSave: { padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#3b82f6', color: '#ffffff', cursor: 'pointer', fontWeight: 'bold' }
};

export default EstatisticasPartida;