import React, { useState } from 'react';
import { Search, Plus, Trash2, X, Briefcase, FileText, Calendar, DollarSign, AlertCircle } from 'lucide-react';

// Mocks (Dados Falsos) de Contratos
const contratosIniciais = [
  { id: 1, atleta: 'João Silva', clube: 'Clube A', salario: 'R$ 150.000', multa: 'R$ 50.000.000', inicio: '10/01/2024', fim: '31/12/2027', status: 'Ativo' },
  { id: 2, atleta: 'Gabriel Costa', clube: 'Sem Clube', salario: '-', multa: '-', inicio: '-', fim: '-', status: 'Livre' },
  { id: 3, atleta: 'Pedro Santos', clube: 'Clube C', salario: 'R$ 80.000', multa: 'R$ 15.000.000', inicio: '15/06/2025', fim: '15/06/2026', status: 'Vencendo' },
  { id: 4, atleta: 'Lucas Pereira', clube: 'Clube A', salario: 'R$ 200.000', multa: 'R$ 35.000.000', inicio: '01/01/2022', fim: '31/12/2024', status: 'Encerrado' },
];

const ClubesContratos = () => {
  const [busca, setBusca] = useState('');
  const [contratos, setContratos] = useState(contratosIniciais);
  
  // Controle do Modal
  const [modalAberto, setModalAberto] = useState(false);
  const [formContrato, setFormContrato] = useState({
    atleta: '', clube: '', salario: '', multa: '', inicio: '', fim: '', status: 'Ativo'
  });

  const handleDelete = (id) => {
    if (window.confirm("Deseja remover o registro deste contrato?")) {
      setContratos(contratos.filter(c => c.id !== id));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormContrato(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    const novoContrato = { ...formContrato, id: contratos.length + 1 };
    setContratos([novoContrato, ...contratos]);
    setModalAberto(false);
    setFormContrato({ atleta: '', clube: '', salario: '', multa: '', inicio: '', fim: '', status: 'Ativo' });
  };

  const contratosFiltrados = contratos.filter(c => 
    c.atleta.toLowerCase().includes(busca.toLowerCase()) || 
    c.clube.toLowerCase().includes(busca.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Ativo': return { bg: '#10b98120', text: '#10b981', border: '#10b981' };
      case 'Vencendo': return { bg: '#f59e0b20', text: '#f59e0b', border: '#f59e0b' };
      case 'Livre': return { bg: '#3b82f620', text: '#3b82f6', border: '#3b82f6' };
      default: return { bg: '#ef444420', text: '#ef4444', border: '#ef4444' };
    }
  };

  return (
    <div style={styles.container}>
      
      {/* Cards de Resumo (KPIs Financeiros) */}
      <div style={styles.cardsGrid}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <Briefcase size={20} color="#3b82f6" />
            <span style={styles.cardTitle}>Contratos Ativos</span>
          </div>
          <h3 style={styles.cardValue}>24</h3>
          <span style={{ color: '#94a3b8', fontSize: '12px' }}>Atletas vinculados a clubes</span>
        </div>
        
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <AlertCircle size={20} color="#f59e0b" />
            <span style={styles.cardTitle}>Vencendo em Breve</span>
          </div>
          <h3 style={styles.cardValue}>5</h3>
          <span style={{ color: '#94a3b8', fontSize: '12px' }}>Fim de contrato em &lt; 6 meses</span>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <DollarSign size={20} color="#10b981" />
            <span style={styles.cardTitle}>Mercado Aberto</span>
          </div>
          <h3 style={styles.cardValue}>3</h3>
          <span style={{ color: '#94a3b8', fontSize: '12px' }}>Atletas livres para assinar</span>
        </div>
      </div>

      {/* Barra superior de ações */}
      <div style={styles.topBar}>
        <div style={styles.searchBox}>
          <Search size={18} color="#94a3b8" />
          <input 
            type="text" 
            placeholder="Buscar por atleta ou clube..." 
            style={styles.searchInput}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <button style={styles.addButton} onClick={() => setModalAberto(true)}>
          <Plus size={18} /> Registrar Contrato
        </button>
      </div>

      {/* Tabela de Gestão de Contratos */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Atleta</th>
              <th style={styles.th}>Clube Atual</th>
              <th style={styles.th}>Vigência</th>
              <th style={styles.th}>Salário Mensal</th>
              <th style={styles.th}>Multa Rescisória</th>
              <th style={styles.th}>Status</th>
              <th style={{...styles.th, textAlign: 'center'}}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {contratosFiltrados.map((contrato) => {
              const badge = getStatusBadge(contrato.status);
              return (
                <tr key={contrato.id} style={styles.tableRow}>
                  <td style={styles.tdBold}>{contrato.atleta}</td>
                  <td style={styles.td}>
                    {contrato.clube !== 'Sem Clube' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#334155', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '10px' }}>
                          C
                        </div>
                        {contrato.clube}
                      </div>
                    ) : (
                      <span style={{ color: '#64748b', fontStyle: 'italic' }}>Sem Clube</span>
                    )}
                  </td>
                  <td style={styles.td}>
                    {contrato.inicio !== '-' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', fontSize: '12px' }}>
                        <span style={{ color: '#cbd5e1' }}>Início: {contrato.inicio}</span>
                        <span style={{ color: '#94a3b8' }}>Fim: {contrato.fim}</span>
                      </div>
                    ) : '-'}
                  </td>
                  <td style={styles.td}>{contrato.salario}</td>
                  <td style={styles.tdBold}>{contrato.multa}</td>
                  <td style={styles.td}>
                    <span style={{ padding: '4px 8px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', backgroundColor: badge.bg, color: badge.text, border: `1px solid ${badge.border}40` }}>
                      {contrato.status}
                    </span>
                  </td>
                  <td style={styles.tdActions}>
                    <button style={styles.actionBtn} title="Remover Contrato" onClick={() => handleDelete(contrato.id)}>
                      <Trash2 size={18} color="#ef4444" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL DE REGISTRO DE CONTRATO */}
      {modalAberto && (
        <div style={styles.modalOverlay}>
          <form onSubmit={handleSave} style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={24} color="#3b82f6" />
                <h3 style={styles.modalTitle}>Registrar Novo Contrato/Transferência</h3>
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
                    <input type="text" name="atleta" required value={formContrato.atleta} onChange={handleChange} placeholder="Nome do jogador..." style={styles.inputModal} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>Status</label>
                    <select name="status" value={formContrato.status} onChange={handleChange} style={styles.inputModal}>
                      <option value="Ativo">Ativo</option>
                      <option value="Vencendo">Vencendo (Aviso)</option>
                      <option value="Livre">Livre no Mercado</option>
                      <option value="Encerrado">Encerrado</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>Clube Vinculado</label>
                    <input type="text" name="clube" required value={formContrato.clube} onChange={handleChange} placeholder="Nome do clube" style={styles.inputModal} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>Data de Início</label>
                    <input type="text" name="inicio" value={formContrato.inicio} onChange={handleChange} placeholder="DD/MM/AAAA" style={styles.inputModal} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>Data de Fim (Vencimento)</label>
                    <input type="text" name="fim" value={formContrato.fim} onChange={handleChange} placeholder="DD/MM/AAAA" style={styles.inputModal} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>Salário Mensal Estimado</label>
                    <input type="text" name="salario" value={formContrato.salario} onChange={handleChange} placeholder="Ex: R$ 150.000" style={styles.inputModal} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>Multa Rescisória</label>
                    <input type="text" name="multa" value={formContrato.multa} onChange={handleChange} placeholder="Ex: R$ 50.000.000" style={styles.inputModal} />
                  </div>
                </div>

              </div>
            </div>

            <div style={styles.modalFooter}>
              <button type="button" style={styles.btnCancel} onClick={() => setModalAberto(false)}>Cancelar</button>
              <button type="submit" style={styles.btnSave}>Salvar Contrato</button>
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
  cardsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
  card: { backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' },
  cardTitle: { color: '#94a3b8', fontSize: '14px', fontWeight: 'bold' },
  cardValue: { color: '#fff', fontSize: '32px', margin: '0 0 5px 0', fontWeight: 'bold' },
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
  tdActions: { padding: '15px 0', display: 'flex', gap: '10px', justifyContent: 'center' },
  actionBtn: { backgroundColor: 'transparent', border: 'none', cursor: 'pointer', padding: '5px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
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

export default ClubesContratos;