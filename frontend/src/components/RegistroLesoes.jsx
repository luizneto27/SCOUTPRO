import React, { useState } from 'react';
import { Search, Plus, Activity, AlertTriangle, CheckCircle, Clock, X, Trash2 } from 'lucide-react';

// Mocks (Dados Falsos) de Lesões
const lesoesIniciais = [
  { id: 1, atleta: 'João Silva', tipo: 'Torção no Tornozelo Direito', gravidade: 'Média', dataOcorrencia: '10/06/2026', previsaoRetorno: '01/07/2026', status: 'Em Tratamento' },
  { id: 2, atleta: 'Lucas Pereira', tipo: 'Ruptura LCA (Joelho)', gravidade: 'Alta', dataOcorrencia: '15/03/2026', previsaoRetorno: '15/11/2026', status: 'Cirurgia/Fisioterapia' },
  { id: 3, atleta: 'Pedro Santos', tipo: 'Fadiga Muscular - Coxa', gravidade: 'Baixa', dataOcorrencia: '14/06/2026', previsaoRetorno: '20/06/2026', status: 'Recuperação Leve' },
];

const RegistroLesoes = () => {
  const [busca, setBusca] = useState('');
  const [lesoes, setLesoes] = useState(lesoesIniciais);
  
  // Controle do Modal
  const [modalAberto, setModalAberto] = useState(false);
  const [formLesao, setFormLesao] = useState({ atleta: '', tipo: '', gravidade: 'Baixa', dataOcorrencia: '', previsaoRetorno: '', status: 'Em Tratamento' });

  const handleDelete = (id) => {
    if (window.confirm("Deseja remover este registro de lesão?")) {
      setLesoes(lesoes.filter(lesao => lesao.id !== id));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormLesao(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    const novaLesao = { ...formLesao, id: lesoes.length + 1 };
    setLesoes([...lesoes, novaLesao]);
    setModalAberto(false);
    // Limpa o formulário para o próximo
    setFormLesao({ atleta: '', tipo: '', gravidade: 'Baixa', dataOcorrencia: '', previsaoRetorno: '', status: 'Em Tratamento' });
  };

  const lesoesFiltradas = lesoes.filter(lesao => 
    lesao.atleta.toLowerCase().includes(busca.toLowerCase()) || 
    lesao.tipo.toLowerCase().includes(busca.toLowerCase())
  );

  // Função para definir a cor da "etiqueta" de gravidade
  const getCorGravidade = (gravidade) => {
    switch(gravidade) {
      case 'Alta': return { bg: '#ef444420', text: '#fca5a5', border: '#ef4444' };
      case 'Média': return { bg: '#f59e0b20', text: '#fcd34d', border: '#f59e0b' };
      default: return { bg: '#10b98120', text: '#6ee7b7', border: '#10b981' };
    }
  };

  return (
    <div style={styles.container}>
      
      {/* Cards de Resumo (KPIs de Saúde) */}
      <div style={styles.cardsGrid}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <AlertTriangle size={20} color="#ef4444" />
            <span style={styles.cardTitle}>No Departamento Médico</span>
          </div>
          <h3 style={styles.cardValue}>3</h3>
          <span style={{ color: '#94a3b8', fontSize: '12px' }}>Atletas indisponíveis hoje</span>
        </div>
        
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <Clock size={20} color="#f59e0b" />
            <span style={styles.cardTitle}>Retorno Próximo</span>
          </div>
          <h3 style={styles.cardValue}>1</h3>
          <span style={{ color: '#94a3b8', fontSize: '12px' }}>Previsão para os próximos 7 dias</span>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <CheckCircle size={20} color="#10b981" />
            <span style={styles.cardTitle}>Recuperados no Mês</span>
          </div>
          <h3 style={styles.cardValue}>4</h3>
          <span style={{ color: '#94a3b8', fontSize: '12px' }}>Altas médicas recentes</span>
        </div>
      </div>

      {/* Barra superior de ações */}
      <div style={styles.topBar}>
        <div style={styles.searchBox}>
          <Search size={18} color="#94a3b8" />
          <input 
            type="text" 
            placeholder="Buscar por atleta ou tipo de lesão..." 
            style={styles.searchInput}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <button style={styles.addButton} onClick={() => setModalAberto(true)}>
          <Plus size={18} /> Registrar Lesão
        </button>
      </div>

      {/* Tabela de Histórico */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Atleta</th>
              <th style={styles.th}>Tipo de Lesão</th>
              <th style={styles.th}>Gravidade</th>
              <th style={styles.th}>Data Ocorrência</th>
              <th style={styles.th}>Previsão de Retorno</th>
              <th style={styles.th}>Status</th>
              <th style={{...styles.th, textAlign: 'center'}}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {lesoesFiltradas.map((lesao) => {
              const cores = getCorGravidade(lesao.gravidade);
              return (
                <tr key={lesao.id} style={styles.tableRow}>
                  <td style={styles.tdBold}>{lesao.atleta}</td>
                  <td style={styles.td}>{lesao.tipo}</td>
                  <td style={styles.td}>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', backgroundColor: cores.bg, color: cores.text, border: `1px solid ${cores.border}50` }}>
                      {lesao.gravidade}
                    </span>
                  </td>
                  <td style={styles.td}>{lesao.dataOcorrencia}</td>
                  <td style={styles.td}>{lesao.previsaoRetorno}</td>
                  <td style={styles.td}>{lesao.status}</td>
                  <td style={styles.tdActions}>
                    <button style={styles.actionBtn} title="Remover Registro" onClick={() => handleDelete(lesao.id)}>
                      <Trash2 size={18} color="#ef4444" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL DE REGISTRO */}
      {modalAberto && (
        <div style={styles.modalOverlay}>
          <form onSubmit={handleSave} style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Registrar Nova Lesão</h3>
              <button type="button" style={styles.closeBtn} onClick={() => setModalAberto(false)}>
                <X size={24} color="#94a3b8" />
              </button>
            </div>
            
            <div style={styles.modalBody}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                <div>
                  <label style={styles.fieldLabel}>Atleta</label>
                  <input type="text" name="atleta" required value={formLesao.atleta} onChange={handleChange} placeholder="Nome do jogador..." style={styles.inputModal} />
                </div>

                <div>
                  <label style={styles.fieldLabel}>Diagnóstico / Tipo de Lesão</label>
                  <input type="text" name="tipo" required value={formLesao.tipo} onChange={handleChange} placeholder="Ex: Estiramento grau 2 na coxa" style={styles.inputModal} />
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>Gravidade</label>
                    <select name="gravidade" value={formLesao.gravidade} onChange={handleChange} style={styles.inputModal}>
                      <option value="Baixa">Baixa (Dias)</option>
                      <option value="Média">Média (Semanas)</option>
                      <option value="Alta">Alta (Meses)</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>Status Inicial</label>
                    <select name="status" value={formLesao.status} onChange={handleChange} style={styles.inputModal}>
                      <option value="Em Avaliação">Em Avaliação</option>
                      <option value="Em Tratamento">Em Tratamento</option>
                      <option value="Cirurgia/Fisioterapia">Cirurgia/Fisioterapia</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>Data da Ocorrência</label>
                    <input type="text" name="dataOcorrencia" placeholder="DD/MM/AAAA" required value={formLesao.dataOcorrencia} onChange={handleChange} style={styles.inputModal} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>Previsão de Retorno</label>
                    <input type="text" name="previsaoRetorno" placeholder="DD/MM/AAAA" required value={formLesao.previsaoRetorno} onChange={handleChange} style={styles.inputModal} />
                  </div>
                </div>

              </div>
            </div>

            <div style={styles.modalFooter}>
              <button type="button" style={styles.btnCancel} onClick={() => setModalAberto(false)}>Cancelar</button>
              <button type="submit" style={styles.btnSave}>Salvar Registro</button>
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
  addButton: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' },
  tableContainer: { backgroundColor: '#1e293b', borderRadius: '12px', padding: '20px', border: '1px solid #334155', overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHeader: { borderBottom: '1px solid #334155', textAlign: 'left' },
  th: { color: '#94a3b8', fontSize: '13px', paddingBottom: '15px', fontWeight: 'bold', textTransform: 'uppercase' },
  tableRow: { borderBottom: '1px solid #334155' },
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
  btnSave: { padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#ef4444', color: '#ffffff', cursor: 'pointer', fontWeight: 'bold' }
};

export default RegistroLesoes;