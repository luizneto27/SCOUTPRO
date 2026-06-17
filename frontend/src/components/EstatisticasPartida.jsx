import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Calendar, Edit, Plus, RefreshCw, Search, Shield, Trash2, X } from 'lucide-react';
import { createPartida, deletePartida, isAuthError, listCampeonatos, listPartidas, updatePartida } from '../lib/api';

const TOKEN_KEY = 'scoutpro.token';

const emptyForm = {
  id: null,
  data: '',
  competicaoEdicaoId: '',
};

const EstatisticasPartida = ({ onSessionExpired }) => {
  const [busca, setBusca] = useState('');
  const [campeonatos, setCampeonatos] = useState([]);
  const [campeonatoSelecionadoId, setCampeonatoSelecionadoId] = useState('');
  const [partidas, setPartidas] = useState([]);
  const [loadingCampeonatos, setLoadingCampeonatos] = useState(true);
  const [loadingPartidas, setLoadingPartidas] = useState(false);
  const [error, setError] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [modoModal, setModoModal] = useState('novo');
  const [formPartida, setFormPartida] = useState(emptyForm);

  const campeonatoSelecionado = useMemo(
    () => campeonatos.find((item) => String(item.id) === String(campeonatoSelecionadoId)) ?? null,
    [campeonatos, campeonatoSelecionadoId]
  );

  const partidasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) {
      return partidas;
    }

    return partidas.filter((partida) => {
      return [
        partida.id,
        partida.data,
        partida.competicaoEdicaoId,
        campeonatoSelecionado?.nome,
        campeonatoSelecionado?.temporada,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(termo));
    });
  }, [partidas, busca, campeonatoSelecionado]);

  const carregarCampeonatos = async () => {
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setError('Sessao expirada. Faça login novamente.');
      onSessionExpired?.();
      setLoadingCampeonatos(false);
      return;
    }

    try {
      const data = await listCampeonatos(token, { size: 100 });
      const itens = data?.content ?? [];
      setCampeonatos(itens);
      if (!campeonatoSelecionadoId && itens.length > 0) {
        setCampeonatoSelecionadoId(String(itens[0].id));
      }
      setError('');
    } catch (err) {
      if (isAuthError(err)) {
        setError('Sessao expirada. Faça login novamente.');
        onSessionExpired?.();
      } else {
        setError(err.message || 'Falha ao carregar campeonatos.');
      }
    } finally {
      setLoadingCampeonatos(false);
    }
  };

  const carregarPartidas = async (campeonatoId) => {
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setError('Sessao expirada. Faça login novamente.');
      onSessionExpired?.();
      return;
    }

    if (!campeonatoId) {
      setPartidas([]);
      return;
    }

    setLoadingPartidas(true);
    try {
      const data = await listPartidas(token, campeonatoId, { size: 100 });
      setPartidas(data?.content ?? []);
      setError('');
    } catch (err) {
      if (isAuthError(err)) {
        setError('Sessao expirada. Faça login novamente.');
        onSessionExpired?.();
      } else {
        setError(err.message || 'Falha ao carregar partidas.');
      }
    } finally {
      setLoadingPartidas(false);
    }
  };

  useEffect(() => {
    carregarCampeonatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (campeonatoSelecionadoId) {
      carregarPartidas(campeonatoSelecionadoId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campeonatoSelecionadoId]);

  const abrirNovo = () => {
    setModoModal('novo');
    setFormPartida({
      ...emptyForm,
    });
    setModalAberto(true);
  };

  const abrirEditar = (partida) => {
    setModoModal('editar');
    setFormPartida({
      id: partida.id,
      data: partida.data ?? '',
      competicaoEdicaoId: partida.competicaoEdicaoId ? String(partida.competicaoEdicaoId) : '',
    });
    setModalAberto(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormPartida((prev) => ({ ...prev, [name]: value }));
  };

  const salvar = async (e) => {
    e.preventDefault();

    const token = window.localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setError('Sessao expirada. Faça login novamente.');
      onSessionExpired?.();
      return;
    }

    const payload = {
      data: formPartida.data,
      competicaoEdicaoId: Number(formPartida.competicaoEdicaoId),
    };

    try {
      if (modoModal === 'novo') {
        await createPartida(token, payload);
      } else {
        await updatePartida(token, formPartida.id, payload);
      }

      await carregarPartidas(campeonatoSelecionadoId);
      setModalAberto(false);
      setFormPartida(emptyForm);
      setError('');
    } catch (err) {
      if (isAuthError(err)) {
        setError('Sessao expirada. Faça login novamente.');
        onSessionExpired?.();
      } else {
        setError(err.message || 'Falha ao salvar partida.');
      }
    }
  };

  const remover = async (partida) => {
    if (!window.confirm(`Remover a partida ${partida.id}?`)) {
      return;
    }

    const token = window.localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setError('Sessao expirada. Faça login novamente.');
      onSessionExpired?.();
      return;
    }

    try {
      await deletePartida(token, partida.id);
      setPartidas((current) => current.filter((item) => item.id !== partida.id));
      setError('');
    } catch (err) {
      if (isAuthError(err)) {
        setError('Sessao expirada. Faça login novamente.');
        onSessionExpired?.();
      } else {
        setError(err.message || 'Falha ao excluir partida.');
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.cardsGrid}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <Calendar size={20} color="#3b82f6" />
            <span style={styles.cardTitle}>Partidas carregadas</span>
          </div>
          <h3 style={styles.cardValue}>{partidas.length}</h3>
          <span style={styles.cardHint}>Endpoint /campeonatos/{campeonatoSelecionadoId || ':id'}/partidas</span>
        </div>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <Shield size={20} color="#10b981" />
            <span style={styles.cardTitle}>Campeonato ativo</span>
          </div>
          <h3 style={styles.cardValue}>{campeonatoSelecionado?.nome || '-'}</h3>
          <span style={styles.cardHint}>{campeonatoSelecionado?.temporada || 'Selecione um campeonato'}</span>
        </div>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <AlertTriangle size={20} color="#f59e0b" />
            <span style={styles.cardTitle}>Edição usada no POST</span>
          </div>
          <h3 style={styles.cardValue}>{campeonatos.length}</h3>
          <span style={styles.cardHint}>O frontend ainda precisa do `competicaoEdicaoId`</span>
        </div>
      </div>

      <div style={styles.topBar}>
        <div style={styles.searchBox}>
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="Buscar por id, data ou edição..."
            style={styles.searchInput}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div style={styles.filterGroup}>
          <select
            style={styles.select}
            value={campeonatoSelecionadoId}
            onChange={(e) => setCampeonatoSelecionadoId(e.target.value)}
          >
            <option value="">Selecione um campeonato</option>
            {campeonatos.map((campeonato) => (
              <option key={campeonato.id} value={campeonato.id}>
                {campeonato.nome} {campeonato.temporada ? `- ${campeonato.temporada}` : ''}
              </option>
            ))}
          </select>

          <button style={styles.refreshButton} onClick={() => carregarPartidas(campeonatoSelecionadoId)}>
            <RefreshCw size={16} /> Atualizar
          </button>

          <button style={styles.addButton} onClick={abrirNovo} disabled={!campeonatoSelecionadoId}>
            <Plus size={18} /> Nova Partida
          </button>
        </div>
      </div>

      {error ? <div style={styles.errorBox}>{error}</div> : null}
      {loadingCampeonatos || loadingPartidas ? <div style={styles.loadingBox}>Carregando partidas...</div> : null}

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Data</th>
              <th style={styles.th}>Competição</th>
              <th style={styles.th}>Edição ID</th>
              <th style={{ ...styles.th, textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {partidasFiltradas.map((partida) => (
              <tr key={partida.id} style={styles.tableRow}>
                <td style={styles.tdBold}>#{partida.id}</td>
                <td style={styles.td}>{partida.data || '-'}</td>
                <td style={styles.td}>{campeonatoSelecionado ? campeonatoSelecionado.nome : '-'}</td>
                <td style={styles.td}>
                  <span style={styles.badge}>{partida.competicaoEdicaoId ?? '-'}</span>
                </td>
                <td style={styles.tdActions}>
                  <button style={styles.actionBtn} title="Editar" onClick={() => abrirEditar(partida)}>
                    <Edit size={18} color="#10b981" />
                  </button>
                  <button style={styles.actionBtn} title="Excluir" onClick={() => remover(partida)}>
                    <Trash2 size={18} color="#ef4444" />
                  </button>
                </td>
              </tr>
            ))}
            {partidasFiltradas.length === 0 && (
              <tr>
                <td colSpan="5" style={styles.emptyState}>
                  Nenhuma partida encontrada para este campeonato.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalAberto && (
        <div style={styles.modalOverlay}>
          <form onSubmit={salvar} style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calendar size={24} color="#3b82f6" />
                <h3 style={styles.modalTitle}>{modoModal === 'novo' ? 'Nova Partida' : `Editar Partida #${formPartida.id}`}</h3>
              </div>
              <button type="button" style={styles.closeBtn} onClick={() => setModalAberto(false)}>
                <X size={24} color="#94a3b8" />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>Data da partida</label>
                    <input
                      type="date"
                      name="data"
                      required
                      value={formPartida.data}
                      onChange={handleChange}
                      style={styles.inputModal}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>competicaoEdicaoId</label>
                    <input
                      type="number"
                      name="competicaoEdicaoId"
                      required
                      min="1"
                      value={formPartida.competicaoEdicaoId}
                      onChange={handleChange}
                      style={styles.inputModal}
                    />
                  </div>
                </div>
                <div style={styles.helperText}>
                  O schema de `partidas` exige a edição da competição. O frontend usa o campeonato selecionado apenas para filtrar a listagem.
                </div>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button type="button" style={styles.btnCancel} onClick={() => setModalAberto(false)}>
                Cancelar
              </button>
              <button type="submit" style={styles.btnSave}>
                Salvar Partida
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '20px' },
  cardsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
  card: { backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' },
  cardTitle: { color: '#94a3b8', fontSize: '14px', fontWeight: 'bold' },
  cardValue: { color: '#fff', fontSize: '22px', margin: '0 0 5px 0', fontWeight: 'bold' },
  cardHint: { color: '#94a3b8', fontSize: '12px' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px', backgroundColor: '#1e293b', padding: '15px 20px', borderRadius: '12px', border: '1px solid #334155', flexWrap: 'wrap' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#0f172a', padding: '10px 15px', borderRadius: '8px', border: '1px solid #334155', width: '320px', flex: '1 1 320px' },
  filterGroup: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  searchInput: { backgroundColor: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '14px' },
  select: { backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '8px', padding: '10px 12px', minWidth: '280px', outline: 'none' },
  addButton: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' },
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
  badge: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '4px 10px', borderRadius: '999px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#e2e8f0', fontSize: '13px', fontWeight: 'bold' },
  tdActions: { padding: '15px 0', display: 'flex', gap: '10px', justifyContent: 'center' },
  actionBtn: { backgroundColor: 'transparent', border: 'none', cursor: 'pointer', padding: '5px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  emptyState: { textAlign: 'center', padding: '30px', color: '#94a3b8' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: '#1e293b', padding: '0', borderRadius: '12px', width: '100%', maxWidth: '640px', border: '1px solid #334155', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #334155' },
  modalTitle: { color: '#fff', margin: 0, fontSize: '20px', fontWeight: 'bold' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex' },
  modalBody: { padding: '25px' },
  fieldLabel: { color: '#cbd5e1', fontSize: '13px', display: 'block', marginBottom: '6px' },
  inputModal: { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', outline: 'none', boxSizing: 'border-box', fontSize: '14px' },
  helperText: { color: '#94a3b8', fontSize: '12px', lineHeight: 1.5 },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '20px', borderTop: '1px solid #334155' },
  btnCancel: { padding: '10px 20px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: 'transparent', color: '#cbd5e1', cursor: 'pointer', fontWeight: 'bold' },
  btnSave: { padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#3b82f6', color: '#ffffff', cursor: 'pointer', fontWeight: 'bold' }
};

export default EstatisticasPartida;
