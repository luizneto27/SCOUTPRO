import React, { useEffect, useMemo, useState } from 'react';
import { Search, Plus, AlertTriangle, CheckCircle, Clock, Edit, RefreshCw, X, Trash2 } from 'lucide-react';
import { createLesao, deleteLesao, getResumoLesoes, isAuthError, listJogadores, listLesoes, updateLesao } from '../lib/api';

const TOKEN_KEY = 'scoutpro.token';

const emptyForm = {
  id: null,
  jogadorId: '',
  tipoLesao: '',
  gravidade: 'LEVE',
  dataLesao: '',
  tempoRecuperacao: '',
  statusRecuperacao: 'EM_RECUPERACAO',
};

const RegistroLesoes = ({ onSessionExpired }) => {
  const [busca, setBusca] = useState('');
  const [jogadores, setJogadores] = useState([]);
  const [lesoes, setLesoes] = useState([]);
  const [resumo, setResumo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [modoModal, setModoModal] = useState('novo');
  const [formLesao, setFormLesao] = useState(emptyForm);

  const carregarDados = async () => {
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setError('Sessao expirada. Faça login novamente.');
      onSessionExpired?.();
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [jogadoresData, lesoesData, resumoData] = await Promise.all([
        listJogadores(token, { size: 200 }),
        listLesoes(token),
        getResumoLesoes(token),
      ]);

      setJogadores(jogadoresData?.content ?? []);
      setLesoes(lesoesData ?? []);
      setResumo(resumoData);
      setError('');
    } catch (err) {
      if (isAuthError(err)) {
        setError('Sessao expirada. Faça login novamente.');
        onSessionExpired?.();
      } else {
        setError(err.message || 'Falha ao carregar lesoes.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormLesao(prev => ({ ...prev, [name]: value }));
  };

  const abrirNovo = () => {
    setModoModal('novo');
    setFormLesao(emptyForm);
    setModalAberto(true);
  };

  const abrirEditar = (lesao) => {
    setModoModal('editar');
    setFormLesao({
      id: lesao.id,
      jogadorId: String(lesao.jogadorId),
      tipoLesao: lesao.tipoLesao ?? '',
      gravidade: lesao.gravidade ?? 'LEVE',
      dataLesao: lesao.dataLesao ?? '',
      tempoRecuperacao: lesao.tempoRecuperacao != null ? String(lesao.tempoRecuperacao) : '',
      statusRecuperacao: lesao.statusRecuperacao ?? 'EM_RECUPERACAO',
    });
    setModalAberto(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const token = window.localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setError('Sessao expirada. Faça login novamente.');
      onSessionExpired?.();
      return;
    }

    const payload = {
      jogadorId: Number(formLesao.jogadorId),
      tipoLesao: formLesao.tipoLesao,
      gravidade: formLesao.gravidade || null,
      dataLesao: formLesao.dataLesao,
      tempoRecuperacao: formLesao.tempoRecuperacao === '' ? null : Number(formLesao.tempoRecuperacao),
      statusRecuperacao: formLesao.statusRecuperacao || null,
    };

    try {
      if (modoModal === 'novo') {
        await createLesao(token, payload);
      } else {
        await updateLesao(token, formLesao.id, payload);
      }
      await carregarDados();
      setModalAberto(false);
      setFormLesao(emptyForm);
      setError('');
    } catch (err) {
      if (isAuthError(err)) {
        setError('Sessao expirada. Faça login novamente.');
        onSessionExpired?.();
      } else {
        setError(err.message || 'Falha ao salvar lesao.');
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deseja remover este registro de lesao?')) {
      return;
    }

    const token = window.localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setError('Sessao expirada. Faça login novamente.');
      onSessionExpired?.();
      return;
    }

    try {
      await deleteLesao(token, id);
      await carregarDados();
      setError('');
    } catch (err) {
      if (isAuthError(err)) {
        setError('Sessao expirada. Faça login novamente.');
        onSessionExpired?.();
      } else {
        setError(err.message || 'Falha ao excluir lesao.');
      }
    }
  };

  const lesoesFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) {
      return lesoes;
    }

    return lesoes.filter((lesao) =>
      [
        lesao.jogadorNome,
        lesao.tipoLesao,
        lesao.gravidade,
        lesao.statusRecuperacao,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(termo))
    );
  }, [busca, lesoes]);

  const formatarData = (valor) => {
    if (!valor) {
      return '-';
    }
    const data = new Date(`${valor}T00:00:00`);
    return Number.isNaN(data.getTime()) ? valor : data.toLocaleDateString('pt-BR');
  };

  const getLabelGravidade = (gravidade) => {
    const labels = {
      LEVE: 'Baixa',
      MODERADA: 'Media',
      GRAVE: 'Alta',
    };
    return labels[gravidade] || gravidade || '-';
  };

  const getLabelStatus = (status) => {
    const labels = {
      EM_RECUPERACAO: 'Em Recuperacao',
      RECUPERADO: 'Recuperado',
      RECAIDA: 'Recaida',
    };
    return labels[status] || status || '-';
  };

  const getCorGravidade = (gravidade) => {
    switch(gravidade) {
      case 'GRAVE': return { bg: '#ef444420', text: '#fca5a5', border: '#ef4444' };
      case 'MODERADA': return { bg: '#f59e0b20', text: '#fcd34d', border: '#f59e0b' };
      default: return { bg: '#10b98120', text: '#6ee7b7', border: '#10b981' };
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.cardsGrid}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <AlertTriangle size={20} color="#ef4444" />
            <span style={styles.cardTitle}>No Departamento Médico</span>
          </div>
          <h3 style={styles.cardValue}>{resumo?.noDepartamentoMedico ?? 0}</h3>
          <span style={{ color: '#94a3b8', fontSize: '12px' }}>Atletas indisponíveis hoje</span>
        </div>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <Clock size={20} color="#f59e0b" />
            <span style={styles.cardTitle}>Retorno Próximo</span>
          </div>
          <h3 style={styles.cardValue}>{resumo?.retornoPrevistoProximos7Dias ?? 0}</h3>
          <span style={{ color: '#94a3b8', fontSize: '12px' }}>Previsão para os próximos 7 dias</span>
        </div>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <CheckCircle size={20} color="#10b981" />
            <span style={styles.cardTitle}>Recuperados no Mês</span>
          </div>
          <h3 style={styles.cardValue}>{resumo?.recuperadasNoMes ?? 0}</h3>
          <span style={{ color: '#94a3b8', fontSize: '12px' }}>Altas médicas recentes</span>
        </div>
      </div>

      <div style={styles.topBar}>
        <div style={styles.searchBox}>
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="Buscar por atleta, tipo, gravidade ou status..."
            style={styles.searchInput}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div style={styles.actionsRow}>
          <button style={styles.refreshButton} onClick={carregarDados}>
            <RefreshCw size={16} /> Atualizar
          </button>
          <button style={styles.addButton} onClick={abrirNovo}>
            <Plus size={18} /> Registrar Lesao
          </button>
        </div>
      </div>

      {error ? <div style={styles.errorBox}>{error}</div> : null}
      {loading ? <div style={styles.loadingBox}>Carregando lesoes...</div> : null}

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Atleta</th>
              <th style={styles.th}>Tipo de Lesao</th>
              <th style={styles.th}>Gravidade</th>
              <th style={styles.th}>Data Ocorrência</th>
              <th style={styles.th}>Previsao de Retorno</th>
              <th style={styles.th}>Status</th>
              <th style={{...styles.th, textAlign: 'center'}}>Acoes</th>
            </tr>
          </thead>
          <tbody>
            {lesoesFiltradas.map((lesao) => {
              const cores = getCorGravidade(lesao.gravidade);
              return (
                <tr key={lesao.id} style={styles.tableRow}>
                  <td style={styles.tdBold}>{lesao.jogadorNome}</td>
                  <td style={styles.td}>{lesao.tipoLesao}</td>
                  <td style={styles.td}>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', backgroundColor: cores.bg, color: cores.text, border: `1px solid ${cores.border}50` }}>
                      {getLabelGravidade(lesao.gravidade)}
                    </span>
                  </td>
                  <td style={styles.td}>{formatarData(lesao.dataLesao)}</td>
                  <td style={styles.td}>{formatarData(lesao.dataPrevistaRetorno)}</td>
                  <td style={styles.td}>{getLabelStatus(lesao.statusRecuperacao)}</td>
                  <td style={styles.tdActions}>
                    <button style={styles.actionBtn} title="Editar" onClick={() => abrirEditar(lesao)}>
                      <Edit size={18} color="#10b981" />
                    </button>
                    <button style={styles.actionBtn} title="Remover Registro" onClick={() => handleDelete(lesao.id)}>
                      <Trash2 size={18} color="#ef4444" />
                    </button>
                  </td>
                </tr>
              )
            })}
            {lesoesFiltradas.length === 0 && (
              <tr>
                <td colSpan="7" style={styles.emptyState}>
                  Nenhuma lesao encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalAberto && (
        <div style={styles.modalOverlay}>
          <form onSubmit={handleSave} style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>{modoModal === 'novo' ? 'Registrar Nova Lesao' : `Editar Lesao #${formLesao.id}`}</h3>
              <button type="button" style={styles.closeBtn} onClick={() => setModalAberto(false)}>
                <X size={24} color="#94a3b8" />
              </button>
            </div>
            <div style={styles.modalBody}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={styles.fieldLabel}>Atleta</label>
                  <select name="jogadorId" required value={formLesao.jogadorId} onChange={handleChange} style={styles.inputModal}>
                    <option value="">Selecione um jogador</option>
                    {jogadores.map((jogador) => (
                      <option key={jogador.id} value={jogador.id}>
                        {jogador.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={styles.fieldLabel}>Diagnostico / Tipo de Lesao</label>
                  <input type="text" name="tipoLesao" required value={formLesao.tipoLesao} onChange={handleChange} placeholder="Ex: Estiramento grau 2 na coxa" style={styles.inputModal} />
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>Gravidade</label>
                    <select name="gravidade" value={formLesao.gravidade} onChange={handleChange} style={styles.inputModal}>
                      <option value="LEVE">Baixa</option>
                      <option value="MODERADA">Media</option>
                      <option value="GRAVE">Alta</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>Status</label>
                    <select name="statusRecuperacao" value={formLesao.statusRecuperacao} onChange={handleChange} style={styles.inputModal}>
                      <option value="EM_RECUPERACAO">Em Recuperacao</option>
                      <option value="RECUPERADO">Recuperado</option>
                      <option value="RECAIDA">Recaida</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>Data da Ocorrencia</label>
                    <input type="date" name="dataLesao" required value={formLesao.dataLesao} onChange={handleChange} style={styles.inputModal} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>Tempo de Recuperacao (dias)</label>
                    <input type="number" name="tempoRecuperacao" min="0" value={formLesao.tempoRecuperacao} onChange={handleChange} style={styles.inputModal} />
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
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px', backgroundColor: '#1e293b', padding: '15px 20px', borderRadius: '12px', border: '1px solid #334155', flexWrap: 'wrap' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#0f172a', padding: '10px 15px', borderRadius: '8px', border: '1px solid #334155', width: '350px' },
  actionsRow: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  searchInput: { backgroundColor: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '14px' },
  addButton: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' },
  refreshButton: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'transparent', color: '#cbd5e1', border: '1px solid #334155', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' },
  errorBox: { backgroundColor: '#7f1d1d', color: '#fecaca', padding: '12px 14px', borderRadius: '10px', border: '1px solid #ef4444' },
  loadingBox: { backgroundColor: '#0f172a', color: '#94a3b8', padding: '12px 14px', borderRadius: '10px', border: '1px solid #334155' },
  tableContainer: { backgroundColor: '#1e293b', borderRadius: '12px', padding: '20px', border: '1px solid #334155', overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHeader: { borderBottom: '1px solid #334155', textAlign: 'left' },
  th: { color: '#94a3b8', fontSize: '13px', paddingBottom: '15px', fontWeight: 'bold', textTransform: 'uppercase' },
  tableRow: { borderBottom: '1px solid #334155' },
  td: { padding: '15px 0', color: '#cbd5e1', fontSize: '14px' },
  tdBold: { padding: '15px 0', color: '#fff', fontSize: '14px', fontWeight: 'bold' },
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
  btnSave: { padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#ef4444', color: '#ffffff', cursor: 'pointer', fontWeight: 'bold' }
};

export default RegistroLesoes;
